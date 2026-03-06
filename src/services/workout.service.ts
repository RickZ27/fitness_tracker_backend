import { ExerciseRepository } from '../repositories/exercise.repository';
import { WorkoutPlanRepository } from '../repositories/workoutplan.repository';
import { IExercise } from '../models/exercise.model';
import { IWorkoutPlan } from '../models/workoutplan.model';
import { HttpError } from '../errors/http-error';
import {
    CreateWorkoutPlanDTO,
    UpdateWorkoutPlanDTO,
    WorkoutPlanQueryDTO,
    ExerciseQueryDTO,
} from '../dtos/workout.dto';

export class WorkoutService {
    private exerciseRepo:    ExerciseRepository;
    private workoutPlanRepo: WorkoutPlanRepository;

    constructor() {
        this.exerciseRepo    = new ExerciseRepository();
        this.workoutPlanRepo = new WorkoutPlanRepository();
    }

    // ─── Exercises (read-only for regular users) ──────────────────────────────

    async getAllExercises(query: ExerciseQueryDTO) {
        return this.exerciseRepo.findAll(query);
    }

    async getExerciseById(id: string): Promise<IExercise> {
        const exercise = await this.exerciseRepo.findById(id);
        if (!exercise) throw new HttpError(404, 'Exercise not found');
        return exercise;
    }

    // ─── Workout Plans ────────────────────────────────────────────────────────

    async createPlan(userId: string, dto: CreateWorkoutPlanDTO): Promise<IWorkoutPlan> {
        // Validate all exerciseIds in every day actually exist in the DB
        const allExerciseIds = dto.days.flatMap(day =>
            day.exercises.map(e => e.exerciseId)
        );
        const uniqueIds = [...new Set(allExerciseIds)];
        const found = await this.exerciseRepo.findByIds(uniqueIds);

        if (found.length !== uniqueIds.length) {
            const foundIds  = found.map(e => e._id.toString());
            const missingIds = uniqueIds.filter(id => !foundIds.includes(id));
            throw new HttpError(400, `Exercise IDs not found: ${missingIds.join(', ')}`);
        }

        return this.workoutPlanRepo.create(userId, dto);
    }

    async getMyPlans(userId: string, query: WorkoutPlanQueryDTO) {
        return this.workoutPlanRepo.findByUserId(userId, query);
    }

    async getPublicPlans(query: WorkoutPlanQueryDTO) {
        return this.workoutPlanRepo.findPublic(query);
    }

    async getPlanById(planId: string, userId: string): Promise<IWorkoutPlan> {
        const plan = await this.workoutPlanRepo.findById(planId);
        if (!plan) throw new HttpError(404, 'Workout plan not found');

        // Private plans are only visible to their owner
        if (!plan.isPublic && plan.userId.toString() !== userId) {
            throw new HttpError(403, 'You do not have access to this plan');
        }

        return plan;
    }

    async updatePlan(userId: string, planId: string, dto: UpdateWorkoutPlanDTO): Promise<IWorkoutPlan> {
        // If days are being updated, validate exercise IDs again
        if (dto.days) {
            const allExerciseIds = dto.days.flatMap(day =>
                day.exercises.map(e => e.exerciseId)
            );
            const uniqueIds = [...new Set(allExerciseIds)];
            const found = await this.exerciseRepo.findByIds(uniqueIds);

            if (found.length !== uniqueIds.length) {
                const foundIds   = found.map(e => e._id.toString());
                const missingIds = uniqueIds.filter(id => !foundIds.includes(id));
                throw new HttpError(400, `Exercise IDs not found: ${missingIds.join(', ')}`);
            }
        }

        const updated = await this.workoutPlanRepo.update(planId, userId, dto);
        if (!updated) throw new HttpError(404, 'Workout plan not found or you do not own it');
        return updated;
    }

    async deletePlan(userId: string, planId: string): Promise<void> {
        const deleted = await this.workoutPlanRepo.delete(planId, userId);
        if (!deleted) throw new HttpError(404, 'Workout plan not found or you do not own it');
    }
}