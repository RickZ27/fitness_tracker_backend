import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const PORT: number = Number(process.env.PORT) || 5000;
export const MONGODB_URI: string = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fitness-tracker";
export const JWT_SECRET: string = process.env.JWT_SECRET || "defaults";