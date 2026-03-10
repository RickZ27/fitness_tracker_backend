import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Admin Integration Tests', () => {
    const regularUser = {
        username: 'regularuser',
        email: 'regular@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'Regular User',
    };

    let adminToken: string;
    let regularToken: string;

    beforeAll(async () => {
        await UserModel.deleteMany({
            $or: [
                { email: regularUser.email },
                { username: regularUser.username },
                { email: 'admintest@example.com' },
            ],
        });

        // Register regular user
        await request(app).post('/api/auth/register').send(regularUser);
        const regularLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: regularUser.email, password: regularUser.password });
        regularToken = regularLoginRes.body.data.accessToken;  // ← fixed

        // Promote to admin then login again to get admin token
        await UserModel.findOneAndUpdate(
            { email: regularUser.email },
            { role: 'admin' }
        );
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: regularUser.email, password: regularUser.password });
        adminToken = adminLoginRes.body.data.accessToken;  // ← fixed
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            $or: [
                { email: regularUser.email },
                { username: regularUser.username },
            ],
        });
    });

    describe('GET /api/admin/users', () => {
        test('should return all users for admin', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(Array.isArray(response.body.users)).toBe(true);
        });

        test('should reject non-admin from accessing admin users', async () => {
            // regularToken was issued before role change so it has role: user
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${regularToken}`);
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/admin/users/:id', () => {
        test('should get a single user by id', async () => {
            const allRes = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);
            const userId = allRes.body.users?.[0]?._id;

            const response = await request(app)
                .get(`/api/admin/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('_id', userId);
        });
    });

    describe('Admin Exercises', () => {
        let exerciseId: string;

        test('should create an exercise as admin', async () => {
            const response = await request(app)
                .post('/api/admin/exercises')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Admin Test Exercise',
                    category: 'strength',
                    muscleGroups: ['chest'],
                    difficulty: 'beginner',
                    equipment: ['bodyweight'],
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            exerciseId = response.body.data?._id;
        });

        test('should delete an exercise as admin', async () => {
            const response = await request(app)
                .delete(`/api/admin/exercises/${exerciseId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });
});