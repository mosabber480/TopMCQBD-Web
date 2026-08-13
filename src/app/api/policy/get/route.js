import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PolicyConfig from '@/models/PolicyConfig';

export async function GET() {
  try {
    await connectDB();
    const policy = await PolicyConfig.findOne();
    return NextResponse.json(policy || { content: '' });
  } catch (error) {
    console.error('GET POLICY ERROR:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
