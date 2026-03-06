import mongoose from 'mongoose';
import { BodyMetricModel } from '../models/body.metrics.model';
import { GoalModel } from '../models/goal.model';
import { WorkoutPlanModel } from '../models/workoutplan.model';

// Converts a period string like '30d' into a Date in the past
const getPeriodStartDate = (period: string): Date | null => {
    if (period === 'all') return null;
    const now  = new Date();
    const days: Record<string, number> = {
        '7d':   7,
        '30d':  30,
        '90d':  90,
        '180d': 180,
        '1y':   365,
    };
    const d = days[period];
    if (!d) return null;
    return new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
};

export class AnalyticsRepository {

    // ─── Body Metric Trends ───────────────────────────────────────────────────

    // Returns daily/weekly/monthly average weight and body fat, grouped by date
    async getBodyMetricTrend(
        userId: string,
        period: string,
        groupBy: 'day' | 'week' | 'month'
    ) {
        const since  = getPeriodStartDate(period);
        const match: Record<string, any> = { userId: new mongoose.Types.ObjectId(userId) };
        if (since) match.loggedAt = { $gte: since };

        // Build the grouping date format based on groupBy param
        const dateFormat: Record<string, any> = {
            day:   { year: { $year: '$loggedAt' }, month: { $month: '$loggedAt' }, day: { $dayOfMonth: '$loggedAt' } },
            week:  { year: { $year: '$loggedAt' }, week: { $week: '$loggedAt' } },
            month: { year: { $year: '$loggedAt' }, month: { $month: '$loggedAt' } },
        };

        return BodyMetricModel.aggregate([
            { $match: match },
            { $sort:  { loggedAt: 1 } },
            {
                $group: {
                    _id:           dateFormat[groupBy],
                    avgWeight:     { $avg: '$weightKg' },
                    minWeight:     { $min: '$weightKg' },
                    maxWeight:     { $max: '$weightKg' },
                    avgBodyFat:    { $avg: '$bodyFatPercent' },
                    avgBmi:        { $avg: '$bmi' },
                    avgLeanMass:   { $avg: '$leanMassKg' },
                    logsCount:     { $sum: 1 },
                    // Keep the first date of each group for the chart x-axis
                    firstLoggedAt: { $first: '$loggedAt' },
                },
            },
            { $sort: { firstLoggedAt: 1 } },
            {
                $project: {
                    _id:           0,
                    date:          '$firstLoggedAt',
                    avgWeight:     { $round: ['$avgWeight',   2] },
                    minWeight:     { $round: ['$minWeight',   2] },
                    maxWeight:     { $round: ['$maxWeight',   2] },
                    avgBodyFat:    { $round: ['$avgBodyFat',  2] },
                    avgBmi:        { $round: ['$avgBmi',      2] },
                    avgLeanMass:   { $round: ['$avgLeanMass', 2] },
                    logsCount:     1,
                },
            },
        ]);
    }

    // Overall body metric stats for the period (single summary object)
    async getBodyMetricSummary(userId: string, period: string) {
        const since  = getPeriodStartDate(period);
        const match: Record<string, any> = { userId: new mongoose.Types.ObjectId(userId) };
        if (since) match.loggedAt = { $gte: since };

        const result = await BodyMetricModel.aggregate([
            { $match: match },
            { $sort:  { loggedAt: 1 } },
            {
                $group: {
                    _id:         null,
                    startWeight: { $first: '$weightKg' },
                    endWeight:   { $last:  '$weightKg' },
                    lowestWeight:{ $min:   '$weightKg' },
                    highestWeight:{ $max:  '$weightKg' },
                    avgWeight:   { $avg:   '$weightKg' },
                    startBodyFat:{ $first: '$bodyFatPercent' },
                    endBodyFat:  { $last:  '$bodyFatPercent' },
                    avgBmi:      { $avg:   '$bmi' },
                    totalLogs:   { $sum:   1 },
                    firstLog:    { $first: '$loggedAt' },
                    lastLog:     { $last:  '$loggedAt' },
                },
            },
            {
                $addFields: {
                    weightChange:  { $round: [{ $subtract: ['$endWeight',  '$startWeight'] },  2] },
                    bodyFatChange: { $round: [{ $subtract: ['$endBodyFat', '$startBodyFat'] }, 2] },
                    avgWeight:     { $round: ['$avgWeight', 2] },
                    avgBmi:        { $round: ['$avgBmi',    2] },
                },
            },
            { $project: { _id: 0 } },
        ]);

        return result[0] ?? null;
    }

