import mongoose from 'mongoose';
import { UserModel, IUser } from '../models/user.model';

export class UserRepository {
    async getUserById(id: string): Promise<IUser | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return UserModel.findById(id);
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email: email.toLowerCase() }).select('+password');
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        return UserModel.findOne({ username });
    }

    async getUserByPasswordResetToken(tokenHash: string): Promise<IUser | null> {
        return UserModel.findOne({
            passwordResetToken:   tokenHash,
            passwordResetExpires: { $gt: new Date() },
        }).select('+passwordResetToken +passwordResetExpires');
    }

    async createUser(data: { email: string; username: string; password: string; fullName?: string }): Promise<IUser> {
        return UserModel.create(data);
    }

    async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    }

    async setPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            $set: { passwordResetToken: tokenHash, passwordResetExpires: expiresAt },
        });
    }

    async clearPasswordResetToken(userId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            $unset: { passwordResetToken: '', passwordResetExpires: '' },
        });
    }

    async updateRefreshTokens(userId: string, refreshTokens: IUser['refreshTokens']): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { $set: { refreshTokens } });
    }

    async clearAllRefreshTokens(userId: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
    }

    async pullRefreshToken(userId: string, tokenHash: string): Promise<void> {
        await UserModel.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: { tokenHash } },
        });
    }

    // Admin
    async getAllUsers(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            UserModel.find().skip(skip).limit(limit).select('-password -refreshTokens'),
            UserModel.countDocuments(),
        ]);
        return { users, total };
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await UserModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    async updateAdminUser(id: string, data: Record<string, any>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    ).select('-password -refreshTokens');
}
}