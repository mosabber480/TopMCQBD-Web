import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const categories = await Question.distinct('category');

    return NextResponse.json({
      success: true,
      categories: categories || [],
      data: categories || []
    });
  } catch (err) {
    console.error('GET CATEGORIES ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (category) {
      const trimmed = category.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await Question.deleteMany({
        category: { $regex: `^${escaped}((\\s*>\\s*)|(/|$))`, $options: 'i' }
      });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('DELETE CATEGORY ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

