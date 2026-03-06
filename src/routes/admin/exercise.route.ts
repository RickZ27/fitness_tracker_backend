import { Router } from 'express';
import { AdminExerciseController } from '../../controllers/admin/exercise.controller';
import { authorizedMiddleware, adminMiddleware } from '../../middlewares/authorized.middleware';

const router = Router();
const adminExerciseController = new AdminExerciseController();

router.use(authorizedMiddleware, adminMiddleware);

router.get('/',       adminExerciseController.getAllExercises);
router.post('/',      adminExerciseController.createExercise);
router.put('/:id',    adminExerciseController.updateExercise);
router.delete('/:id', adminExerciseController.deleteExercise);

export default router;