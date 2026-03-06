import mongoose from 'mongoose';
import { BodyMetricModel, IBodyMetric } from '../models/body.metrics.model';
import { GetBodyMetricsQueryDTO } from '../dtos/body.metrics.dto';

export class BodyMetricRepository {
    async create(userId: string, data: Partial<IBodyMetric>): Promise<IBodyMetric> {
        return BodyMetricModel.create({ userId: new mongoose.Types.ObjectId(userId), ...data });
    }

    async findByUserId(userId: string, query: GetBodyMetricsQueryDTO) {
        const limit = query.limit ?? 30;
        const page  = query.page  ?? 1;
        const filter: Record<string, any> = { userId: new mongoose.Types.ObjectId(userId) };

        if (query.startDate || query.endDate) {
            filter.loggedAt = {};
            if (query.startDate) filter.loggedAt.$gte = new Date(query.startDate);
            if (query.endDate)   filter.loggedAt.$lte = new Date(query.endDate);
        }

        const [metrics, total] = await Promise.all([
            BodyMetricModel.find(filter).sort({ loggedAt: -1 }).skip((page - 1) * limit).limit(limit),
            BodyMetricModel.countDocuments(filter),
        ]);

        return { metrics, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findLatestByUserId(userId: string): Promise<IBodyMetric | null> {
        return BodyMetricModel.findOne({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ loggedAt: -1 });
    }

    async findById(id: string, userId: string): Promise<IBodyMetric | null> {
        return BodyMetricModel.findOne({
            _id:    new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
        });
    }

    async deleteById(id: string, userId: string): Promise<boolean> {
        const result = await BodyMetricModel.deleteOne({
            _id:    new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
        });
        return result.deletedCount > 0;
    }

    async getProgressSummary(userId: string, days: number = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const result = await BodyMetricModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), loggedAt: { $gte: since } } },
            { $sort: { loggedAt: 1 } },
            {
                $group: {
                    _id:         null,
                    startWeight: { $first: '$weightKg' },
                    endWeight:   { $last:  '$weightKg' },
                    minWeight:   { $min:   '$weightKg' },
                    maxWeight:   { $max:   '$weightKg' },
                    avgWeight:   { $avg:   '$weightKg' },
                    avgBodyFat:  { $avg:   '$bodyFatPercent' },
                    totalLogs:   { $sum:   1 },
                },
            },
            { $addFields: { weightChange: { $subtract: ['$endWeight', '$startWeight'] } } },
        ]);

        return result[0] ?? null;
    }
}