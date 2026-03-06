import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsQueryDTO, TrendQueryDTO } from '../dtos/analytics.dto';
import { IUser } from '../models/user.model';

const analyticsService = new AnalyticsService();
const getUserId = (req: Request): string => (req.user as IUser)._id.toString();

export class AnalyticsController {

    // GET /api/analytics/dashboard?period=30d
    // Returns everything in one call — use this for the main analytics page
    getFullDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = AnalyticsQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const data = await analyticsService.getFullDashboard(getUserId(req), parsed.data);
            res.status(200).json({ success: true, data });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/analytics/body?period=30d&groupBy=day
    // Weight, BMI, body fat, lean mass trends over time
    getBodyTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = TrendQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const data = await analyticsService.getBodyTrend(getUserId(req), parsed.data);
            res.status(200).json({ success: true, data });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/analytics/measurements?period=90d
    // Waist, hips, chest, arms etc. over time
    getMeasurementTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = AnalyticsQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const data = await analyticsService.getMeasurementTrend(getUserId(req), parsed.data);
            res.status(200).json({ success: true, data });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/analytics/goals
    // Progress % on active goals + overall completion rate
    getGoalAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await analyticsService.getGoalAnalytics(getUserId(req));
            res.status(200).json({ success: true, data });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/analytics/workouts
    // Total plans, exercises configured, breakdown by difficulty
    getWorkoutAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await analyticsService.getWorkoutAnalytics(getUserId(req));
            res.status(200).json({ success: true, data });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
}