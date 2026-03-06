import { GoalRepository } from '../repositories/goal.repository';
import { IGoal } from '../models/goal.model';
import { HttpError } from '../errors/http-error';
import { CreateGoalDTO, UpdateGoalDTO, GoalQueryDTO } from '../dtos/goal.dto';

export class GoalService {
    private goalRepo: GoalRepository;

    constructor() {
        this.goalRepo = new GoalRepository();
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    async createGoal(userId: string, dto: CreateGoalDTO): Promise<IGoal> {
        // Auto-set unit based on type if not provided
        const data = { ...dto };
        if (!data.unit) {
            if (data.type === 'weight')            data.unit = 'kg';
            if (data.type === 'body_fat')          data.unit = '%';
            if (data.type === 'workout_frequency') data.unit = 'workouts/week';
        }
        return this.goalRepo.create(userId, data);
    }

    async getGoals(userId: string, query: GoalQueryDTO) {
        return this.goalRepo.findByUserId(userId, query);
    }

    async getGoalById(userId: string, goalId: string): Promise<IGoal> {
        const goal = await this.goalRepo.findById(goalId, userId);
        if (!goal) throw new HttpError(404, 'Goal not found');
        return goal;
    }

    async updateGoal(userId: string, goalId: string, dto: UpdateGoalDTO): Promise<IGoal> {
        const updated = await this.goalRepo.update(goalId, userId, dto);
        if (!updated) throw new HttpError(404, 'Goal not found');

        // Auto-check if the goal is now complete after update
        return this.checkAndCompleteGoal(updated);
    }

    async deleteGoal(userId: string, goalId: string): Promise<void> {
        const deleted = await this.goalRepo.delete(goalId, userId);
        if (!deleted) throw new HttpError(404, 'Goal not found');
    }

    // ─── Status Management ────────────────────────────────────────────────────

    async markComplete(userId: string, goalId: string): Promise<IGoal> {
        const goal = await this.goalRepo.findById(goalId, userId);
        if (!goal) throw new HttpError(404, 'Goal not found');
        if (goal.status === 'completed') throw new HttpError(400, 'Goal is already completed');

        const updated = await this.goalRepo.update(goalId, userId, {
            status:         'completed',
            completedValue: goal.currentValue,
            completedAt:    new Date().toISOString(),
        } as any);

        return updated!;
    }

    async markAbandoned(userId: string, goalId: string): Promise<IGoal> {
        const goal = await this.goalRepo.findById(goalId, userId);
        if (!goal) throw new HttpError(404, 'Goal not found');
        if (goal.status !== 'active') throw new HttpError(400, 'Only active goals can be abandoned');

        const updated = await this.goalRepo.update(goalId, userId, {
            status: 'abandoned',
        });

        return updated!;
    }

    // ─── Dashboard Summary ────────────────────────────────────────────────────

    async getSummary(userId: string) {
        return this.goalRepo.getSummary(userId);
    }

    // ─── Auto-sync from body metrics ─────────────────────────────────────────
    // Called by ProfileService whenever a body metric is logged.
    // Updates currentValue on all matching active goals automatically.

    async syncFromBodyMetric(
        userId: string,
        weightKg?: number,
        bodyFatPercent?: number
    ): Promise<void> {
        const syncs: Promise<void>[] = [];

        if (weightKg !== undefined) {
            syncs.push(this.goalRepo.syncCurrentValue(userId, 'weight', weightKg));
        }
        if (bodyFatPercent !== undefined) {
            syncs.push(this.goalRepo.syncCurrentValue(userId, 'body_fat', bodyFatPercent));
        }

        await Promise.all(syncs);

        // After syncing, check if any goals are now complete
        await this.autoCompleteGoals(userId);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    // Auto-completes goals where currentValue has reached targetValue
    private async autoCompleteGoals(userId: string): Promise<void> {
        const { goals } = await this.goalRepo.findByUserId(userId, {
            status: 'active',
            page: 1,
            limit: 100,
        });

        for (const goal of goals) {
            await this.checkAndCompleteGoal(goal);
        }
    }

    private async checkAndCompleteGoal(goal: IGoal): Promise<IGoal> {
        if (
            goal.status !== 'active' ||
            goal.targetValue === undefined ||
            goal.currentValue === undefined ||
            !goal.direction
        ) return goal;

        const isReached =
            goal.direction === 'decrease'
                ? goal.currentValue <= goal.targetValue
                : goal.currentValue >= goal.targetValue;

        if (isReached) {
            const updated = await this.goalRepo.update(
                goal._id.toString(),
                goal.userId.toString(),
                {
                    status:         'completed',
                    completedValue: goal.currentValue,
                    completedAt:    new Date().toISOString(),
                } as any
            );
            return updated ?? goal;
        }

        return goal;
    }
}