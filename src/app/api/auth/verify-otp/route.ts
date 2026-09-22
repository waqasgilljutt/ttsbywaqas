import { NextRequest, NextResponse } from 'next/server';
import { getOTPRecord, deleteOTPRecord } from '@/lib/email-service';
import { registerOrUpdateUser, updateUserPassword, getUserByEmail } from '@/lib/user-store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, purpose, newPassword } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otpRecord = getOTPRecord(normalizedEmail);

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification code has expired or was not requested. Please request a new code.',
        },
        { status: 400 }
      );
    }

    if (otpRecord.code.trim() !== code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Incorrect 6-digit verification code. Please check your Gmail and try again.' },
        { status: 400 }
      );
    }

    // Purpose 1: SIGNUP VERIFICATION
    if (purpose === 'signup') {
      const user = registerOrUpdateUser(
        otpRecord.name || '',
        normalizedEmail,
        otpRecord.password || ''
      );
      deleteOTPRecord(normalizedEmail);

      return NextResponse.json({
        success: true,
        message: 'Account verified and created successfully!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Purpose 2: PASSWORD RESET
    if (purpose === 'reset-password') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const updated = updateUserPassword(normalizedEmail, newPassword);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Failed to reset password. User account not found.' },
          { status: 404 }
        );
      }

      deleteOTPRecord(normalizedEmail);
      const user = getUserByEmail(normalizedEmail);

      return NextResponse.json({
        success: true,
        message: 'Your password has been successfully reset! You can now sign in with your new password.',
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          : undefined,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid purpose specified.' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
