import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseCSVLine(text) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const parseAnsIndex = (ansVal) => {
  if (ansVal === undefined || ansVal === null) return 0;
  const str = String(ansVal).trim().toLowerCase();
  if (str === '0' || str === 'ক' || str === 'a' || str === '1') {
    return str === '1' ? 0 : isNaN(parseInt(str, 10)) ? (str === 'ক' || str === 'a' ? 0 : 0) : parseInt(str, 10);
  }
  if (str === 'খ' || str === 'b' || str === '2') return 1;
  if (str === 'গ' || str === 'c' || str === '3') return 2;
  if (str === 'ঘ' || str === 'd' || str === '4') return 3;
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
};

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file');
    const categoryField = formData.get('category');

    if (!file) {
      return NextResponse.json({ success: false, error: 'CSV ফাইল নির্বাচন করুন।' }, { status: 400 });
    }

    const fileContent = await file.text();
    const lines = fileContent.split(/\r\n|\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: 'CSV ফাইলে কোনো ডাটা পাওয়া যায়নি।' }, { status: 400 });
    }

    const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    const qIdx = header.findIndex((h) => h.includes('question') || h === 'q' || h.includes('proshno'));
    const op1Idx = header.findIndex((h) => h.includes('option1') || h.includes('op1') || h === 'a' || h === 'ka');
    const op2Idx = header.findIndex((h) => h.includes('option2') || h.includes('op2') || h === 'b' || h === 'kha');
    const op3Idx = header.findIndex((h) => h.includes('option3') || h.includes('op3') || h === 'c' || h === 'ga');
    const op4Idx = header.findIndex((h) => h.includes('option4') || h.includes('op4') || h === 'd' || h === 'gha');
    const ansIdx = header.findIndex((h) => h.includes('answer') || h.includes('ans') || h.includes('uttor'));
    const expIdx = header.findIndex((h) => h.includes('explanation') || h.includes('exp') || h.includes('bekkha'));
    const catIdx = header.findIndex((h) => h.includes('category') || h.includes('cat') || h.includes('subject'));

    const parsedQuestions = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length === 0 || !row.some((cell) => cell.length > 0)) continue;

      let qText = qIdx !== -1 ? row[qIdx] : row[0];
      let o1 = op1Idx !== -1 ? row[op1Idx] : row[1];
      let o2 = op2Idx !== -1 ? row[op2Idx] : row[2];
      let o3 = op3Idx !== -1 ? row[op3Idx] : row[3];
      let o4 = op4Idx !== -1 ? row[op4Idx] : row[4];
      let ansRaw = ansIdx !== -1 ? row[ansIdx] : row[5];
      let expText = expIdx !== -1 ? row[expIdx] : (row[6] || '');
      let rowCat = catIdx !== -1 ? row[catIdx] : '';

      const finalCat = (categoryField && categoryField.trim()) ? categoryField.trim() : (rowCat || 'সাধারণ');

      if (qText && o1 && o2) {
        const options = [o1, o2];
        if (o3) options.push(o3);
        if (o4) options.push(o4);

        parsedQuestions.push({
          q: qText.trim(),
          options: options.map((o) => o.trim()),
          ans: parseAnsIndex(ansRaw),
          explanation: expText ? expText.trim() : '',
          category: finalCat
        });
      }
    }

    if (parsedQuestions.length === 0) {
      return NextResponse.json({ success: false, error: 'CSV থেকে কোনো উপযুক্ত প্রশ্ন পাওয়া যায়নি।' }, { status: 400 });
    }

    const result = await Question.insertMany(parsedQuestions);

    return NextResponse.json({
      success: true,
      message: `সফলভাবে ${result.length} টি বিষয়ভিত্তিক মডেল টেস্ট প্রশ্ন আপলোড করা হয়েছে!`,
      count: result.length
    });
  } catch (err) {
    console.error('CSV Upload Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
