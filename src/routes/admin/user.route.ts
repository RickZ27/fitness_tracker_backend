import { Router } from 'express';
import { AdminUserController } from '../../controllers/admin/user.controller';
import { authorizedMiddleware, adminMiddleware } from '../../middlewares/authorized.middleware';
import { uploads } from '../../middlewares/upload.middleware';

const router = Router();
const adminUserController = new AdminUserController();

router.use(authorizedMiddleware, adminMiddleware);

router.get('/',        adminUserController.getAllUsers);
router.get('/:id',     adminUserController.getUserById);
router.put('/:id', uploads.single('image'), adminUserController.updateUser);
router.delete('/:id',  adminUserController.deleteUser);

export default router;