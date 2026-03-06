import mongoose, { Document, Schema } from 'mongoose';

const GoalSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['weight', 'body_fat', 'workout_frequency', 'custom'],
            required: true,
        },
        title:        { type: String, required: true, maxlength: 100 },
        description:  { type: String, maxlength: 300 },
        targetValue:  { type: Number },  // what the user wants to reach
        currentValue: { type: Number },  // latest known value (auto-synced for weight/body_fat)
        unit:         { type: String, maxlength: 20 }, // "kg", "%", "workouts/week"
        direction: {
            type: String,
            enum: ['decrease', 'increase'],
        },
        deadline: { type: Date },
        status: {
            type: String,
            enum: ['active', 'completed', 'abandoned'],
            default: 'active',
            index: true,
        },
        // Snapshot of value when goal was completed/abandoned — useful for history
        completedValue: { type: Number },
        completedAt:    { type: Date },
    },
    {
        timestamps: true,
        toJSON:   { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: progress percentage toward goal
// e.g. target 70kg, current 80kg, direction decrease → 0% still to go
GoalSchema.virtual('progressPercent').get(function (this: IGoal) {
    if (
        this.targetValue === undefined ||
        this.currentValue === undefined ||
        !this.direction
    ) return null;

    if (this.direction === 'decrease') {
        // Started at some higher value, want to go down to targetValue
        // We don't store startValue, so we show how close current is to target
        if (this.currentValue <= this.targetValue) return 100;
        return null; // can't calculate without startValue stored
    }

    if (this.direction === 'increase') {
        if (this.currentValue >= this.targetValue) return 100;
        return null;
    }

    return null;
});

// Virtual: days remaining until deadline
GoalSchema.virtual('daysRemaining').get(function (this: IGoal) {
    if (!this.deadline) return null;
    const diff = this.deadline.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual: whether goal is overdue
GoalSchema.virtual('isOverdue').get(function (this: IGoal) {
    if (!this.deadline || this.status !== 'active') return false;
    return this.deadline < new Date();
});

export interface IGoal extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: string;
    title: string;
    description?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    direction?: string;
    deadline?: Date;
    status: string;
    completedValue?: number;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const GoalModel = mongoose.model<IGoal>('Goal', GoalSchema);