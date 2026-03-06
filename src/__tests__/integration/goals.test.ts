import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Goals Integration Tests', () => {
    const testUser = {
        username: 'goaluser',
        email: 'goals@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'Goal User',
    };

    let accessToken: string;
    let goalId: string;

    beforeAll(async () => {
        await UserModel.deleteMany({
            $or: [{ email: testUser.email }, { username: testUser.username }],
        });
        await request(app).post('/api/auth/register').send(testUser);
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        accessToken = loginRes.body.data.accessToken;  // ← fixed
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            $or: [{ email: testUser.email }, { username: testUser.username }],
        });
    });

    describe('POST /api/goals', () => {
        test('should create a weight goal successfully', async () => {
            const response = await request(app)
                .post('/api/goals')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    type: 'weight',
                    title: 'Lose 5kg',
                    targetValue: 70,
                    direction: 'decrease',
                    deadline: '2026-12-31',
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('title', 'Lose 5kg');
            goalId = response.body.data._id;
        });

        test('should create a custom goal without targetValue', async () => {
            const response = await request(app)
                .post('/api/goals')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ type: 'custom', title: 'Drink more water' });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
        });

        test('should not create goal without title', async () => {
            const response = await request(app)
                .post('/api/goals')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ type: 'weight', targetValue: 70 });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should reject goal creation without token', async () => {
            const response = await request(app)
                .post('/api/goals')
                .send({ type: 'custom', title: 'Test goal' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/goals', () => {
        test('should return list of goals', async () => {
            const response = await request(app)
                .get('/api/goals')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(Array.isArray(response.body.goals)).toBe(true);
        });

        test('should return goal summary', async () => {
            const response = await request(app)
                .get('/api/goals/summary')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('active');
        });

        test('should get a single goal by id', async () => {
            const response = await request(app)
                .get(`/api/goals/${goalId}`)
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('_id', goalId);
        });
    });

    describe('PATCH /api/goals/:id/complete', () => {
        test('should mark a goal as complete', async () => {
            const response = await request(app)
                .patch(`/api/goals/${goalId}/complete`)
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('status', 'completed');
        });
    });

    describe('DELETE /api/goals/:id', () => {
        test('should delete a goal', async () => {
            const createRes = await request(app)
                .post('/api/goals')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ type: 'custom', title: 'Goal to delete' });
            const newGoalId = createRes.body.data?._id;

            const response = await request(app)
                .delete(`/api/goals/${newGoalId}`)
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });
});