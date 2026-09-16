/**
 * Question Model (Native MongoDB Driver)
 * Fast, lightweight, Edge-compatible question model for TopMCQBD
 */

import { createNativeModel } from './_baseModel.js';

const QuestionModel = createNativeModel('questions', 'paid');

export function getQuestionModel(clusterKeyOrConn = 'paid') {
  const cluster = typeof clusterKeyOrConn === 'string' ? clusterKeyOrConn : 'paid';
  return createNativeModel('questions', cluster);
}

export default QuestionModel;
