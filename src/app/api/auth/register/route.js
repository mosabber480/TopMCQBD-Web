import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields (Name, Email, Password) are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role && ['customer', 'admin'].includes(role) ? role : 'customer'
    });

    await user.save();

    return NextResponse.json(
      { success: true, message: 'User registered successfully!' },
      { status: 201 }
    );
  } catch (err) {
    console.error('REGISTER API ERROR:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Server error occurred during registration' },
      { status: 500 }
    );
  }
}