    // ─── Measurement Trends (waist, hips, chest etc.) ─────────────────────────

    async getMeasurementTrend(userId: string, period: string) {
        const since = getPeriodStartDate(period);
        const match: Record<string, any> = { userId: new mongoose.Types.ObjectId(userId) };
        if (since) match.loggedAt = { $gte: since };

        return BodyMetricModel.find(match)
            .sort({ loggedAt: 1 })
            .select('loggedAt waistCm hipsCm chestCm neckCm bicepCm thighCm')
            .lean(); // .lean() returns plain objects — faster for read-only
    }

    // ─── Goal Analytics ───────────────────────────────────────────────────────

    // Returns all active goals enriched with a calculated progressPercent
    async getGoalProgress(userId: string) {
        return GoalModel.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    status: 'active',
                    targetValue:  { $exists: true },
                    currentValue: { $exists: true },
                    direction:    { $exists: true },
                },
            },
            {
                $addFields: {
                    // How far from start to target — we use currentValue vs targetValue
                    progressPercent: {
                        $cond: {
                            if: { $eq: ['$direction', 'decrease'] },
                            then: {
                                // For decrease goals: 100% when current <= target
                                $min: [
                                    100,
                                    {
                                        $max: [
                                            0,
                                            {
                                                $multiply: [
                                                    {
                                                        $divide: [
                                                            { $subtract: ['$currentValue', '$targetValue'] },
                                                            // Avoid div by zero: if current == target, 100%
                                                            { $max: [{ $subtract: ['$currentValue', '$targetValue'] }, 0.001] },
                                                        ],
                                                    },
                                                    -100,
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            else: {
                                // For increase goals: 100% when current >= target
                                $min: [
                                    100,
                                    {
                                        $max: [
                                            0,
                                            {
                                                $multiply: [
                                                    { $divide: ['$currentValue', '$targetValue'] },
                                                    100,
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    // Days remaining until deadline
                    daysRemaining: {
                        $cond: {
                            if:   { $ifNull: ['$deadline', false] },
                            then: {
                                $ceil: {
                                    $divide: [
                                        { $subtract: ['$deadline', new Date()] },
                                        1000 * 60 * 60 * 24,
                                    ],
                                },
                            },
                            else: null,
                        },
                    },
                },
            },
            {
                $project: {
                    title:           1,
                    type:            1,
                    targetValue:     1,
                    currentValue:    1,
                    unit:            1,
                    direction:       1,
                    deadline:        1,
                    progressPercent: { $round: ['$progressPercent', 1] },
                    daysRemaining:   1,
                    status:          1,
                },
            },
            { $sort: { progressPercent: -1 } }, // most progressed first
        ]);
    }

    // Goal completion rate over time
    async getGoalCompletionRate(userId: string) {
        const result = await GoalModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id:       '$status',
                    count:     { $sum: 1 },
                },
            },
        ]);

        const counts: Record<string, number> = { active: 0, completed: 0, abandoned: 0 };
        result.forEach(r => { counts[r._id] = r.count; });
        const total = counts.active + counts.completed + counts.abandoned;

        return {
            total,
            ...counts,
            completionRate: total > 0
                ? parseFloat(((counts.completed / total) * 100).toFixed(1))
                : 0,
        };
    }

    // ─── Workout Stats ────────────────────────────────────────────────────────

    async getWorkoutStats(userId: string) {
        const [totalPlans, publicPlans, plansByDifficulty] = await Promise.all([
            WorkoutPlanModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }),
            WorkoutPlanModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId), isPublic: true }),
            WorkoutPlanModel.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: '$difficulty', count: { $sum: 1 } } },
            ]),
        ]);

        // Total exercises configured across all plans
        const exerciseCountResult = await WorkoutPlanModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$days' },
            { $unwind: '$days.exercises' },
            { $group: { _id: null, totalExercises: { $sum: 1 } } },
        ]);

        return {
            totalPlans,
            publicPlans,
            privatePlans: totalPlans - publicPlans,
            totalExercisesConfigured: exerciseCountResult[0]?.totalExercises ?? 0,
            plansByDifficulty: plansByDifficulty.reduce(
                (acc: Record<string, number>, cur) => { acc[cur._id] = cur.count; return acc; },
                {}
            ),
        };
    }
}