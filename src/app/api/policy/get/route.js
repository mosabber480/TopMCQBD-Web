import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import policyConfigData from '@/data/policy-config.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'src', 'data', 'policy-config.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return NextResponse.json(JSON.parse(raw));
    }
  } catch (error) {
    console.error('GET POLICY ERROR:', error);
  }
  return NextResponse.json(policyConfigData || { content: '' });
}
