import { UserModel } from "../../models/user.model";
import { WorkoutPlanModel } from "../../models/workoutplan.model";
import { GoalModel } from "../../models/goal.model";
import { BodyMetricModel } from "../../models/body.metrics.model";
export class AdminAnalyticsRepository {

    async getOverviewStats() {
        const [totalUsers, totalWorkouts, totalGoals, totalMetrics] = await Promise.all([
            UserModel.countDocuments(),
            WorkoutPlanModel.countDocuments(),
            GoalModel.countDocuments(),
            BodyMetricModel.countDocuments(),
        ]);

        const activeThisWeek = await UserModel.countDocuments({
            updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });

        const adminCount = await UserModel.countDocuments({ role: "admin" });

        return { totalUsers, totalWorkouts, totalGoals, totalMetrics, activeThisWeek, adminCount };
    }

    async getUserRegistrationsPerMonth() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const result = await UserModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        return result;
    }

    async getGoalCompletionStats() {
        const result = await GoalModel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);
        return result;
    }

    async getMostPopularExercises() {
        const result = await WorkoutPlanModel.aggregate([
            { $unwind: "$days" },
            { $unwind: "$days.exercises" },
            {
                $group: {
                    _id: "$days.exercises.exerciseId",
                    count: { $sum: 1 },
                    name: { $first: "$days.exercises.name" },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
        ]);
        return result;
    }

    async getWorkoutPlansPerMonth() {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const result = await WorkoutPlanModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
        return result;
    }

    async getRecentUsers(limit = 5) {
        return UserModel.find().sort({ createdAt: -1 }).limit(limit).lean();
    }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();