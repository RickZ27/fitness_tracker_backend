import { Router } from "express";
import { adminAnalyticsController } from "../../controllers/admin/analytics.controller";
import { adminMiddleware } from "../../middlewares/authorized.middleware";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();

router.use(authorizedMiddleware, adminMiddleware);

router.get("/", adminAnalyticsController.getAnalytics);

export default router;