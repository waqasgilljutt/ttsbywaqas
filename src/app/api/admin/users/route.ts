import { NextRequest, NextResponse } from 'next/server';
import {
  getAllUsers,
  getUserByEmail,
  registerOrUpdateUser,
  toggleBlockUser,
  deleteUser,
  recordAudioGeneration,
  checkCreditBalance,
  deductCredits,
  setUserPlan,
  adjustUserCreditLimit,
  PLANS_CONFIG,
  UserPlanType,
  isStrictGmail,
  DEFAULT_ADMIN_PIN,
  OWNER_EMAIL,
} from '@/lib/user-store';
import { getActiveOTPs } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin');
  const userEmail = req.headers.get('x-user-email');

  const isOwner = userEmail && userEmail.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isPinValid = pin === DEFAULT_ADMIN_PIN;

  if (!isOwner && !isPinValid) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required.' },
      { status: 403 }
    );
  }

  const users = getAllUsers();
  const otps = getActiveOTPs();
  return NextResponse.json({ success: true, users, otps });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // Verify PIN action
    if (action === 'verify-pin') {
      const { pin } = body;
      if (pin === DEFAULT_ADMIN_PIN) {
        return NextResponse.json({ success: true, message: 'PIN verified successfully' });
      } else {
        return NextResponse.json({ success: false, error: 'Incorrect secret PIN.' }, { status: 401 });
      }
    }

    // Login action
    if (action === 'login') {
      const { email, password } = body;
      if (!email || !isStrictGmail(email)) {
        return NextResponse.json(
          { success: false, error: 'Only official @gmail.com accounts are accepted.' },
          { status: 400 }
        );
      }
      const normalizedEmail = email.trim().toLowerCase();
      const user = getUserByEmail(normalizedEmail);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No account found with this Gmail address. Please Sign Up first.' },
          { status: 404 }
        );
      }
      if (user.isBlocked) {
        return NextResponse.json(
          {
            success: false,
            error: 'Your account has been blocked by the administrator (Waqas Gill). Please contact muhammadwaqasmwg@gmail.com.',
          },
          { status: 403 }
        );
      }
      if (user.password && password && user.password !== password) {
        return NextResponse.json(
          {
            success: false,
            error: 'Incorrect password. Click "Forgot Password?" below to reset it via your Gmail.',
          },
          { status: 401 }
        );
      }
      return NextResponse.json({ success: true, user });
    }

    // Register or Sync user
    if (action === 'register' || action === 'sync') {
      const { name, email, password, creditsUsed, creditLimit, plan, planName } = body;
      if (!email || !isStrictGmail(email)) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Only official @gmail.com accounts are accepted. Temporary, disposable, and non-Gmail emails are strictly blocked.',
          },
          { status: 400 }
        );
      }
      const user = registerOrUpdateUser(name, email, password);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to register. Only valid @gmail.com accounts are permitted.',
          },
          { status: 400 }
        );
      }
      if (typeof creditsUsed === 'number' && creditsUsed > (user.creditsUsed || 0)) {
        user.creditsUsed = creditsUsed;
      }
      if (typeof creditLimit === 'number') {
        user.creditLimit = creditLimit;
      }
      if (plan) user.plan = plan;
      if (planName) user.planName = planName;
      return NextResponse.json({ success: true, user });
    }

    // Check user block status
    if (action === 'check-status') {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email required.' }, { status: 400 });
      }
      const user = getUserByEmail(email);
      return NextResponse.json({
        success: true,
        isBlocked: user ? user.isBlocked : false,
      });
    }

    // Get live credit balance for a user
    if (action === 'get-credits') {
      const { email, clientCreditsUsed } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email required.' }, { status: 400 });
      }
      if (typeof clientCreditsUsed === 'number') {
        const user = getUserByEmail(email);
        if (user && clientCreditsUsed > (user.creditsUsed || 0)) {
          user.creditsUsed = clientCreditsUsed;
        }
      }
      const balance = checkCreditBalance(email, 0);
      return NextResponse.json({ success: true, balance });
    }

    // Record voice synthesis / cloning usage and deduct credits (1 char = 1 credit)
    if (action === 'increment-usage') {
      const { email, characters, creditsUsed } = body;
      if (email) {
        recordAudioGeneration(email);
        if (characters && typeof characters === 'number') {
          deductCredits(email, characters);
        }
        if (typeof creditsUsed === 'number') {
          const user = getUserByEmail(email);
          if (user && creditsUsed > (user.creditsUsed || 0)) {
            user.creditsUsed = creditsUsed;
          }
        }
      }
      const balance = email ? checkCreditBalance(email, 0) : null;
      return NextResponse.json({ success: true, balance });
    }

    // Protected Admin Actions: Toggle Block, Delete, Plan & Credit Management
    const pin = body.pin || req.headers.get('x-admin-pin');
    const userEmail = req.headers.get('x-user-email');
    const isOwner = userEmail && userEmail.toLowerCase() === OWNER_EMAIL.toLowerCase();
    const isPinValid = pin === DEFAULT_ADMIN_PIN;

    if (!isOwner && !isPinValid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid Admin PIN or credentials.' },
        { status: 403 }
      );
    }

    // Admin: Set a predefined plan (Free, 1M, 3M, 10M, Unlimited)
    if (action === 'set-plan') {
      const { userId, planKey } = body;
      const result = setUserPlan(userId, planKey as UserPlanType);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user, users: getAllUsers() });
    }

    // Admin: Dynamically adjust / set custom credit limit
    if (action === 'adjust-credits') {
      const { userId, newCreditLimit, customPlanName } = body;
      const result = adjustUserCreditLimit(userId, Number(newCreditLimit), customPlanName);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user, users: getAllUsers() });
    }

    if (action === 'toggle-block') {
      const { userId } = body;
      const result = toggleBlockUser(userId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user, users: getAllUsers() });
    }

    if (action === 'delete') {
      const { userId } = body;
      const result = deleteUser(userId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, users: getAllUsers() });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
