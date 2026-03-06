import { UserRepository } from '../../repositories/user.repository';
import { IUser } from '../../models/user.model';
import { HttpError } from '../../errors/http-error';

export class AdminUserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async getAllUsers(page: number = 1, limit: number = 20) {
        return this.userRepository.getAllUsers(page, limit);
    }

    async getUserById(id: string): Promise<IUser> {
        const user = await this.userRepository.getUserById(id);
        if (!user) throw new HttpError(404, 'User not found');
        return user;
    }

    async updateUser(id: string, data: Record<string, any>): Promise<IUser> {
        const user = await this.userRepository.updateAdminUser(id, data);  // ← updateAdminUser
        if (!user) throw new HttpError(404, 'User not found');
        return user;
    }

    async deleteUser(id: string): Promise<void> {
        const deleted = await this.userRepository.deleteUser(id);
        if (!deleted) throw new HttpError(404, 'User not found');
    }
}