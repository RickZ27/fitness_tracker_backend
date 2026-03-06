import mongoose from 'mongoose';
import { ExerciseModel, IExercise } from '../models/exercise.model';
import { CreateExerciseDTO, UpdateExerciseDTO, ExerciseQueryDTO } from '../dtos/workout.dto';

export class ExerciseRepository {

    async create(data: CreateExerciseDTO, adminId: string): Promise<IExercise> {
        return ExerciseModel.create({
            ...data,
            createdBy: new mongoose.Types.ObjectId(adminId),
        });
    }

    async findAll(query: ExerciseQueryDTO): Promise<{ exercises: IExercise[]; total: number; page: number; totalPages: number }> {
        const { page, limit, search, category, muscleGroup, equipment, difficulty } = query;
        const filter: Record<string, any> = {};

        // Full-text search on name + description
        if (search) filter.$text = { $search: search };
        if (category)    filter.category     = category;
        if (muscleGroup) filter.muscleGroups  = muscleGroup;
        if (equipment)   filter.equipment     = equipment;
        if (difficulty)  filter.difficulty    = difficulty;

        const [exercises, total] = await Promise.all([
            ExerciseModel.find(filter)
                .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-instructions'), // instructions returned only on single fetch
            ExerciseModel.countDocuments(filter),
        ]);

        return { exercises, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findById(id: string): Promise<IExercise | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return ExerciseModel.findById(id);
    }

    async update(id: string, data: UpdateExerciseDTO): Promise<IExercise | null> {
        return ExerciseModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );
    }

    async delete(id: string): Promise<boolean> {
        const result = await ExerciseModel.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    async findByIds(ids: string[]): Promise<IExercise[]> {
        return ExerciseModel.find({
            _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) },
        });
    }
}