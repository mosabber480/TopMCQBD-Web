import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectQuestionBankDB } from '@/lib/db';
import getQuestionBankModel from '@/models/QuestionBankQuestion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const conn = await connectQuestionBankDB();
    const QuestionBankModel = getQuestionBankModel(conn);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    let filter = {};
    if (category && category !== 'all' && category !== 'All') {
      const trimmed = category.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flexible = escaped.replace(/[-–—\s>/]+/g, '[\\s\\->/]+');
      filter.$or = [
        { category: { $regex: flexible, $options: 'i' } },
        { examTitle: { $regex: flexible, $options: 'i' } },
        { year: { $regex: flexible, $options: 'i' } }
      ];
    }

    let query = QuestionBankModel.find(filter).sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }

    const questions = await query.exec();

    return NextResponse.json({
      success: true,
      mcqs: questions,
      questions,
      total: questions.length
    });
  } catch (err) {
    console.error('GET QUESTION BANK ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    const conn = await connectQuestionBankDB();
    const QuestionBankModel = getQuestionBankModel(conn);

    const body = await request.json();

    if (Array.isArray(body)) {
      const validQuestions = body
        .filter((item) => item && item.q && Array.isArray(item.options) && item.category)
        .map((item) => ({
          q: String(item.q).trim(),
          options: item.options.map((o) => (o !== undefined ? String(o).trim() : '')),
          ans: parseInt(item.ans || 0, 10),
          explanation: item.explanation ? String(item.explanation).trim() : '',
          category: String(item.category).trim(),
          year: item.year ? String(item.year).trim() : '',
          examTitle: item.examTitle ? String(item.examTitle).trim() : '',
          subject: item.subject ? String(item.subject).trim() : ''
        }));

      if (validQuestions.length === 0) {
        return NextResponse.json({ success: false, error: 'No valid questions found in payload.' }, { status: 400 });
      }

      const inserted = await QuestionBankModel.insertMany(validQuestions);
      return NextResponse.json({ success: true, count: inserted.length });
    }

    const { q, options, ans, explanation, category, year, examTitle, subject } = body;
    if (!q || !options || !Array.isArray(options) || !category) {
      return NextResponse.json({ success: false, error: 'Question text, options and category are required.' }, { status: 400 });
    }

    const newQuestion = await QuestionBankModel.create({
      q: String(q).trim(),
      options: options.map((o) => String(o).trim()),
      ans: parseInt(ans || 0, 10),
      explanation: explanation ? String(explanation).trim() : '',
      category: String(category).trim(),
      year: year ? String(year).trim() : '',
      examTitle: examTitle ? String(examTitle).trim() : '',
      subject: subject ? String(subject).trim() : ''
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (err) {
    console.error('POST QUESTION BANK ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    const conn = await connectQuestionBankDB();
    const QuestionBankModel = getQuestionBankModel(conn);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');

    if (id) {
      const deleted = await QuestionBankModel.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Question deleted successfully.' });
    }

    if (category) {
      const trimmed = category.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const res = await QuestionBankModel.deleteMany({
        $or: [
          { category: { $regex: `^${escaped}$`, $options: 'i' } },
          { examTitle: { $regex: `^${escaped}$`, $options: 'i' } }
        ]
      });
      return NextResponse.json({ success: true, count: res.deletedCount, message: `${res.deletedCount} questions deleted.` });
    }

    return NextResponse.json({ success: false, error: 'Specify an id or category to delete.' }, { status: 400 });
  } catch (err) {
    console.error('DELETE QUESTION BANK ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
