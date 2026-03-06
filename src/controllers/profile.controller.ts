import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDTO } from '../dtos/profile.dto';
import { LogBodyMetricDTO, GetBodyMetricsQueryDTO } from '../dtos/body.metrics.dto';
import { IUser } from '../models/user.model';

const profileService = new ProfileService();

const getUserId = (req: Request): string => (req.user as IUser)._id.toString();

export class ProfileController {

    // GET /api/profile/me
    getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const profile = await profileService.getProfile(getUserId(req));
            res.status(200).json({ success: true, data: profile });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // PUT /api/profile/me
    updateMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = UpdateProfileDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const profile = await profileService.updateProfile(getUserId(req), parsed.data);
            res.status(200).json({ success: true, message: 'Profile updated', data: profile });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/profile/me/dashboard
    getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dashboard = await profileService.getDashboard(getUserId(req));
            res.status(200).json({ success: true, data: dashboard });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // POST /api/profile/me/body-metrics
    logBodyMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = LogBodyMetricDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const metric = await profileService.logBodyMetric(getUserId(req), parsed.data);
            res.status(201).json({ success: true, message: 'Body metric logged' , data: metric });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/profile/me/body-metrics
    getBodyMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = GetBodyMetricsQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const result = await profileService.getBodyMetrics(getUserId(req), parsed.data);
            res.status(200).json({ success: true, ...result });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/profile/me/body-metrics/latest
    getLatestBodyMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const metric = await profileService.getLatestBodyMetric(getUserId(req));
            res.status(200).json({ success: true, data: metric });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // DELETE /api/profile/me/body-metrics/:id
    deleteBodyMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await profileService.deleteBodyMetric(getUserId(req), req.params.id as string);
            res.status(200).json({ success: true, message: 'Body metric entry deleted' });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
}