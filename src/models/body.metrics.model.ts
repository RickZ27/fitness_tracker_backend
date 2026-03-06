import mongoose, { Document, Schema } from 'mongoose';

const BodyMetricSchema: Schema = new Schema(
    {
        userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        weightKg:       { type: Number, required: true, min: 1, max: 700 },
        bodyFatPercent: { type: Number, min: 1, max: 100 },
        waistCm:        { type: Number, min: 20, max: 300 },
        hipsCm:         { type: Number, min: 20, max: 300 },
        chestCm:        { type: Number, min: 20, max: 300 },
        neckCm:         { type: Number, min: 10, max: 100 },
        bicepCm:        { type: Number, min: 10, max: 100 },
        thighCm:        { type: Number, min: 10, max: 100 },
        bmi:            { type: Number },       // auto-calculated if heightCm set on profile
        leanMassKg:     { type: Number },       // auto-calculated if bodyFatPercent provided
        loggedAt:       { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Efficient user history queries sorted by date
BodyMetricSchema.index({ userId: 1, loggedAt: -1 });

export interface IBodyMetric extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    weightKg: number;
    bodyFatPercent?: number;
    waistCm?: number;
    hipsCm?: number;
    chestCm?: number;
    neckCm?: number;
    bicepCm?: number;
    thighCm?: number;
    bmi?: number;
    leanMassKg?: number;
    loggedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const BodyMetricModel = mongoose.model<IBodyMetric>('BodyMetric', BodyMetricSchema);