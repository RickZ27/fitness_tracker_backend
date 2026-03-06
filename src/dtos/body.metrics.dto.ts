import z from 'zod';
import { WeightUnitEnum } from '../types/profile.type';
import { PaginationSchema, DateRangeSchema } from '../types/query.type';

export const LogBodyMetricDTO = z.object({
    weightKg:       z.number().min(1).max(700),
    bodyFatPercent: z.number().min(1).max(100).optional(),
    waistCm:        z.number().min(20).max(300).optional(),
    hipsCm:         z.number().min(20).max(300).optional(),
    chestCm:        z.number().min(20).max(300).optional(),
    neckCm:         z.number().min(10).max(100).optional(),
    bicepCm:        z.number().min(10).max(100).optional(),
    thighCm:        z.number().min(10).max(100).optional(),
    loggedAt:       z.string().optional(), // ISO date string, defaults to now
    inputUnit:      WeightUnitEnum.optional(), // client reference only, storage is always kg
});
export type LogBodyMetricDTO = z.infer<typeof LogBodyMetricDTO>;

// Merges pagination + date range for query params
export const GetBodyMetricsQueryDTO = PaginationSchema.merge(DateRangeSchema).extend({
    limit: z.coerce.number().min(1).max(100).default(30),
});
export type GetBodyMetricsQueryDTO = z.infer<typeof GetBodyMetricsQueryDTO>;