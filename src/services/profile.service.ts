import { ProfileRepository } from '../repositories/profile.repository';
import { BodyMetricRepository } from '../repositories/body.metrics.repository';
import { UpdateProfileDTO } from '../dtos/profile.dto';
import { LogBodyMetricDTO, GetBodyMetricsQueryDTO } from '../dtos/body.metrics.dto';
import { IProfile } from '../models/profile.model';
import { IBodyMetric } from '../models/body.metrics.model';
import { HttpError } from '../errors/http-error';
import { GoalService } from './goal.service';

export class ProfileService {
    private profileRepo:    ProfileRepository;
    private bodyMetricRepo: BodyMetricRepository;
    private goalService!: GoalService;

    constructor() {
        this.profileRepo    = new ProfileRepository();
        this.bodyMetricRepo = new BodyMetricRepository();
    }

    async getProfile(userId: string): Promise<IProfile> {
        let profile = await this.profileRepo.findByUserId(userId);
        if (!profile) {
            profile = await this.profileRepo.createForUser(userId); // auto-create on first access
        }
        return profile;
    }

    async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<IProfile> {
        return this.profileRepo.upsertByUserId(userId, dto);
    }

    async logBodyMetric(userId: string, dto: LogBodyMetricDTO): Promise<IBodyMetric> {
        const profile = await this.profileRepo.findByUserId(userId);

        const data: Partial<IBodyMetric> = {
            weightKg:       dto.weightKg,
            bodyFatPercent: dto.bodyFatPercent,
            waistCm:        dto.waistCm,
            hipsCm:         dto.hipsCm,
            chestCm:        dto.chestCm,
            neckCm:         dto.neckCm,
            bicepCm:        dto.bicepCm,
            thighCm:        dto.thighCm,
            loggedAt:       dto.loggedAt ? new Date(dto.loggedAt) : new Date(),
        };

        if (profile?.heightCm) {
            const h = profile.heightCm / 100;
            data.bmi = parseFloat((dto.weightKg / (h * h)).toFixed(2));
        }

        if (dto.bodyFatPercent) {
            data.leanMassKg = parseFloat(
                (dto.weightKg * (1 - dto.bodyFatPercent / 100)).toFixed(2)
            );
        }

        const metric = await this.bodyMetricRepo.create(userId, data);

        // Auto-sync weight & body fat goals whenever a new metric is logged
        await this.goalService.syncFromBodyMetric(userId, dto.weightKg, dto.bodyFatPercent);

        return metric;
    }

    async getBodyMetrics(userId: string, query: GetBodyMetricsQueryDTO) {
        return this.bodyMetricRepo.findByUserId(userId, query);
    }

    async getLatestBodyMetric(userId: string): Promise<IBodyMetric | null> {
        return this.bodyMetricRepo.findLatestByUserId(userId);
    }

    async deleteBodyMetric(userId: string, metricId: string): Promise<void> {
        const deleted = await this.bodyMetricRepo.deleteById(metricId, userId);
        if (!deleted) throw new HttpError(404, 'Body metric entry not found');
    }

    async getDashboard(userId: string) {
        const [profile, latestMetric, last7Days, last30Days] = await Promise.all([
            this.getProfile(userId),
            this.bodyMetricRepo.findLatestByUserId(userId),
            this.bodyMetricRepo.getProgressSummary(userId, 7),
            this.bodyMetricRepo.getProgressSummary(userId, 30),
        ]);
        return { profile, latestMetric, progress: { last7Days, last30Days } };
    }

    static kgToLbs(kg: number): number   { return parseFloat((kg * 2.20462).toFixed(2)); }
    static lbsToKg(lbs: number): number  { return parseFloat((lbs / 2.20462).toFixed(2)); }
    static cmToInches(cm: number): number { return parseFloat((cm / 2.54).toFixed(2)); }

    static getBmiCategory(bmi: number): string {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25.0) return 'Normal weight';
        if (bmi < 30.0) return 'Overweight';
        return 'Obese';
    }
}