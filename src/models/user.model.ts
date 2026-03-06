import mongoose, { Document, Schema } from 'mongoose';
import { UserType } from '../types/user.type';

const UserSchema: Schema = new Schema<UserType>(
    {
        email:    { type: String, required: true, unique: true },
        password: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        fullName: { type: String },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        imageUrl: { type: String, required: false },

        // Multi-device login: stores hashed refresh tokens — raw tokens never stored
        refreshTokens: [
            {
                tokenHash:  { type: String, required: true },
                issuedAt:   { type: Date, default: Date.now },
                expiresAt:  { type: Date, required: true },
                deviceInfo: { type: String },
            },
        ],

        // Password reset: both cleared after a successful reset
        passwordResetToken:   { type: String, select: false },
        passwordResetExpires: { type: Date,   select: false },
    },
    {
        timestamps: true, // auto createdAt and updatedAt
    }
);

// Removes expired refresh tokens — call before saving to keep array small
UserSchema.methods.removeExpiredRefreshTokens = function () {
    const now = new Date();
    this.refreshTokens = this.refreshTokens.filter(
        (rt: { expiresAt: Date }) => rt.expiresAt > now
    );
};

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    removeExpiredRefreshTokens(): void;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
// UserModel is the mongoose model for User collection -> db.users in MongoDB