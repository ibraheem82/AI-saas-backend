import mongoose, { Schema, Model } from 'mongoose';
import { IUser, SubscriptionPlan } from '../types/index.js';

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        trialPeriod: {
            type: Number,
            default: 3,
        },
        trialActive: {
            type: Boolean,
            default: false,
        },
        trialExpires: {
            type: Date,
        },
        subscriptionPlan: {
            type: String,
            enum: ['Trial', 'Free', 'Basic', 'Premium'] as SubscriptionPlan[],
            default: 'Free',
        },
        apiRequestCount: {
            type: Number,
            default: 0,
        },
        monthlyRequestCount: {
            type: Number,
            default: 100,
        },
        nextBillingDate: Date,
        payments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Payment',
            },
        ],
        contentHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'ContentHistory',
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
