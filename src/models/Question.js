import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    q: { type: String, required: true },
    options: { type: [String], required: true },
    ans: { type: Number, required: true },
    explanation: { type: String, default: '' },
    category: { type: String, required: true, index: true }
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
