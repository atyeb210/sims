import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyTokenHash } from '@/lib/jwt';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = verifyEmailSchema.parse(body);
    const { token, email } = validatedData;

    // Connect to database
    await connectDB();

    // Find user by email
    const user = await User.findOne({ 
      email,
      emailVerificationExpires: { $gt: new Date() }, // Token not expired
    });

    if (!user || !user.emailVerificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }

    // Verify the token
    const isValidToken = verifyTokenHash(token, user.emailVerificationToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user email verification status and clear verification token
    await User.findByIdAndUpdate(user._id, {
      emailVerified: true,
      $unset: {
        emailVerificationToken: 1,
        emailVerificationExpires: 1,
      },
    });

    console.log(`Email verified for user: ${email}`);

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 