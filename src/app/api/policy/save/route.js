import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import PolicyConfig from '@/models/PolicyConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { content } = await request.json();

    let policy = await PolicyConfig.findOne();
    if (policy) {
      policy.content = content || '';
      policy.updatedAt = new Date();
      await policy.save();
    } else {
      policy = new PolicyConfig({ content: content || '' });
      await policy.save();
    }

    return NextResponse.json({ message: 'Policy saved successfully!' });
  } catch (error) {
    console.error('SAVE POLICY ERROR:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
