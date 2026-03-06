import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authorizedMiddleware);

router.get('/dashboard',     analyticsController.getFullDashboard);   // everything in one call
router.get('/body',          analyticsController.getBodyTrend);        // weight/BMI/body fat trends
router.get('/measurements',  analyticsController.getMeasurementTrend); // waist/hips/chest trends
router.get('/goals',         analyticsController.getGoalAnalytics);    // goal progress + rates
router.get('/workouts',      analyticsController.getWorkoutAnalytics); // workout plan stats

export default router;