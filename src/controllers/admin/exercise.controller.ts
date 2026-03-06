import { Request, Response, NextFunction } from 'express';
import { AdminExerciseService } from '../../services/admin/exercise.service';
import { CreateExerciseDTO, UpdateExerciseDTO, ExerciseQueryDTO } from '../../dtos/workout.dto';
import { IUser } from '../../models/user.model';

const adminExerciseService = new AdminExerciseService();

export class AdminExerciseController {

    // GET /api/admin/exercises
    getAllExercises = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = ExerciseQueryDTO.safeParse(req.query);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const result = await adminExerciseService.getAllExercises(parsed.data);
            res.status(200).json({ success: true, ...result });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // POST /api/admin/exercises
    createExercise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = CreateExerciseDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const adminId  = (req.user as IUser)._id.toString();
            const exercise = await adminExerciseService.createExercise(parsed.data, adminId);
            res.status(201).json({ success: true, message: 'Exercise created', data: exercise });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // PUT /api/admin/exercises/:id
    updateExercise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = UpdateExerciseDTO.safeParse(req.body);
            if (!parsed.success) {
                res.status(400).json({ success: false, message: parsed.error.issues[0].message });
                return;
            }
            const exercise = await adminExerciseService.updateExercise(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, parsed.data);
            res.status(200).json({ success: true, message: 'Exercise updated', data: exercise });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // DELETE /api/admin/exercises/:id
    deleteExercise = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await adminExerciseService.deleteExercise(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
            res.status(200).json({ success: true, message: 'Exercise deleted' });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
}