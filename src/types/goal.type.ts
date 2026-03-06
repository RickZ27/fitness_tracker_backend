import z from 'zod';

export const GoalTypeEnum = z.enum([
    'weight',            // target body weight (kg)
    'body_fat',          // target body fat percentage
    'workout_frequency', // target workouts per week
    'custom',            // free-text goal
]);

export const GoalStatusEnum = z.enum([
    'active',
    'completed',
    'abandoned',
]);

export const GoalDirectionEnum = z.enum([
    'decrease', // e.g. lose weight, reduce body fat
    'increase', // e.g. gain muscle, increase workout frequency
]);

// Base schema — reused by DTOs
export const GoalSchema = z.object({
    type:         GoalTypeEnum,
    title:        z.string().min(2).max(100),
    description:  z.string().max(300).optional(),
    targetValue:  z.number().optional(), // required for weight/body_fat/workout_frequency
    currentValue: z.number().optional(), // auto-synced from body metrics for weight/body_fat
    unit:         z.string().max(20).optional(), // e.g. "kg", "%", "workouts/week"
    direction:    GoalDirectionEnum.optional(),
    deadline:     z.string().optional(), // ISO date string
    status:       GoalStatusEnum.default('active'),
});

export type GoalType      = z.infer<typeof GoalTypeEnum>;
export type GoalStatus    = z.infer<typeof GoalStatusEnum>;
export type GoalDirection = z.infer<typeof GoalDirectionEnum>;