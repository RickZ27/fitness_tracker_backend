import { Request, Response, NextFunction } from "express";
import { adminAnalyticsService } from "../../services/admin/analytics.service";

export class AdminAnalyticsController {

    getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await adminAnalyticsService.getFullAnalytics();
            res.json({ success: true, data, message: "Analytics fetched successfully" });
        } catch (err) {
            next(err);
        }
    };
}

export const adminAnalyticsController = new AdminAnalyticsController();