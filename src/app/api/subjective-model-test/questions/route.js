import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    let filter = {};
    if (category && category !== 'all' && category !== 'All') {
      const trimmed = category.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flexible = escaped.replace(/[-–—\s>/]+/g, '[\\s\\->/]+');
      filter.category = { $regex: flexible, $options: 'i' };
    }

    if (search && search.trim()) {
      const sEscaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { q: { $regex: sEscaped, $options: 'i' } },
        { category: { $regex: sEscaped, $options: 'i' } },
        { explanation: { $regex: sEscaped, $options: 'i' } }
      ];
    }

    let query = Question.find(filter).sort({ createdAt: -1 });
    if (limit > 0) {
      query = query.limit(limit);
    }

    const questions = await query.exec();

    return NextResponse.json({
      success: true,
      questions,
      mcqs: questions,
      total: questions.length
    });
  } catch (err) {
    console.error('GET SUBJECTIVE MODEL TEST QUESTIONS ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    await connectDB();
    const body = await request.json();

    if (Array.isArray(body)) {
      const validQuestions = body
        .filter((item) => item && item.q && Array.isArray(item.options) && item.category)
        .map((item) => ({
          q: String(item.q).trim(),
          options: item.options.map((o) => (o !== undefined ? String(o).trim() : '')),
          ans: parseInt(item.ans || 0, 10),
          explanation: item.explanation ? String(item.explanation).trim() : '',
          category: String(item.category).trim()
        }));

      if (validQuestions.length === 0) {
        return NextResponse.json({ success: false, error: 'No valid questions found in payload.' }, { status: 400 });
      }

      const inserted = await Question.insertMany(validQuestions);
      return NextResponse.json({
        success: true,
        message: `${inserted.length} টি প্রশ্ন সফলভাবে সেভ করা হয়েছে`,
        count: inserted.length
      });
    } else {
      const { q, options, ans, explanation, category } = body;
      if (!q || !options || !Array.isArray(options) || options.length < 2 || !category) {
        return NextResponse.json(
          { success: false, error: 'প্রশ্ন, অপশন এবং ক্যাটাগরি সঠিকভাবে পূরণ করুন।' },
          { status: 400 }
        );
      }

      const newQ = new Question({
        q: String(q).trim(),
        options: options.map((o) => String(o).trim()),
        ans: parseInt(ans || 0, 10),
        explanation: explanation ? String(explanation).trim() : '',
        category: String(category).trim()
      });

      await newQ.save();
      return NextResponse.json({
        success: true,
        message: 'প্রশ্ন সফলভাবে তৈরি করা হয়েছে',
        question: newQ
      });
    }
  } catch (err) {
    console.error('POST SUBJECTIVE MODEL TEST QUESTION ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Question ID is required' }, { status: 400 });
    }

    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    console.error('DELETE SUBJECTIVE MODEL TEST QUESTION ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
