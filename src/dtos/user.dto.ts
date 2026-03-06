import z from 'zod';
import { UserSchema } from '../types/user.type';

// Re-use UserSchema from types — teacher's exact pattern
export const CreateUserDTO = UserSchema.pick({
    fullName: true,
    email:    true,
    username: true,
    password: true,
    imageUrl: true,
}).extend({
    confirmPassword: z.string().min(8),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }
);
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email:    z.string().email(),
    password: z.string().min(1, { message: 'Password is required' }),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.pick({
    fullName: true,
    username: true,
}).partial(); // all attributes optional
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const RequestPasswordResetDTO = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
});
export type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetDTO>;

export const ResetPasswordDTO = z.object({
    newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;