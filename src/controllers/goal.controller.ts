import { Request, Response, NextFunction } from 'express';
import { GoalService } from '../services/goal.service';
import { CreateGoalDTO, UpdateGoalDTO, GoalQueryDTO } from '../dtos/goal.dto';
import { IUser } from '../models/user.model';

const goalService = new GoalService();
const getUserId = (req: Request): string => (req.user as IUser)._id.toString();

export class GoalController {

    // POST /api/goals
    createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = CreateGoalDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const goal = await goalService.createGoal(getUserId(req), parsed.data);
            res.status(201).json({ success: true, message: 'Goal created', data: goal });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/goals
    getGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = GoalQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const result = await goalService.getGoals(getUserId(req), parsed.data);
            res.status(200).json({ success: true, ...result });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/goals/summary
    getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const summary = await goalService.getSummary(getUserId(req));
            res.status(200).json({ success: true, data: summary });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/goals/:id
    getGoalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const goal = await goalService.getGoalById(getUserId(req), Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            res.status(200).json({ success: true, data: goal });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // PUT /api/goals/:id
    updateGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = UpdateGoalDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const goal = await goalService.updateGoal(getUserId(req), Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, parsed.data);
            res.status(200).json({ success: true, message: 'Goal updated', data: goal });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // DELETE /api/goals/:id
    deleteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await goalService.deleteGoal(getUserId(req), Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            res.status(200).json({ success: true, message: 'Goal deleted' });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // PATCH /api/goals/:id/complete
    markComplete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const goal = await goalService.markComplete(getUserId(req), Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            res.status(200).json({ success: true, message: 'Goal marked as completed', data: goal });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // PATCH /api/goals/:id/abandon
    markAbandoned = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const goal = await goalService.markAbandoned(getUserId(req), Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            res.status(200).json({ success: true, message: 'Goal marked as abandoned', data: goal });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
}