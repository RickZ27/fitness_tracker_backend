import z from 'zod';

// Base Zod schema — reused by DTOs via .pick(), .partial(), .extend()
// This is the single source of truth for user field shapes and validation rules
export const UserSchema = z.object({
    email:    z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
    username: z.string()
        .min(3,  { message: 'Username must be at least 3 characters' })
        .max(30, { message: 'Username must be at most 30 characters' })
        .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' }),
    fullName: z.string().optional(),
    role:     z.enum(['user', 'admin']).default('user'),
    imageUrl: z.string().optional(),

    // Refresh tokens — managed by the server, never sent from client
    refreshTokens: z.array(z.object({
        tokenHash:  z.string(),
        issuedAt:   z.date(),
        expiresAt:  z.date(),
        deviceInfo: z.string().optional(),
    })).default([]),

    // Password reset — managed by the server only
    passwordResetToken:   z.string().optional(),
    passwordResetExpires: z.date().optional(),
});

export type UserType = z.infer<typeof UserSchema>;