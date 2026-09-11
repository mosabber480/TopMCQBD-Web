import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authorize } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getConfigPath = () => {
  return path.resolve(process.cwd(), 'src', 'data', 'subjective-model-test-config.json');
};

const readConfig = () => {
  try {
    const p = getConfigPath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading subjective-model-test-config.json:', err);
  }
  return { exams: [], subjects: [], chapters: {}, topics: {} };
};

const writeConfig = (data) => {
  try {
    const p = getConfigPath();
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing subjective-model-test-config.json:', err);
    return false;
  }
};

export async function GET() {
  try {
    const config = readConfig();
    return NextResponse.json({
      success: true,
      exams: config.exams || [],
      subjects: config.subjects || [],
      chapters: config.chapters || {},
      topics: config.topics || {}
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
      if (errorResponse) return errorResponse;
    }

    const body = await request.json();
    const current = readConfig();

    if (body.exams) current.exams = body.exams;
    if (body.subjects) current.subjects = body.subjects;
    if (body.chapters) current.chapters = body.chapters;
    if (body.topics) current.topics = body.topics;

    const ok = writeConfig(current);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to write config file' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subjective Model Test configuration saved successfully',
      exams: current.exams,
      subjects: current.subjects,
      chapters: current.chapters,
      topics: current.topics
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
