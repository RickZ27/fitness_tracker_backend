import z from 'zod';
import { GoalSchema, GoalTypeEnum, GoalStatusEnum } from '../types/goal.type';

export const CreateGoalDTO = GoalSchema
    .omit({ status: true }) // user can't set status on creation — always starts as active
    .refine(
        (data) => {
            // targetValue is required for measurable goal types
            const measurable = ['weight', 'body_fat', 'workout_frequency'];
            if (measurable.includes(data.type) && data.targetValue === undefined) return false;
            return true;
        },
        {
            message: 'targetValue is required for weight, body_fat, and workout_frequency goals',
            path: ['targetValue'],
        }
    );
export type CreateGoalDTO = z.infer<typeof CreateGoalDTO>;

export const UpdateGoalDTO = GoalSchema
    .omit({ type: true }) // goal type cannot be changed after creation
    .partial();
export type UpdateGoalDTO = z.infer<typeof UpdateGoalDTO>;

export const GoalQueryDTO = z.object({
    status: GoalStatusEnum.optional(),
    type:   GoalTypeEnum.optional(),
    page:   z.coerce.number().min(1).default(1),
    limit:  z.coerce.number().min(1).max(100).default(20),
});
export type GoalQueryDTO = z.infer<typeof GoalQueryDTO>;