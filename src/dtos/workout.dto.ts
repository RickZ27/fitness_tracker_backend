import z from 'zod';
import {
    MuscleGroupEnum,
    EquipmentEnum,
    ExerciseDifficultyEnum,
    ExerciseCategoryEnum,
    PlanDifficultyEnum,
    WorkoutDaySchema,
} from '../types/workout.type';

// ─── Exercise DTOs (Admin creates/manages exercises) ──────────────────────────

export const CreateExerciseDTO = z.object({
    name:         z.string().min(2).max(100),
    description:  z.string().max(500).optional(),
    category:     ExerciseCategoryEnum,
    muscleGroups: z.array(MuscleGroupEnum).min(1, { message: 'Select at least one muscle group' }),
    equipment:    z.array(EquipmentEnum).default([]),
    difficulty:   ExerciseDifficultyEnum.default('beginner'),
    instructions: z.string().max(2000).optional(),
    videoUrl:     z.string().url().optional(),
    imageUrl:     z.string().optional(),
});
export type CreateExerciseDTO = z.infer<typeof CreateExerciseDTO>;

export const UpdateExerciseDTO = CreateExerciseDTO.partial();
export type UpdateExerciseDTO = z.infer<typeof UpdateExerciseDTO>;

export const ExerciseQueryDTO = z.object({
    search:      z.string().optional(),
    category:    ExerciseCategoryEnum.optional(),
    muscleGroup: MuscleGroupEnum.optional(),
    equipment:   EquipmentEnum.optional(),
    difficulty:  ExerciseDifficultyEnum.optional(),
    page:        z.coerce.number().min(1).default(1),
    limit:       z.coerce.number().min(1).max(100).default(20),
});
export type ExerciseQueryDTO = z.infer<typeof ExerciseQueryDTO>;

// ─── Workout Plan DTOs (Users create/manage their plans) ──────────────────────

export const CreateWorkoutPlanDTO = z.object({
    name:          z.string().min(2).max(100),
    description:   z.string().max(500).optional(),
    difficulty:    PlanDifficultyEnum.default('beginner'),
    durationWeeks: z.number().int().min(1).max(52).optional(),
    isPublic:      z.boolean().default(false),
    days:          z.array(WorkoutDaySchema).min(1, { message: 'Add at least one day' }),
});
export type CreateWorkoutPlanDTO = z.infer<typeof CreateWorkoutPlanDTO>;

export const UpdateWorkoutPlanDTO = CreateWorkoutPlanDTO.partial();
export type UpdateWorkoutPlanDTO = z.infer<typeof UpdateWorkoutPlanDTO>;

export const WorkoutPlanQueryDTO = z.object({
    page:       z.coerce.number().min(1).default(1),
    limit:      z.coerce.number().min(1).max(100).default(10),
    difficulty: PlanDifficultyEnum.optional(),
    isPublic:   z.coerce.boolean().optional(),
});
export type WorkoutPlanQueryDTO = z.infer<typeof WorkoutPlanQueryDTO>;