import z from 'zod';

export const AnalyticsPeriodEnum = z.enum(['7d', '30d', '90d', '180d', '1y', 'all']);

export const AnalyticsQueryDTO = z.object({
    period: AnalyticsPeriodEnum.default('30d'),
});
export type AnalyticsQueryDTO = z.infer<typeof AnalyticsQueryDTO>;

export const TrendQueryDTO = z.object({
    period:   AnalyticsPeriodEnum.default('30d'),
    groupBy:  z.enum(['day', 'week', 'month']).default('day'),
});
export type TrendQueryDTO = z.infer<typeof TrendQueryDTO>;