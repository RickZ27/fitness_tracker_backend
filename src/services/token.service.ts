import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWT_SECRET, JWT_REFRESH_SECRET } from '../config';

export interface AccessTokenPayload {
    id: string;
    email: string;
    role: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessExpiresIn: number;
    refreshExpiresIn: number;
}

class TokenService {
    generateTokenPair(payload: AccessTokenPayload): TokenPair {
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
        const refreshToken = jwt.sign({ id: payload.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return {
            accessToken,
            refreshToken,
            accessExpiresIn:  7 * 24 * 60 * 60,
            refreshExpiresIn: 7 * 24 * 60 * 60,
        };
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    }

    verifyRefreshToken(token: string): { id: string } {
        return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    }

    // Only the hash is stored in DB — raw tokens are never persisted
    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}

export const tokenService = new TokenService();