import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid Email or Password' },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid Email or Password' },
        { status: 400 }
      );
    }

    // Auto-deactivate expired subscriptions
    if (
      user.subscription &&
      user.subscription.active &&
      user.subscription.endDate &&
      new Date() > new Date(user.subscription.endDate)
    ) {
      user.subscription.active = false;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        pendingRequests: user.pendingRequests
      }
    });
  } catch (err) {
    console.error('LOGIN API ERROR:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Server error occurred during login' },
      { status: 500 }
    );
  }
}
