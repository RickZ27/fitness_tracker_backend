import mongoose from 'mongoose';
import { ProfileModel, IProfile } from '../models/profile.model';
import { UpdateProfileDTO } from '../dtos/profile.dto';

export class ProfileRepository {
    async findByUserId(userId: string): Promise<IProfile | null> {
        return ProfileModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    }

    async createForUser(userId: string): Promise<IProfile> {
        return ProfileModel.create({ userId: new mongoose.Types.ObjectId(userId) });
    }

    async upsertByUserId(userId: string, data: UpdateProfileDTO): Promise<IProfile> {
        const updateData: Record<string, any> = { ...data };
        if (data.dateOfBirth) {
            updateData.dateOfBirth = new Date(data.dateOfBirth);
        }
        return ProfileModel.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(userId) },
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        ) as Promise<IProfile>;
    }
}