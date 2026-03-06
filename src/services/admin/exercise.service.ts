import { ExerciseRepository } from '../../repositories/exercise.repository';
import { IExercise } from '../../models/exercise.model';
import { HttpError } from '../../errors/http-error';
import { CreateExerciseDTO, UpdateExerciseDTO, ExerciseQueryDTO } from '../../dtos/workout.dto';

export class AdminExerciseService {
    private exerciseRepo: ExerciseRepository;

    constructor() {
        this.exerciseRepo = new ExerciseRepository();
    }

    async createExercise(dto: CreateExerciseDTO, adminId: string): Promise<IExercise> {
        return this.exerciseRepo.create(dto, adminId);
    }

    async getAllExercises(query: ExerciseQueryDTO) {
        return this.exerciseRepo.findAll(query);
    }

    async updateExercise(id: string, dto: UpdateExerciseDTO): Promise<IExercise> {
        const updated = await this.exerciseRepo.update(id, dto);
        if (!updated) throw new HttpError(404, 'Exercise not found');
        return updated;
    }

    async deleteExercise(id: string): Promise<void> {
        const deleted = await this.exerciseRepo.delete(id);
        if (!deleted) throw new HttpError(404, 'Exercise not found');
    }
}