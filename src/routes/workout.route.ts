import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';

const router = Router();
const workoutController = new WorkoutController();

router.use(authorizedMiddleware);

// ─── Exercises (read-only for all authenticated users) ────────────────────────
router.get('/exercises',      workoutController.getAllExercises);
router.get('/exercises/:id',  workoutController.getExerciseById);

// ─── Workout Plans ────────────────────────────────────────────────────────────
router.post('/plans',          workoutController.createPlan);
router.get('/plans/my',        workoutController.getMyPlans);
router.get('/plans/public',    workoutController.getPublicPlans);
router.get('/plans/:id',       workoutController.getPlanById);
router.put('/plans/:id',       workoutController.updatePlan);
router.delete('/plans/:id',    workoutController.deletePlan);

export default router;