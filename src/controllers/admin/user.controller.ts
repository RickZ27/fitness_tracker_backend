import { Request, Response, NextFunction } from 'express';
import { AdminUserService } from '../../services/admin/user.service';

const adminUserService = new AdminUserService();

export class AdminUserController {

    // GET /api/admin/users?page=1&limit=20
    getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const page  = parseInt(req.query.page  as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const result = await adminUserService.getAllUsers(page, limit);
            res.status(200).json({ success: true, ...result, page });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // GET /api/admin/users/:id
    getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await adminUserService.getUserById(req.params.id as string);
            res.status(200).json({ success: true, data: user });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // PUT /api/admin/users/:id
    updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data: Record<string, any> = {};
            if (req.body.fullName) data.fullName = req.body.fullName;
            if (req.body.email)    data.email    = req.body.email;
            if (req.body.username) data.username = req.body.username;
            if (req.file)          data.imageUrl = `/uploads/${req.file.filename}`;

            const user = await adminUserService.updateUser(req.params.id as string, data);
            res.status(200).json({ success: true, message: 'User updated', data: user });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };

    // DELETE /api/admin/users/:id
    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await adminUserService.deleteUser(req.params.id as string);
            res.status(200).json({ success: true, message: 'User deleted' });
        } catch (err: any) {
            res.status(err.statusCode || 500).json({ success: false, message: err.message });
        }
    };
}