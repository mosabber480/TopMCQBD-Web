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
