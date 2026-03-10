import { UserRepository } from '../../../repositories/user.repository';
import { UserModel } from '../../../models/user.model';
import mongoose from 'mongoose';

describe('User Repository Unit Tests', () => {
    let userRepository: UserRepository;

    beforeAll(() => {
        userRepository = new UserRepository();
    });

    afterEach(async () => {
        await UserModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('should create a new user', async () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123!',
            fullName: 'Test User',
        };
        const newUser = await userRepository.createUser(userData);
        expect(newUser).toBeDefined();
        expect(newUser.username).toBe(userData.username);
        expect(newUser.email).toBe(userData.email);
    });

    test('should find user by email', async () => {
        await userRepository.createUser({
            username: 'emailuser',
            email: 'emailuser@example.com',
            password: 'Password123!',
            fullName: 'Email User',
        });
        const found = await userRepository.getUserByEmail('emailuser@example.com');
        expect(found).not.toBeNull();
        expect(found?.email).toBe('emailuser@example.com');
    });

    test('should return null for non-existent email', async () => {
        const found = await userRepository.getUserByEmail('nobody@example.com');
        expect(found).toBeNull();
    });

    test('should find user by username', async () => {
        await userRepository.createUser({
            username: 'usernametest',
            email: 'usernametest@example.com',
            password: 'Password123!',
            fullName: 'Username Test',
        });
        const found = await userRepository.getUserByUsername('usernametest');
        expect(found).not.toBeNull();
        expect(found?.username).toBe('usernametest');
    });

    test('should find user by id', async () => {
        const created = await userRepository.createUser({
            username: 'iduser',
            email: 'iduser@example.com',
            password: 'Password123!',
            fullName: 'Id User',
        });
        const found = await userRepository.getUserById(created._id.toString());
        expect(found).not.toBeNull();
        expect(found?._id.toString()).toBe(created._id.toString());
    });

    test('should return null for invalid id format', async () => {
        const found = await userRepository.getUserById('invalid-id');
        expect(found).toBeNull();
    });

    test('should update user fields', async () => {
        const created = await userRepository.createUser({
            username: 'updateuser',
            email: 'updateuser@example.com',
            password: 'Password123!',
            fullName: 'Update User',
        });
        const updated = await userRepository.updateAdminUser(
            created._id.toString(),
            { fullName: 'Updated Name' }
        );
        expect(updated).not.toBeNull();
        expect(updated?.fullName).toBe('Updated Name');
    });

    test('should delete user and return true', async () => {
        const created = await userRepository.createUser({
            username: 'deleteuser',
            email: 'deleteuser@example.com',
            password: 'Password123!',
            fullName: 'Delete User',
        });
        const deleted = await userRepository.deleteUser(created._id.toString());
        expect(deleted).toBe(true);

        const found = await userRepository.getUserById(created._id.toString());
        expect(found).toBeNull();
    });
});