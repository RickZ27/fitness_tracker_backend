import mongoose, { Document, Schema } from 'mongoose';

// Embedded: one exercise entry inside a day
const PlanExerciseSchema = new Schema(
    {
        exerciseId:  { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
        sets:        { type: Number, min: 1, max: 20 },
        reps:        { type: Number, min: 1, max: 200 },
        durationSec: { type: Number, min: 1 },  // for timed exercises like planks
        restSec:     { type: Number, min: 0, max: 600, default: 60 },
        notes:       { type: String, maxlength: 200 },
        order:       { type: Number, default: 1 },
    },
    { _id: true }
);

// Embedded: one day inside a workout plan
const WorkoutDaySchema = new Schema(
    {
        dayNumber: { type: Number, required: true, min: 1, max: 7 },
        name:      { type: String, required: true, maxlength: 50 }, // e.g. "Push Day"
        exercises: { type: [PlanExerciseSchema], default: [] },
    },
    { _id: true }
);

const WorkoutPlanSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name:          { type: String, required: true, trim: true, maxlength: 100 },
        description:   { type: String, maxlength: 500 },
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
        },
        durationWeeks: { type: Number, min: 1, max: 52 },
        isPublic:      { type: Boolean, default: false }, // public plans visible to all users
        days:          { type: [WorkoutDaySchema], default: [] },
    },
    {
        timestamps: true,
    }
);

export interface IPlanExercise {
    _id: mongoose.Types.ObjectId;
    exerciseId: mongoose.Types.ObjectId;
    sets?: number;
    reps?: number;
    durationSec?: number;
    restSec: number;
    notes?: string;
    order: number;
}

export interface IWorkoutDay {
    _id: mongoose.Types.ObjectId;
    dayNumber: number;
    name: string;
    exercises: IPlanExercise[];
}

export interface IWorkoutPlan extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    difficulty: string;
    durationWeeks?: number;
    isPublic: boolean;
    days: IWorkoutDay[];
    createdAt: Date;
    updatedAt: Date;
}

export const WorkoutPlanModel = mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);