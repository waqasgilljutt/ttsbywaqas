import { NextRequest, NextResponse } from 'next/server';
import { isEmailRegistered, getUserByEmail } from '@/lib/user-store';
import {
  generateOTPCode,
  saveOTPRecord,
  sendOTPEmail,
  OTPRecord,
} from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, purpose, name, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. STRICT GMAIL-ONLY VALIDATION & TEMP MAIL BLOCK
    const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(normalizedEmail);
    if (!isGmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Only official @gmail.com accounts are accepted. Temporary, disposable, and non-Gmail emails are strictly blocked.',
        },
        { status: 400 }
      );
    }

    // 2. CHECK BLOCK STATUS
    const existingUser = getUserByEmail(normalizedEmail);
    if (existingUser && existingUser.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This account has been blocked by the administrator (Waqas Gill). Please contact muhammadwaqasmwg@gmail.com.',
        },
        { status: 403 }
      );
    }

    // 3. ONE ACCOUNT PER GMAIL CONSTRAINT
    if (purpose === 'signup') {
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error:
              'This Gmail address is already registered. Please Sign In instead, or use Forgot Password if you lost your password.',
          },
          { status: 400 }
        );
      }
    }

    // 4. FORGOT PASSWORD CONSTRAINT
    if (purpose === 'reset-password') {
      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error:
              'No account found with this Gmail address. Please Sign Up to create your free account.',
          },
          { status: 404 }
        );
      }
    }

    // 5. GENERATE & SAVE 6-DIGIT OTP
    const code = generateOTPCode();
    const otpRecord: OTPRecord = {
      email: normalizedEmail,
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      purpose: purpose || 'signup',
      name: name?.trim(),
      password: password || '',
      createdAt: new Date().toISOString(),
    };
    saveOTPRecord(otpRecord);

    // 6. SEND EMAIL TO GMAIL
    const emailResult = await sendOTPEmail(normalizedEmail, code, purpose || 'signup', name);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      deliveredViaSMTP: emailResult.deliveredViaSMTP,
      // Provide OTP code in response if SMTP credentials aren't set yet or in dev so testing is never blocked
      fallbackCode: !emailResult.deliveredViaSMTP ? code : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send verification code';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
