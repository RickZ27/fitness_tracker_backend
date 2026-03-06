import { AnalyticsRepository } from '../repositories/analytics.repository';
import { AnalyticsQueryDTO, TrendQueryDTO } from '../dtos/analytics.dto';

export class AnalyticsService {
    private analyticsRepo: AnalyticsRepository;

    constructor() {
        this.analyticsRepo = new AnalyticsRepository();
    }

    // ─── Body Metrics ─────────────────────────────────────────────────────────

    async getBodyTrend(userId: string, query: TrendQueryDTO) {
        const trend   = await this.analyticsRepo.getBodyMetricTrend(userId, query.period, query.groupBy);
        const summary = await this.analyticsRepo.getBodyMetricSummary(userId, query.period);
        return { trend, summary, period: query.period, groupBy: query.groupBy };
    }

    async getMeasurementTrend(userId: string, query: AnalyticsQueryDTO) {
        const data = await this.analyticsRepo.getMeasurementTrend(userId, query.period);
        return { measurements: data, period: query.period };
    }

    // ─── Goals ────────────────────────────────────────────────────────────────

    async getGoalAnalytics(userId: string) {
        const [progress, completionRate] = await Promise.all([
            this.analyticsRepo.getGoalProgress(userId),
            this.analyticsRepo.getGoalCompletionRate(userId),
        ]);
        return { progress, completionRate };
    }

    // ─── Workouts ─────────────────────────────────────────────────────────────

    async getWorkoutAnalytics(userId: string) {
        return this.analyticsRepo.getWorkoutStats(userId);
    }

    // ─── Full Dashboard ───────────────────────────────────────────────────────
    // Single endpoint that returns everything — used by the main analytics page

    async getFullDashboard(userId: string, query: AnalyticsQueryDTO) {
        const [bodyTrend, bodySummary, measurements, goalProgress, completionRate, workoutStats] =
            await Promise.all([
                this.analyticsRepo.getBodyMetricTrend(userId, query.period, 'day'),
                this.analyticsRepo.getBodyMetricSummary(userId, query.period),
                this.analyticsRepo.getMeasurementTrend(userId, query.period),
                this.analyticsRepo.getGoalProgress(userId),
                this.analyticsRepo.getGoalCompletionRate(userId),
                this.analyticsRepo.getWorkoutStats(userId),
            ]);

        return {
            period: query.period,
            body: {
                summary: bodySummary,
                trend:   bodyTrend,
                measurements,
            },
            goals: {
                progress: goalProgress,
                completionRate,
            },
            workouts: workoutStats,
        };
    }
}