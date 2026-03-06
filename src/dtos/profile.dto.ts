import z from 'zod';
import { ProfileSchema } from '../types/profile.type';

// All fields optional — user can update just one field at a time
export const UpdateProfileDTO = ProfileSchema.partial();
export type UpdateProfileDTO = z.infer<typeof UpdateProfileDTO>;