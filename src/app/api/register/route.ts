import db from '@/lib/db';
import { users, settings } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    // Check if registration is enabled
    const setting = await db.select().from(settings).get();
    if (setting && !setting.registrationOpen) {
      return NextResponse.json(
        { error: 'Registration is currently disabled' },
        { status: 403 },
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 },
      );
    }

    // Hash password and create user
    console.log('Creating user:', email);
    const hash = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    const result = await db.insert(users).values({ email, passwordHash: hash });
    console.log('User created:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
