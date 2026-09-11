import { NextResponse } from 'next/server';
import { connectQuestionBankDB } from '@/lib/db';
import getQuestionBankModel from '@/models/QuestionBankQuestion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const conn = await connectQuestionBankDB();
    const QuestionBankModel = getQuestionBankModel(conn);

    const stats = await QuestionBankModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          years: { $addToSet: '$year' },
          examTitles: { $addToSet: '$examTitle' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalQuestions = await QuestionBankModel.countDocuments();

    return NextResponse.json({
      success: true,
      totalQuestions,
      categories: stats.map((s) => ({
        category: s._id,
        count: s.count,
        years: s.years.filter(Boolean),
        examTitles: s.examTitles.filter(Boolean)
      }))
    });
  } catch (err) {
    console.error('GET QUESTION BANK CATEGORIES ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
