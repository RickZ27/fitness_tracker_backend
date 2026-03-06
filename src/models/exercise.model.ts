import mongoose, { Document, Schema } from 'mongoose';

const ExerciseSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        description:  { type: String },
        category: {
            type: String,
            enum: ['strength', 'cardio', 'flexibility', 'balance', 'plyometrics'],
            required: true,
        },
        muscleGroups: [{
            type: String,
            enum: [
                'chest', 'back', 'shoulders', 'biceps', 'triceps',
                'forearms', 'core', 'glutes', 'quads', 'hamstrings',
                'calves', 'full_body', 'cardio',
            ],
        }],
        equipment: [{
            type: String,
            enum: [
                'barbell', 'dumbbell', 'machine', 'cable',
                'bodyweight', 'resistance_band', 'kettlebell',
                'pull_up_bar', 'bench', 'none',
            ],
        }],
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner',
        },
        instructions: { type: String },
        videoUrl:     { type: String },
        imageUrl:     { type: String },
        // Admin who created this exercise (null = seeded by system)
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Text index so users can search by name or description
ExerciseSchema.index({ name: 'text', description: 'text' });

export interface IExercise extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    category: string;
    muscleGroups: string[];
    equipment: string[];
    difficulty: string;
    instructions?: string;
    videoUrl?: string;
    imageUrl?: string;
    createdBy: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

export const ExerciseModel = mongoose.model<IExercise>('Exercise', ExerciseSchema);