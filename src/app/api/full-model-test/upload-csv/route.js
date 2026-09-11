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
  if (str === 'খ' || str === 'b' || str === '2') return str === '2' ? 1 : 1;
  if (str === 'গ' || str === 'c' || str === '3') return str === '3' ? 2 : 2;
  if (str === 'ঘ' || str === 'd' || str === '4') return str === '4' ? 3 : 3;
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
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileContent = buffer.toString('utf-8');
    const lines = fileContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV file must have header row and at least one data row.' },
        { status: 400 }
      );
    }

    const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase());

    let qIdx = headers.findIndex((h) => h === 'question' || h === 'q' || h === 'প্রশ্ন');
    let opt0Idx = headers.findIndex((h) => h === 'opt0' || h === 'option1' || h === 'ক');
    let opt1Idx = headers.findIndex((h) => h === 'opt1' || h === 'option2' || h === 'খ');
    let opt2Idx = headers.findIndex((h) => h === 'opt2' || h === 'option3' || h === 'গ');
    let opt3Idx = headers.findIndex((h) => h === 'opt3' || h === 'option4' || h === 'ঘ');
    let ansIdx = headers.findIndex((h) => h === 'ans' || h === 'answer' || h === 'সঠিক উত্তর');
    let expIdx = headers.findIndex((h) => h === 'explanation' || h === 'ব্যাখ্যা');
    let catIdx = headers.findIndex((h) => h === 'category' || h === 'ক্যাটাগরি');

    if (qIdx === -1) qIdx = 0;
    if (opt0Idx === -1) opt0Idx = 1;
    if (opt1Idx === -1) opt1Idx = 2;
    if (opt2Idx === -1) opt2Idx = 3;
    if (opt3Idx === -1) opt3Idx = 4;
    if (ansIdx === -1) ansIdx = 5;
    if (expIdx === -1) expIdx = 6;

    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length <= qIdx || !row[qIdx]) continue;

      const qText = row[qIdx].replace(/^["']|["']$/g, '').trim();
      if (!qText) continue;

      const opt0 = (row[opt0Idx] || '').replace(/^["']|["']$/g, '').trim();
      const opt1 = (row[opt1Idx] || '').replace(/^["']|["']$/g, '').trim();
      const opt2 = (row[opt2Idx] || '').replace(/^["']|["']$/g, '').trim();
      const opt3 = (row[opt3Idx] || '').replace(/^["']|["']$/g, '').trim();
      const explanation = (row[expIdx] || '').replace(/^["']|["']$/g, '').trim();

      const rowCat = catIdx !== -1 && row[catIdx] ? row[catIdx].trim() : '';
      const finalCategory = (categoryField || rowCat || 'Full Model Test').trim();

      const rawAns = row[ansIdx];
      const ansNum = parseAnsIndex(rawAns);

      results.push({
        q: qText,
        options: [opt0, opt1, opt2, opt3].filter(Boolean),
        ans: ansNum,
        explanation,
        category: finalCategory
      });
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid questions could be parsed from the CSV file.' },
        { status: 400 }
      );
    }

    const inserted = await Question.insertMany(results);

    return NextResponse.json({
      success: true,
      count: inserted.length,
      message: `Successfully uploaded ${inserted.length} questions.`
    });
  } catch (err) {
    console.error('CSV UPLOAD ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
