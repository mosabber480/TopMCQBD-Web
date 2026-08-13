import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { authorize } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { user: currentAdmin, errorResponse } = await authorize(request, ['owner']);
    if (errorResponse) return errorResponse;

    await connectDB();
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();

    return NextResponse.json(
      { success: true, message: 'Admin account created successfully!' },
      { status: 201 }
    );
  } catch (err) {
    console.error('CREATE ADMIN ERROR:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
