import { Request, Response, NextFunction } from 'express';
import { WorkoutService } from '../services/workout.service';
import {
    CreateWorkoutPlanDTO,
    UpdateWorkoutPlanDTO,
    WorkoutPlanQueryDTO,
    ExerciseQueryDTO,
} from '../dtos/workout.dto';
import { IUser } from '../models/user.model';

const workoutService = new WorkoutService();
const getUserId = (req: Request): string => (req.user as IUser)._id.toString();

export class WorkoutController {

    // ─── Exercises (read-only for users) ─────────────────────────────────────

    // GET /api/workouts/exercises?search=bench&category=strength&muscleGroup=chest
    getAllExercises = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = ExerciseQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const result = await workoutService.getAllExercises(parsed.data);
            res.status(200).json({ success: true, ...result });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/workouts/exercises/:id
    getExerciseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const exercise = await workoutService.getExerciseById(req.params.id as string);
            res.status(200).json({ success: true, data: exercise });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // ─── Workout Plans ────────────────────────────────────────────────────────

    // POST /api/workouts/plans
    createPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = CreateWorkoutPlanDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const plan = await workoutService.createPlan(getUserId(req), parsed.data);
            res.status(201).json({ success: true, message: 'Workout plan created', data: plan });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/workouts/plans/my
    getMyPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = WorkoutPlanQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const result = await workoutService.getMyPlans(getUserId(req), parsed.data);
            res.status(200).json({ success: true, ...result });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/workouts/plans/public
    getPublicPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = WorkoutPlanQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const result = await workoutService.getPublicPlans(parsed.data);
            res.status(200).json({ success: true, ...result });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/workouts/plans/:id
    getPlanById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const plan = await workoutService.getPlanById(req.params.id as string, getUserId(req));
            res.status(200).json({ success: true, data: plan });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // PUT /api/workouts/plans/:id
    updatePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = UpdateWorkoutPlanDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const plan = await workoutService.updatePlan(getUserId(req), req.params.id as string, parsed.data);
            res.status(200).json({ success: true, message: 'Workout plan updated', data: plan });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // DELETE /api/workouts/plans/:id
    deletePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await workoutService.deletePlan(getUserId(req), req.params.id as string);
            res.status(200).json({ success: true, message: 'Workout plan deleted' });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
}