import z from 'zod';

export const PaginationSchema = z.object({
    page:  z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

export const DateRangeSchema = z.object({
    startDate: z.string().optional(),
    endDate:   z.string().optional(),
});

export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type DateRangeQuery  = z.infer<typeof DateRangeSchema>;