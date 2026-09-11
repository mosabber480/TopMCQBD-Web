import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectQuestionBankDB } from '@/lib/db';
import getQuestionBankModel from '@/models/QuestionBankQuestion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    const conn = await connectQuestionBankDB();
    const QuestionBankModel = getQuestionBankModel(conn);

    let payload;
    let defaultCategory = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      defaultCategory = formData.get('category') || '';

      if (!file) {
        return NextResponse.json({ success: false, error: 'No JSON file uploaded' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const text = buffer.toString('utf-8');
      try {
        payload = JSON.parse(text);
      } catch (jsonErr) {
        return NextResponse.json({ success: false, error: 'Invalid JSON file: ' + jsonErr.message }, { status: 400 });
      }
    } else {
      payload = await request.json();
    }

    let questionsList = [];
    if (Array.isArray(payload)) {
      questionsList = payload;
    } else if (payload && Array.isArray(payload.questions)) {
      defaultCategory = payload.category || defaultCategory;
      questionsList = payload.questions;
    } else if (payload && Array.isArray(payload.mcqs)) {
      defaultCategory = payload.category || defaultCategory;
      questionsList = payload.mcqs;
    } else {
      return NextResponse.json({
        success: false,
        error: 'JSON must be an array of questions or an object with a "questions" array.'
      }, { status: 400 });
    }

    const validQuestions = [];
    for (const item of questionsList) {
      if (!item || !item.q) continue;

      const category = (item.category || defaultCategory || '').trim();
      const options = Array.isArray(item.options) ? item.options.map(o => String(o).trim()) : [];
      if (options.length < 2 || !category) continue;

      let ans = 0;
      if (item.ans !== undefined) {
        ans = parseInt(item.ans, 10);
        if (isNaN(ans)) ans = 0;
      }

      validQuestions.push({
        q: String(item.q).trim(),
        options,
        ans,
        explanation: item.explanation ? String(item.explanation).trim() : '',
        category,
        year: item.year ? String(item.year).trim() : '',
        examTitle: item.examTitle ? String(item.examTitle).trim() : '',
        subject: item.subject ? String(item.subject).trim() : ''
      });
    }

    if (validQuestions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid questions found. Each question must have "q", at least 2 "options", and a "category".'
      }, { status: 400 });
    }

    const inserted = await QuestionBankModel.insertMany(validQuestions);

    return NextResponse.json({
      success: true,
      count: inserted.length,
      message: `Successfully uploaded ${inserted.length} questions into Question Bank.`
    });
  } catch (err) {
    console.error('JSON UPLOAD ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
