import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Workout Integration Tests', () => {
    const testUser = {
        username: 'workoutuser',
        email: 'workout@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'Workout User',
    };

    let accessToken: string;
    let exerciseId: string;
    let planId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({
            $or: [{ email: testUser.email }, { username: testUser.username }],
        });
        await request(app).post('/api/auth/register').send(testUser);
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        accessToken = loginRes.body.data.accessToken;  // ← fixed

        // Create admin user and get admin token to seed exercise
        await UserModel.findOneAndUpdate(
            { email: testUser.email },
            { role: 'admin' }
        );
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        const adminToken = adminLoginRes.body.data.accessToken;

        // Create a test exercise
        const exRes = await request(app)
            .post('/api/admin/exercises')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Push Up',
                category: 'strength',
                muscleGroups: ['chest', 'triceps'],
                difficulty: 'beginner',
                equipment: ['bodyweight'],
            });
        exerciseId = exRes.body.data?._id;

        // Revert back to user role and get fresh user token
        await UserModel.findOneAndUpdate(
            { email: testUser.email },
            { role: 'user' }
        );
        const userLoginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        accessToken = userLoginRes.body.data.accessToken;
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            $or: [{ email: testUser.email }, { username: testUser.username }],
        });
    });

    describe('GET /api/workouts/exercises', () => {
        test('should return list of exercises', async () => {
            const response = await request(app)
                .get('/api/workouts/exercises')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(Array.isArray(response.body.exercises)).toBe(true);
        });

        test('should reject exercises fetch without token', async () => {
            const response = await request(app).get('/api/workouts/exercises');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('POST /api/workouts/plans', () => {
        test('should create a workout plan successfully', async () => {
            const response = await request(app)
                .post('/api/workouts/plans')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'My Test Plan',
                    difficulty: 'beginner',
                    isPublic: false,
                    days: [
                        {
                            dayNumber: 1,
                            name: 'Day 1',
                            exercises: [
                                { exerciseId, sets: 3, reps: 10, restSec: 60, order: 1 },
                            ],
                        },
                    ],
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('name', 'My Test Plan');
            planId = response.body.data._id;
        });

        test('should not create plan without name', async () => {
            const response = await request(app)
                .post('/api/workouts/plans')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ difficulty: 'beginner' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should reject plan creation without token', async () => {
            const response = await request(app)
                .post('/api/workouts/plans')
                .send({ name: 'Plan', difficulty: 'beginner' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/workouts/plans/my', () => {
        test('should return my workout plans', async () => {
            const response = await request(app)
                .get('/api/workouts/plans/my')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(Array.isArray(response.body.plans)).toBe(true);
        });
    });

    describe('GET /api/workouts/plans/:id', () => {
        test('should return a single workout plan by id', async () => {
            const response = await request(app)
                .get(`/api/workouts/plans/${planId}`)
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('_id', planId);
        });

        test('should return 404 for non-existent plan', async () => {
            const response = await request(app)
                .get('/api/workouts/plans/000000000000000000000000')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('DELETE /api/workouts/plans/:id', () => {
        test('should delete a workout plan', async () => {
            const response = await request(app)
                .delete(`/api/workouts/plans/${planId}`)
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });
});