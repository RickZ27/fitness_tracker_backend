import mongoose from 'mongoose';
import { WorkoutPlanModel, IWorkoutPlan } from '../models/workoutplan.model';
import { CreateWorkoutPlanDTO, UpdateWorkoutPlanDTO, WorkoutPlanQueryDTO } from '../dtos/workout.dto';

export class WorkoutPlanRepository {

    async create(userId: string, data: CreateWorkoutPlanDTO): Promise<IWorkoutPlan> {
        return WorkoutPlanModel.create({
            ...data,
            userId: new mongoose.Types.ObjectId(userId),
        });
    }

    // Get all plans owned by a specific user
    async findByUserId(
        userId: string,
        query: WorkoutPlanQueryDTO
    ): Promise<{ plans: IWorkoutPlan[]; total: number; page: number; totalPages: number }> {
        const { page, limit, difficulty } = query;
        const filter: Record<string, any> = { userId: new mongoose.Types.ObjectId(userId) };
        if (difficulty) filter.difficulty = difficulty;

        const [plans, total] = await Promise.all([
            WorkoutPlanModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-days'), // days returned only on single fetch to keep list response light
            WorkoutPlanModel.countDocuments(filter),
        ]);

        return { plans, total, page, totalPages: Math.ceil(total / limit) };
    }

    // Get public plans from all users (discover feature)
    async findPublic(
        query: WorkoutPlanQueryDTO
    ): Promise<{ plans: IWorkoutPlan[]; total: number; page: number; totalPages: number }> {
        const { page, limit, difficulty } = query;
        const filter: Record<string, any> = { isPublic: true };
        if (difficulty) filter.difficulty = difficulty;

        const [plans, total] = await Promise.all([
            WorkoutPlanModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-days')
                .populate('userId', 'username fullName imageUrl'), // show who created public plans
            WorkoutPlanModel.countDocuments(filter),
        ]);

        return { plans, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findById(id: string): Promise<IWorkoutPlan | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return WorkoutPlanModel.findById(id)
            .populate('days.exercises.exerciseId', 'name category muscleGroups equipment difficulty imageUrl');
    }

    async findByIdAndUserId(id: string, userId: string): Promise<IWorkoutPlan | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return WorkoutPlanModel.findOne({
            _id:    new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
        });
    }

    async update(id: string, userId: string, data: UpdateWorkoutPlanDTO): Promise<IWorkoutPlan | null> {
        return WorkoutPlanModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId) },
            { $set: data },
            { new: true, runValidators: true }
        );
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const result = await WorkoutPlanModel.deleteOne({
            _id:    new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
        });
        return result.deletedCount > 0;
    }
}