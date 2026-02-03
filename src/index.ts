import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import cors from 'cors';
import path from 'path';
import { HttpError } from './errors/http-error';


//  IMPORT API ROUTES
import authRoutes from "./routes/auth.route";
import adminUserRoutes from "./routes/admin/user.route";

const app: Application = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3003', 'http://localhost:3005'],
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminUserRoutes);


app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to the API" });
});



app.use((err: Error, req: Request, res: Response, next: Function) => {
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});


async function startServer() {
    await connectDatabase();

    app.listen(
        PORT,
        () => {
            console.log(`Server: http://localhost:${PORT}`);
        }
    );
}

startServer();