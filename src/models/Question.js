import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    q: { type: String, required: true },
    options: { type: [String], required: true },
    ans: { type: Number, required: true },
    explanation: { type: String, default: '' },
    category: { type: String, required: true, index: true }
}, { timestamps: true });

export function getQuestionModel(connection) {
  if (!connection) {
    return mongoose.models.Question || mongoose.model('Question', questionSchema);
  }
  if (connection.models && connection.models.Question) {
    return connection.models.Question;
  }
  return connection.model('Question', questionSchema, 'questions');
}

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
