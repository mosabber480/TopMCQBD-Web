import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendResetEmail } from '@/lib/brevo';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email address not found.' },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${origin}/login?token=${token}&email=${encodeURIComponent(user.email)}`;

    console.log('🔗 Generated Reset Link:', resetLink);

    try {
      await sendResetEmail(user, resetLink);
    } catch (emailErr) {
      console.error('Brevo Email dispatch failed:', emailErr);
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email via Brevo service.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email.'
    });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Server error occurred' },
      { status: 500 }
    );
  }
}
