import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Profile Integration Tests', () => {
    const testUser = {
        username: 'profileuser',
        email: 'profile@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'Profile User',
    };

    let accessToken: string;

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

    describe('GET /api/profile/me', () => {
        test('should get profile of logged in user', async () => {
            const response = await request(app)
                .get('/api/profile/me')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('email', testUser.email);
        });

        test('should reject profile fetch without token', async () => {
            const response = await request(app).get('/api/profile/me');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('PUT /api/profile/me', () => {
        test('should update fitness profile fields', async () => {
            const response = await request(app)
                .put('/api/profile/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ heightCm: 175, fitnessLevel: 'intermediate', gender: 'male' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });

        test('should reject update without token', async () => {
            const response = await request(app)
                .put('/api/profile/me')
                .send({ heightCm: 175 });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('POST /api/profile/me/body-metrics', () => {
        test('should log a body metric successfully', async () => {
            const response = await request(app)
                .post('/api/profile/me/body-metrics')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ weightKg: 75 });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
        });

        test('should log body metric with optional fields', async () => {
            const response = await request(app)
                .post('/api/profile/me/body-metrics')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ weightKg: 74.5, bodyFatPercent: 18, waistCm: 82 });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
        });

        test('should not log body metric without weightKg', async () => {
            const response = await request(app)
                .post('/api/profile/me/body-metrics')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ bodyFatPercent: 18 });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should reject body metric without token', async () => {
            const response = await request(app)
                .post('/api/profile/me/body-metrics')
                .send({ weightKg: 75 });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/profile/me/body-metrics', () => {
        test('should return list of body metrics', async () => {
            const response = await request(app)
                .get('/api/profile/me/body-metrics')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('metrics');
            expect(Array.isArray(response.body.metrics)).toBe(true);
        });

        test('should return latest body metric', async () => {
            const response = await request(app)
                .get('/api/profile/me/body-metrics/latest')
                .set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });
});