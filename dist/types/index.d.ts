import { Request } from 'express';
import { Document, Types } from 'mongoose';
export type SubscriptionPlan = 'Trial' | 'Free' | 'Basic' | 'Premium';
export interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    trialPeriod: number;
    trialActive: boolean;
    trialExpires?: Date;
    subscriptionPlan: SubscriptionPlan;
    apiRequestCount: number;
    monthlyRequestCount: number;
    nextBillingDate?: Date;
    payments: Types.ObjectId[];
    contentHistory: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export type PaymentStatus = 'pending' | 'success' | 'failed';
export interface IPayment extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    reference: string;
    currency: string;
    status: PaymentStatus;
    subscriptionPlan: string;
    amount: number;
    monthlyRequestCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IContentHistory extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthenticatedRequest extends Request {
    user?: IUser;
}
export interface ApiResponse<T = unknown> {
    status: string | boolean;
    message?: string;
    data?: T;
}
export interface LoginResponse {
    status: string;
    _id: string;
    message: string;
    username: string;
    email: string;
}
export interface RegisterResponse {
    status: boolean;
    message: string;
    user: {
        username: string;
        email: string;
    };
}
export interface PaystackInitResponse {
    status: boolean;
    authorizationUrl?: string;
    accessCode?: string;
    reference?: string;
    message?: string;
}
export interface PaystackMetadata {
    userId: string;
    userEmail: string;
    subscriptionPlan: SubscriptionPlan;
    custom_fields: Array<{
        display_name: string;
        variable_name: string;
        value: string;
    }>;
}
export interface PaystackTransactionData {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata: PaystackMetadata;
}
export interface PaystackVerifyResponse {
    status: boolean;
    data: PaystackTransactionData;
    message?: string;
}
//# sourceMappingURL=index.d.ts.map