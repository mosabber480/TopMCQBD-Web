import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Question from '@/models/Question';

export async function PUT(request, { params }) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = params;
    const body = await request.json();

    const updatedQuestion = await Question.findByIdAndUpdate(id, body, { new: true });
    if (!updatedQuestion) {
      return NextResponse.json({ success: false, message: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedQuestion });
  } catch (err) {
    console.error('UPDATE QUESTION ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner', 'admin']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { id } = params;

    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    console.error('DELETE QUESTION ERROR:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
