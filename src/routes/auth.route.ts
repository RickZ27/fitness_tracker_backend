import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authorizedMiddleware } from '../middlewares/authorized.middleware';
import { uploads } from '../middlewares/upload.middleware';

let authController = new AuthController();
const router = Router();

router.post('/register', authController.register);
router.post('/login',    authController.login);
router.post('/refresh',  authController.refreshTokens);

router.get('/whoami', authorizedMiddleware, authController.getProfile);

router.put(
    '/update-profile',
    authorizedMiddleware,
    uploads.single('image'), // "image" — field name from frontend/client
    authController.updateProfile
);

router.post('/logout',     authorizedMiddleware, authController.logout);
router.post('/logout-all', authorizedMiddleware, authController.logoutAll);

router.post('/request-password-reset', authController.sendResetPasswordEmail);
router.post('/reset-password/:token',  authController.resetPassword);

export default router;