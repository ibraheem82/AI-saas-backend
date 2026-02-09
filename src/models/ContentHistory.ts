import mongoose, { Schema, Model } from 'mongoose';
import { IContentHistory } from '../types/index.js';

const historySchema = new Schema<IContentHistory>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const ContentHistory: Model<IContentHistory> = mongoose.model<IContentHistory>(
    'ContentHistory',
    historySchema
);

export default ContentHistory;
