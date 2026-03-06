import z from 'zod';

export const GenderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
export const FitnessLevelEnum = z.enum(['beginner', 'intermediate', 'advanced']);
export const ActivityLevelEnum = z.enum([
    'sedentary',
    'lightly_active',
    'moderately_active',
    'very_active',
    'extra_active',
]);
export const WeightUnitEnum = z.enum(['kg', 'lbs']);
export const HeightUnitEnum = z.enum(['cm', 'inches']);

// Base Zod schema — reused by profile DTOs
export const ProfileSchema = z.object({
    gender:               GenderEnum.optional(),
    dateOfBirth:          z.string().datetime({ offset: true }).optional()
                            .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
    heightCm:             z.number().min(50).max(300).optional(),
    bio:                  z.string().max(300).optional(),
    fitnessLevel:         FitnessLevelEnum.default('beginner'),
    activityLevel:        ActivityLevelEnum.default('sedentary'),
    preferredWeightUnit:  WeightUnitEnum.default('kg'),
    preferredHeightUnit:  HeightUnitEnum.default('cm'),
});

export type ProfileType = z.infer<typeof ProfileSchema>;

// TypeScript enum-style values for use in Mongoose schema
export type Gender        = z.infer<typeof GenderEnum>;
export type FitnessLevel  = z.infer<typeof FitnessLevelEnum>;
export type ActivityLevel = z.infer<typeof ActivityLevelEnum>;
export type WeightUnit    = z.infer<typeof WeightUnitEnum>;
export type HeightUnit    = z.infer<typeof HeightUnitEnum>;