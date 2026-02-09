import mongoose, { Schema } from 'mongoose';
const historySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    content: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
const ContentHistory = mongoose.model('ContentHistory', historySchema);
export default ContentHistory;
//# sourceMappingURL=ContentHistory.js.map