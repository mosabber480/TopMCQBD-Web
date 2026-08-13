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
    const limit = parseInt(searchParams.get('limit') || '0', 10);

    let filter = {};
    if (category && category !== 'all' && category !== 'All') {
      const trimmed = category.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match exact category OR subcategory starting with category + ' >' or '/'
      filter.category = { $regex: `^${escaped}((\\s*>\\s*)|(/|$))`, $options: 'i' };
    }

    let query = Question.find(filter).sort({ createdAt: -1 });
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
    console.error('GET QUESTIONS ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { q, options, ans, explanation, category } = await request.json();

    if (!q || !options || options.length < 2 || ans === undefined || !category) {
      return NextResponse.json(
        { success: false, message: 'All question fields (q, options, ans, category) are required' },
        { status: 400 }
      );
    }

    const newQuestion = new Question({
      q: q.trim(),
      options: options.map(o => (o !== undefined ? String(o).trim() : '')),
      ans: parseInt(ans, 10),
      explanation: explanation || '',
      category: category.trim()
    });

    await newQuestion.save();

    return NextResponse.json({ success: true, data: newQuestion }, { status: 201 });
  } catch (err) {
    console.error('ADD QUESTION ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category query param is required' }, { status: 400 });
    }

    const trimmed = category.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const result = await Question.deleteMany({
      category: { $regex: `^${escaped}((\\s*>\\s*)|(/|$))`, $options: 'i' }
    });

    return NextResponse.json({ success: true, count: result.deletedCount });
  } catch (err) {
    console.error('BULK DELETE QUESTIONS ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
