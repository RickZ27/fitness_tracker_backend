import mongoose from 'mongoose';
import { GoalModel, IGoal } from '../models/goal.model';
import { CreateGoalDTO, UpdateGoalDTO, GoalQueryDTO } from '../dtos/goal.dto';

export class GoalRepository {

    async create(userId: string, data: CreateGoalDTO): Promise<IGoal> {
        const goalData: Record<string, any> = { ...data, userId: new mongoose.Types.ObjectId(userId) };
        if (data.deadline) goalData.deadline = new Date(data.deadline);
        return GoalModel.create(goalData);
    }

    async findByUserId(
        userId: string,
        query: GoalQueryDTO
    ): Promise<{ goals: IGoal[]; total: number; page: number; totalPages: number }> {
        const { page, limit, status, type } = query;
        const filter: Record<string, any> = { userId: new mongoose.Types.ObjectId(userId) };
        if (status) filter.status = status;
        if (type)   filter.type   = type;

        const [goals, total] = await Promise.all([
            GoalModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            GoalModel.countDocuments(filter),
        ]);

        return { goals, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findById(id: string, userId: string): Promise<IGoal | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return GoalModel.findOne({
            _id:    new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
        });
    }

    async update(id: string, userId: string, data: UpdateGoalDTO): Promise<IGoal | null> {
        const updateData: Record<string, any> = { ...data };
        if (data.deadline) updateData.deadline = new Date(data.deadline);

        return GoalModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId) },
            { $set: updateData },
            { new: true, runValidators: true }
        );
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const result = await GoalModel.deleteOne({
            _id:    new mongoose.Types.ObjectId(id),
            userId: new mongoose.Types.ObjectId(userId),
        });
        return result.deletedCount > 0;
    }

    // Called when a new body metric is logged — syncs currentValue on matching goals
    async syncCurrentValue(userId: string, type: 'weight' | 'body_fat', newValue: number): Promise<void> {
        const goalType = type === 'weight' ? 'weight' : 'body_fat';
        await GoalModel.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), type: goalType, status: 'active' },
            { $set: { currentValue: newValue } }
        );
    }

    // Summary counts for dashboard
    async getSummary(userId: string): Promise<{
        total: number;
        active: number;
        completed: number;
        abandoned: number;
        overdue: number;
    }> {
        const result = await GoalModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id:       null,
                    total:     { $sum: 1 },
                    active:    { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    abandoned: { $sum: { $cond: [{ $eq: ['$status', 'abandoned'] }, 1, 0] } },
                },
            },
        ]);

        const overdue = await GoalModel.countDocuments({
            userId:   new mongoose.Types.ObjectId(userId),
            status:   'active',
            deadline: { $lt: new Date() },
        });

        return result[0]
            ? { ...result[0], overdue }
            : { total: 0, active: 0, completed: 0, abandoned: 0, overdue: 0 };
    }
}