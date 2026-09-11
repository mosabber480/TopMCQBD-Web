import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    await connectDB();

    const contentType = request.headers.get('content-type') || '';
    let questionsData = [];
    let defaultCategory = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      defaultCategory = formData.get('category') || '';

      if (!file) {
        return NextResponse.json({ success: false, error: 'JSON ফাইল নির্বাচন করুন।' }, { status: 400 });
      }

      const text = await file.text();
      const parsed = JSON.parse(text);
      questionsData = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.mcqs || []);
    } else {
      const body = await request.json();
      defaultCategory = body.category || '';
      questionsData = Array.isArray(body) ? body : (body.questions || body.mcqs || []);
    }

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      return NextResponse.json({ success: false, error: 'বৈধ JSON ডেটা পাওয়া যায়নি।' }, { status: 400 });
    }

    const validQuestions = questionsData
      .filter((q) => q && q.q && Array.isArray(q.options) && q.options.length >= 2)
      .map((item) => {
        let ansIndex = 0;
        if (typeof item.ans === 'number') {
          ansIndex = item.ans;
        } else if (typeof item.ans === 'string') {
          const s = item.ans.trim().toLowerCase();
          if (s === 'ক' || s === 'a' || s === '0' || s === '1') ansIndex = s === '1' ? 0 : isNaN(parseInt(s, 10)) ? 0 : parseInt(s, 10);
          else if (s === 'খ' || s === 'b' || s === '2') ansIndex = 1;
          else if (s === 'গ' || s === 'c' || s === '3') ansIndex = 2;
          else if (s === 'ঘ' || s === 'd' || s === '4') ansIndex = 3;
          else ansIndex = parseInt(s, 10) || 0;
        }

        const cat = (item.category && item.category.trim()) || defaultCategory.trim() || 'সাধারণ';

        return {
          q: String(item.q).trim(),
          options: item.options.map((o) => (o !== undefined ? String(o).trim() : '')),
          ans: ansIndex,
          explanation: item.explanation ? String(item.explanation).trim() : '',
          category: cat
        };
      });

    if (validQuestions.length === 0) {
      return NextResponse.json({ success: false, error: 'JSON ফাইলে কোনো সঠিক প্রশ্নের ফরম্যাট পাওয়া যায়নি।' }, { status: 400 });
    }

    const inserted = await Question.insertMany(validQuestions);

    return NextResponse.json({
      success: true,
      message: `সফলভাবে ${inserted.length} টি বিষয়ভিত্তিক প্রশ্ন আপলোড করা হয়েছে!`,
      count: inserted.length
    });
  } catch (err) {
    console.error('JSON Upload Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
