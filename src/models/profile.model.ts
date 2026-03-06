import mongoose, { Document, Schema } from 'mongoose';
import { ProfileType } from '../types/profile.type';

const ProfileSchema: Schema = new Schema<IProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        gender:      { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
        dateOfBirth: { type: Date },
        heightCm:    { type: Number, min: 50, max: 300 },
        bio:         { type: String, maxlength: 300 },
        fitnessLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
        },
        activityLevel: {
            type: String,
            enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
            default: 'sedentary',
        },
        preferredWeightUnit: {
            type: String,
            enum: ['kg', 'lbs'],
            default: 'kg',
        },
        preferredHeightUnit: {
            type: String,
            enum: ['cm', 'inches'],
            default: 'cm',
        },
    },
    {
        timestamps: true,
        toJSON:   { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Calculates age on the fly — never stored in DB
ProfileSchema.virtual('age').get(function (this: IProfile) {
    if (!this.dateOfBirth) return undefined;
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const m = today.getMonth() - this.dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) age--;
    return age;
});

export interface IProfile extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    gender?: string;
    dateOfBirth?: Date;
    heightCm?: number;
    bio?: string;
    fitnessLevel: string;
    activityLevel: string;
    preferredWeightUnit: string;
    preferredHeightUnit: string;
    createdAt: Date;
    updatedAt: Date;
}

export const ProfileModel = mongoose.model<IProfile>('Profile', ProfileSchema);