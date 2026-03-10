import { adminAnalyticsRepository } from "../../repositories/admin/analytics.repository";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthlyTimeline(raw: { _id: { year: number; month: number }; count: number }[]) {
    // Build last 6 months labels
    const months: { label: string; year: number; month: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ label: MONTH_NAMES[d.getMonth()], year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    return months.map((m) => {
        const found = raw.find((r) => r._id.year === m.year && r._id.month === m.month);
        return { label: m.label, count: found ? found.count : 0 };
    });
}

export class AdminAnalyticsService {

    async getFullAnalytics() {
        const [overview, rawUsers, rawWorkouts, goalStats, popularExercises, recentUsers] =
            await Promise.all([
                adminAnalyticsRepository.getOverviewStats(),
                adminAnalyticsRepository.getUserRegistrationsPerMonth(),
                adminAnalyticsRepository.getWorkoutPlansPerMonth(),
                adminAnalyticsRepository.getGoalCompletionStats(),
                adminAnalyticsRepository.getMostPopularExercises(),
                adminAnalyticsRepository.getRecentUsers(5),
            ]);

        const userRegistrations = buildMonthlyTimeline(rawUsers);
        const workoutsCreated = buildMonthlyTimeline(rawWorkouts);

        const totalGoals = goalStats.reduce((sum: any, s: { count: any; }) => sum + s.count, 0);
        const completedGoals = goalStats.find((s: { _id: string; }) => s._id === "completed")?.count || 0;
        const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        const safeUsers = recentUsers.map((u: any) => ({
            _id: u._id,
            fullName: u.fullName,
            username: u.username,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt,
        }));

        return {
            overview,
            userRegistrations,
            workoutsCreated,
            goalStats: {
                total: totalGoals,
                completed: completedGoals,
                completionRate: goalCompletionRate,
                breakdown: goalStats,
            },
            popularExercises,
            recentUsers: safeUsers,
        };
    }
}

export const adminAnalyticsService = new AdminAnalyticsService();