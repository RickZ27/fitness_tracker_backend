import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { HttpError } from './errors/http-error';

// IMPORT API ROUTES
import authRoutes          from './routes/auth.route';
import profileRoutes       from './routes/profile.route';
import workoutRoutes       from './routes/workout.route';
import goalRoutes          from './routes/goal.route';
import analyticsRoutes     from './routes/analytics.route';
import adminUserRoutes     from './routes/admin/user.route';
import adminExerciseRoutes from './routes/admin/exercise.route';
import analyticsRouter from "./routes/admin/analytics.route";


const app: Application = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3005'],
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));

// Serve uploaded images as static files at /uploads/<filename>
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API ROUTES
app.use('/api/auth',            authRoutes);
app.use('/api/profile',         profileRoutes);
app.use('/api/workouts',        workoutRoutes);
app.use('/api/goals',           goalRoutes);
app.use('/api/analytics',       analyticsRoutes);
app.use('/api/admin/users',     adminUserRoutes);
app.use('/api/admin/exercises', adminExerciseRoutes);

app.use("/api/admin/analytics", analyticsRouter);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: 'true', message: 'Welcome to the API' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

export default app;