import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';

const router = Router();
const profileController = new ProfileController();

router.use(authorizedMiddleware);

router.get('/me',                     profileController.getMyProfile);
router.put('/me',                     profileController.updateMyProfile);
router.get('/me/dashboard',           profileController.getDashboard);
router.post('/me/body-metrics',       profileController.logBodyMetric);
router.get('/me/body-metrics',        profileController.getBodyMetrics);
router.get('/me/body-metrics/latest', profileController.getLatestBodyMetric);
router.delete('/me/body-metrics/:id', profileController.deleteBodyMetric);

export default router;