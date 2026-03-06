import z from 'zod';

export const MuscleGroupEnum = z.enum([
    'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'forearms', 'core', 'glutes', 'quads', 'hamstrings',
    'calves', 'full_body', 'cardio',
]);

export const EquipmentEnum = z.enum([
    'barbell', 'dumbbell', 'machine', 'cable',
    'bodyweight', 'resistance_band', 'kettlebell',
    'pull_up_bar', 'bench', 'none',
]);

export const ExerciseDifficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);

export const ExerciseCategoryEnum = z.enum([
    'strength', 'cardio', 'flexibility', 'balance', 'plyometrics',
]);

export const PlanDifficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);

// A single exercise entry inside a workout day
export const PlanExerciseSchema = z.object({
    exerciseId: z.string().min(1, { message: 'Exercise ID is required' }),
    sets:        z.number().int().min(1).max(20).optional(),
    reps:        z.number().int().min(1).max(200).optional(),
    durationSec: z.number().int().min(1).optional(), // for timed exercises (planks etc)
    restSec:     z.number().int().min(0).max(600).default(60),
    notes:       z.string().max(200).optional(),
    order:       z.number().int().min(1).default(1), // display order within the day
});

// A single day inside a workout plan
export const WorkoutDaySchema = z.object({
    dayNumber: z.number().int().min(1).max(7),
    name:      z.string().min(1).max(50), // e.g. "Push Day", "Leg Day"
    exercises: z.array(PlanExerciseSchema).min(1, { message: 'Add at least one exercise' }),
});

export type MuscleGroup       = z.infer<typeof MuscleGroupEnum>;
export type Equipment         = z.infer<typeof EquipmentEnum>;
export type ExerciseDifficulty = z.infer<typeof ExerciseDifficultyEnum>;
export type ExerciseCategory  = z.infer<typeof ExerciseCategoryEnum>;
export type PlanDifficulty    = z.infer<typeof PlanDifficultyEnum>;
export type PlanExerciseType  = z.infer<typeof PlanExerciseSchema>;
export type WorkoutDayType    = z.infer<typeof WorkoutDaySchema>;