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

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file');
    const categoryPath = formData.get('category');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!categoryPath) {
      return NextResponse.json({ success: false, error: 'Category path is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileContent = buffer.toString('utf-8');
    const lines = fileContent.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV file must have header and at least one data row.' },
        { status: 400 }
      );
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());

    let qIdx = headers.findIndex(h => h === 'question' || h === 'q');
    let opt0Idx = headers.findIndex(h => h === 'opt0' || h === 'option1');
    let opt1Idx = headers.findIndex(h => h === 'opt1' || h === 'option2');
    let opt2Idx = headers.findIndex(h => h === 'opt2' || h === 'option3');
    let opt3Idx = headers.findIndex(h => h === 'opt3' || h === 'option4');
    let ansIdx = headers.findIndex(h => h === 'ans' || h === 'answer');
    let expIdx = headers.findIndex(h => h === 'explanation');

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
      const questionText = row[qIdx];
      const opt0 = row[opt0Idx];
      const opt1 = row[opt1Idx];
      const opt2 = row[opt2Idx];
      const opt3 = row[opt3Idx];

      if (questionText && opt0 && opt1 && opt2 && opt3) {
        results.push({
          q: questionText,
          options: [opt0, opt1, opt2, opt3],
          ans: parseInt(row[ansIdx] || 0),
          explanation: row[expIdx] || '',
          category: categoryPath.toString().trim()
        });
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid rows found in CSV file.' }, { status: 400 });
    }

    await Question.insertMany(results);

    return NextResponse.json({ success: true, count: results.length });
  } catch (err) {
    console.error('CSV UPLOAD ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
