import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { IUser } from '../models/user.model';
import { HttpError } from '../errors/http-error';
import { sendPasswordResetEmail } from '../config/email';

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    async comparePassword(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }

    async register(email: string, username: string, password: string, fullName?: string): Promise<IUser> {
        const [emailExists, usernameExists] = await Promise.all([
            this.userRepository.getUserByEmail(email),
            this.userRepository.getUserByUsername(username),
        ]);
        if (emailExists)    throw new HttpError(409, 'Email is already in use');
        if (usernameExists) throw new HttpError(409, 'Username is already taken');

        const hashedPassword = await this.hashPassword(password);
        const userData = { email, username, password: hashedPassword, ...(fullName && { fullName }) };
        return this.userRepository.createUser(userData);
    }

    async login(email: string, password: string): Promise<IUser> {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) throw new HttpError(401, 'Invalid email or password');

        const isMatch = await this.comparePassword(password, user.password);
        if (!isMatch) throw new HttpError(401, 'Invalid email or password');

        return user;
    }

    async getUserById(id: string): Promise<IUser> {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new HttpError(404, 'User not found');
        return user;
    }

    async updateProfile(
        userId: string,
        data: { fullName?: string; username?: string },
        imageFile?: Express.Multer.File
    ): Promise<IUser> {
        if (data.username) {
            const existing = await this.userRepository.getUserByUsername(data.username);
            if (existing && existing._id.toString() !== userId) {
                throw new HttpError(409, 'Username is already taken');
            }
        }

        const updateData: Partial<IUser> = { ...data } as any;
        if (imageFile) {
            updateData.imageUrl = `/uploads/${imageFile.filename}`;
        }

        const updated = await this.userRepository.updateUser(userId, updateData);
        if (!updated) throw new HttpError(404, 'User not found');
        return updated;
    }

    async sendPasswordReset(email: string): Promise<void> {
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) return; // Silently return — prevents email enumeration

        const rawToken  = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await this.userRepository.setPasswordResetToken(user._id.toString(), tokenHash, expiresAt);
        await sendPasswordResetEmail(user.email, rawToken);
    }

    async resetPassword(rawToken: string, newPassword: string): Promise<void> {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const user = await this.userRepository.getUserByPasswordResetToken(tokenHash);
        if (!user) throw new HttpError(400, 'Reset token is invalid or has expired');

        const hashedPassword = await this.hashPassword(newPassword);
        await this.userRepository.updateUser(user._id.toString(), { password: hashedPassword } as any);
        await this.userRepository.clearPasswordResetToken(user._id.toString());
        // Force re-login on all devices after password change
        await this.userRepository.clearAllRefreshTokens(user._id.toString());
    }
}