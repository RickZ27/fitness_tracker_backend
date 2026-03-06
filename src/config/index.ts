import dotenv from "dotenv";
dotenv.config();

export const PORT: number =
    process.env.PORT ? parseInt(process.env.PORT) : 3000;

export const MONGODB_URI: string =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitness-tracker';

export const JWT_SECRET: string =
    process.env.JWT_SECRET || 'default';

// Refresh secret is not in .env — derived from JWT_SECRET so it still works.
// For production, add JWT_REFRESH_SECRET to your .env separately.
export const JWT_REFRESH_SECRET: string =
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh' || 'default_refresh';

// Email — matches your .env variable names exactly
export const EMAIL_USER: string = process.env.EMAIL_USER || '';
export const EMAIL_PASS: string = process.env.EMAIL_PASS || '';
export const CLIENT_URL: string = process.env.CLIENT_URL || 'http://localhost:3000';