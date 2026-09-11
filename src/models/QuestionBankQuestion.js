import mongoose from 'mongoose';

export const questionBankQuestionSchema = new mongoose.Schema(
  {
    q: { type: String, required: true },
    options: { type: [String], required: true },
    ans: { type: Number, required: true },
    explanation: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    year: { type: String, default: '' },
    examTitle: { type: String, default: '' },
    subject: { type: String, default: '' }
  },
  { timestamps: true }
);

export function getQuestionBankModel(connection) {
  if (connection.models && connection.models.QuestionBankQuestion) {
    return connection.models.QuestionBankQuestion;
  }
  return connection.model('QuestionBankQuestion', questionBankQuestionSchema, 'questions');
}

export default getQuestionBankModel;
