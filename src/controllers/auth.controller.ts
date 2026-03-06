import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { tokenService } from '../services/token.service';
import {
    CreateUserDTO,
    LoginUserDTO,
    UpdateUserDTO,
    RequestPasswordResetDTO,
    ResetPasswordDTO,
} from '../dtos/user.dto';
import { IUser } from '../models/user.model';

const REFRESH_TOKEN_TTL_MS  = 7 * 24 * 60 * 60 * 1000;
const MAX_SESSIONS_PER_USER = 5;

const userService    = new UserService();
const userRepository = new UserRepository();

export class AuthController {

    // POST /api/auth/register
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = CreateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }

            const { email, username, password, fullName } = parsed.data;
            const user = await userService.register(email, username, password, fullName);
            const tokenPair = tokenService.generateTokenPair({
                id: user._id.toString(), email: user.email, role: user.role,
            });
            await this.storeRefreshToken(user, tokenPair.refreshToken, req);

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    user: { id: user._id, email: user.email, username: user.username, role: user.role },
                    ...tokenPair,
                },
            });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // POST /api/auth/login
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = LoginUserDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }

            const { email, password } = parsed.data;
            const user = await userService.login(email, password);
            const tokenPair = tokenService.generateTokenPair({
                id: user._id.toString(), email: user.email, role: user.role,
            });
            await this.storeRefreshToken(user, tokenPair.refreshToken, req);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: { id: user._id, email: user.email, username: user.username, role: user.role },
                    ...tokenPair,
                },
            });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // POST /api/auth/refresh
    refreshTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(401).json({ success: false, message: 'Refresh token is required' });
                return;
            }

            let payload;
            try {
                payload = tokenService.verifyRefreshToken(refreshToken);
            } catch {
                res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
                return;
            }

            const user = await userRepository.getUserById(payload.id);
            if (!user) {
                res.status(401).json({ success: false, message: 'User not found' });
                return;
            }

            const incomingHash = tokenService.hashToken(refreshToken);
            const storedToken  = user.refreshTokens.find(rt => rt.tokenHash === incomingHash);

            if (!storedToken) {
                // Token reuse detected — wipe all sessions as a security measure
                await userRepository.clearAllRefreshTokens(user._id.toString());
                res.status(401).json({ success: false, message: 'Refresh token already used. Please log in again.' });
                return;
            }

            // Rotate: invalidate old token, issue new pair
            user.refreshTokens = user.refreshTokens.filter(rt => rt.tokenHash !== incomingHash);
            const newTokenPair = tokenService.generateTokenPair({
                id: user._id.toString(), email: user.email, role: user.role,
            });

            user.removeExpiredRefreshTokens();
            user.refreshTokens.push({
                tokenHash:  tokenService.hashToken(newTokenPair.refreshToken),
                issuedAt:   new Date(),
                expiresAt:  new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
                deviceInfo: storedToken.deviceInfo,
            });

            await userRepository.updateRefreshTokens(user._id.toString(), user.refreshTokens);

            res.status(200).json({ success: true, message: 'Tokens refreshed', data: newTokenPair });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/auth/whoami
    getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as IUser;
            res.status(200).json({
                success: true,
                data: {
                    id:        user._id,
                    email:     user.email,
                    username:  user.username,
                    fullName:  user.fullName,
                    role:      user.role,
                    imageUrl:  user.imageUrl,
                    createdAt: user.createdAt,
                },
            });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // PUT /api/auth/update-profile  (+ optional image upload via multer)
    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = UpdateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }

            const userId    = (req.user as IUser)._id.toString();
            const imageFile = req.file; // set by multer when a file is uploaded
            const updated   = await userService.updateProfile(userId, parsed.data, imageFile);

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    id:       updated._id,
                    email:    updated.email,
                    username: updated.username,
                    fullName: updated.fullName,
                    imageUrl: updated.imageUrl,
                },
            });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // POST /api/auth/logout
    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                const tokenHash = tokenService.hashToken(refreshToken);
                await userRepository.pullRefreshToken((req.user as IUser)._id.toString(), tokenHash);
            }
            res.status(200).json({ success: true, message: 'Logged out successfully' });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // POST /api/auth/logout-all
    logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await userRepository.clearAllRefreshTokens((req.user as IUser)._id.toString());
            res.status(200).json({ success: true, message: 'Logged out from all devices' });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // POST /api/auth/request-password-reset
    sendResetPasswordEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = RequestPasswordResetDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }

            await userService.sendPasswordReset(parsed.data.email);

            // Always 200 — do not reveal whether the email exists
            res.status(200).json({
                success: true,
                message: 'If that email is registered, a reset link has been sent',
            });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // POST /api/auth/reset-password/:token
    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
            const parsed = ResetPasswordDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }

            await userService.resetPassword(token, parsed.data.newPassword);

            res.status(200).json({
                success: true,
                message: 'Password reset successfully. Please log in with your new password.',
            });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private async storeRefreshToken(user: IUser, refreshToken: string, req: Request): Promise<void> {
        user.removeExpiredRefreshTokens();

        if (user.refreshTokens.length >= MAX_SESSIONS_PER_USER) {
            user.refreshTokens.sort((a, b) => a.issuedAt.getTime() - b.issuedAt.getTime());
            user.refreshTokens.splice(0, 1);
        }

        const deviceInfo = req.headers['x-device-info'] as string | undefined;
        user.refreshTokens.push({
            tokenHash:  tokenService.hashToken(refreshToken),
            issuedAt:   new Date(),
            expiresAt:  new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
            deviceInfo,
        });

        await userRepository.updateRefreshTokens(user._id.toString(), user.refreshTokens);
    }
}