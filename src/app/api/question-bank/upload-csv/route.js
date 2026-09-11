import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectQuestionBankDB } from '@/lib/db';
import getQuestionBankModel from '@/models/QuestionBankQuestion';

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
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    const conn = await connectQuestionBankDB();
    const QuestionBankModel = getQuestionBankModel(conn);

    const formData = await request.formData();
    const file = formData.get('file');
    const categoryField = formData.get('category');
    const yearField = formData.get('year') || '';
    const examTitleField = formData.get('examTitle') || '';

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
    let yearIdx = headers.findIndex((h) => h === 'year' || h === 'সাল');
    let examIdx = headers.findIndex((h) => h === 'examtitle' || h === 'exam');

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

      const rowCategory = (catIdx !== -1 && row[catIdx]) ? row[catIdx] : categoryField;
      const rowYear = (yearIdx !== -1 && row[yearIdx]) ? row[yearIdx] : yearField;
      const rowExamTitle = (examIdx !== -1 && row[examIdx]) ? row[examIdx] : examTitleField;

      if (questionText && opt0 && opt1 && opt2 && opt3 && rowCategory) {
        results.push({
          q: questionText.trim(),
          options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
          ans: parseAnsIndex(row[ansIdx]),
          explanation: (expIdx !== -1 && row[expIdx]) ? row[expIdx].trim() : '',
          category: String(rowCategory).trim(),
          year: String(rowYear || '').trim(),
          examTitle: String(rowExamTitle || '').trim()
        });
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid rows found in CSV file. Ensure all rows have question, 4 options, and category.' },
        { status: 400 }
      );
    }

    const inserted = await QuestionBankModel.insertMany(results);

    return NextResponse.json({ success: true, count: inserted.length });
  } catch (err) {
    console.error('QUESTION BANK CSV UPLOAD ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
