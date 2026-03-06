import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Auth Integration Tests', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        fullName: 'Test User',
    };

    let accessToken: string;

    beforeAll(async () => {
        await UserModel.deleteMany({
            $or: [{ email: testUser.email }, { username: testUser.username }],
        });
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            $or: [{ email: testUser.email }, { username: testUser.username }],
        });
    });

    // ─── Register ────────────────────────────────────────────────────────────

    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
        });

        test('should not register with duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not register with duplicate username', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, email: 'other@example.com' });
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not register with missing required fields', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ email: 'missing@example.com' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not register with invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, email: 'not-an-email', username: 'uniqueuser1' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    // ─── Login ───────────────────────────────────────────────────────────────

    describe('POST /api/auth/login', () => {
        test('should login an existing user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('accessToken');
            accessToken = response.body.data.accessToken;
        });

        test('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'WrongPassword!' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nobody@example.com', password: 'Password123!' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not login with missing fields', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    // ─── WhoAmI ──────────────────────────────────────────────────────────────

    describe('GET /api/auth/whoami', () => {
        test('should return current user with valid token', async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            const token = loginRes.body.data.accessToken;

            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });

        test('should reject whoami without token', async () => {
            const response = await request(app).get('/api/auth/whoami');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });
});