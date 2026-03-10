import { UserService } from '../../../services/user.service';
import { UserModel } from '../../../models/user.model';
import mongoose from 'mongoose';

describe('User Service Unit Tests', () => {
    let userService: UserService;

    beforeAll(() => {
        userService = new UserService();
    });

    afterEach(async () => {
        await UserModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('should create a new user and return user data', async () => {
        const result = await userService.createUser({
            username: 'serviceuser',
            email: 'service@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            fullName: 'Service User',
        });
        expect(result).toBeDefined();
        expect(result.email).toBe('service@example.com');
    });

    test('should throw 403 on duplicate email', async () => {
        await userService.createUser({
            username: 'dupuser',
            email: 'dup@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            fullName: 'Dup User',
        });
        await expect(
            userService.createUser({
                username: 'dupuser2',
                email: 'dup@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                fullName: 'Dup User 2',
            })
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    test('should throw error on duplicate username', async () => {
        await userService.createUser({
            username: 'sameuser',
            email: 'sameuser1@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            fullName: 'Same User',
        });
        await expect(
            userService.createUser({
                username: 'sameuser',
                email: 'sameuser2@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!',
                fullName: 'Same User 2',
            })
        ).rejects.toThrow();
    });

    test('should login with correct credentials and return token and user', async () => {
        await userService.createUser({
            username: 'loginuser',
            email: 'login@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            fullName: 'Login User',
        });
        const result = await userService.loginUser({
            email: 'login@example.com',
            password: 'Password123!',
        });
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('user');
    });

    test('should throw 401 on wrong password', async () => {
        await userService.createUser({
            username: 'wrongpass',
            email: 'wrongpass@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            fullName: 'Wrong Pass',
        });
        await expect(
            userService.loginUser({
                email: 'wrongpass@example.com',
                password: 'WrongPassword!',
            })
        ).rejects.toMatchObject({ statusCode: 401 });
    });

    test('should throw 404 on non-existent email login', async () => {
        await expect(
            userService.loginUser({
                email: 'ghost@example.com',
                password: 'Password123!',
            })
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    test('should hash password — stored password must not equal plaintext', async () => {
        await userService.createUser({
            username: 'hashtest',
            email: 'hash@example.com',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            fullName: 'Hash Test',
        });
        const dbUser = await UserModel.findOne({ email: 'hash@example.com' }).select('+password');
        expect(dbUser?.password).not.toBe('Password123!');
        expect(dbUser?.password).toMatch(/^\$2[ab]\$/);
    });
});