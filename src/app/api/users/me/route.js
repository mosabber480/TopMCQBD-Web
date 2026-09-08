import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { user, errorResponse } = await authenticate(request);
    if (errorResponse) return errorResponse;

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username || (user.name ? user.name.split(' ')[0] : ''),
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        subscription: user.subscription,
        pendingRequests: user.pendingRequests,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('GET ME ERROR:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { user, errorResponse } = await authenticate(request);
    if (errorResponse) return errorResponse;

    await connectDB();
    const body = await request.json();
    const { name, username, email, phone } = body;

    const dbUser = await User.findById(user._id);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'ইউজার পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    if (name && name.trim()) {
      dbUser.name = name.trim();
    }
    if (username !== undefined) {
      dbUser.username = username.replace(/\s+/g, '');
    }
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== dbUser.email) {
        const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: dbUser._id } });
        if (existingEmail) {
          return NextResponse.json(
            { success: false, message: 'এই ইমেইলটি অন্য একটি অ্যাকাউন্টে ইতিমধ্যে ব্যবহার করা হয়েছে।' },
            { status: 400 }
          );
        }
        dbUser.email = cleanEmail;
      }
    }
    if (phone !== undefined) {
      dbUser.phone = phone.trim();
    }

    await dbUser.save();

    const updatedUser = {
      id: dbUser._id,
      name: dbUser.name,
      username: dbUser.username || (dbUser.name ? dbUser.name.split(' ')[0] : ''),
      email: dbUser.email,
      phone: dbUser.phone || '',
      role: dbUser.role,
      subscription: dbUser.subscription,
      pendingRequests: dbUser.pendingRequests,
      createdAt: dbUser.createdAt
    };

    return NextResponse.json({
      success: true,
      message: 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!',
      user: updatedUser
    });
  } catch (err) {
    console.error('PUT ME ERROR:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
