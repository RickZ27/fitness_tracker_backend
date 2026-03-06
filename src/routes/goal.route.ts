import { Router } from 'express';
import { GoalController } from '../controllers/goal.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';

const router = Router();
const goalController = new GoalController();

router.use(authorizedMiddleware);

router.get('/summary',        goalController.getSummary);   // must be before /:id
router.post('/',              goalController.createGoal);
router.get('/',               goalController.getGoals);
router.get('/:id',            goalController.getGoalById);
router.put('/:id',            goalController.updateGoal);
router.delete('/:id',         goalController.deleteGoal);
router.patch('/:id/complete', goalController.markComplete);
router.patch('/:id/abandon',  goalController.markAbandoned);

export default router;