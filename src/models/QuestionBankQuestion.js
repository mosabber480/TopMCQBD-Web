/**
 * Question Bank Model (Native MongoDB Driver)
 * Fast, lightweight, Edge-compatible question bank model for TopMCQBD_DB_Question_Bank
 */

import { createNativeModel } from './_baseModel.js';

const QuestionBankModel = createNativeModel('questions', 'question-bank');

export function getQuestionBankModel(clusterKeyOrConn = 'question-bank') {
  const cluster = typeof clusterKeyOrConn === 'string' ? clusterKeyOrConn : 'question-bank';
  return createNativeModel('questions', cluster);
}

export default getQuestionBankModel;
