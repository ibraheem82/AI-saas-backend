import mongoose, { Schema, Model } from 'mongoose';
import { IPayment } from '../types/index.js';

const paymentSchema = new Schema<IPayment>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reference: {
            type: String,
            required: true,
        },
        currency: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: 'pending',
            required: true,
        },
        subscriptionPlan: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            default: 0,
        },
        monthlyRequestCount: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
