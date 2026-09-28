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
  extendUserPlanDays,
  adjustUserCreditLimit,
  persistUsersToDisk,
  replaceAllUsers,
  PLANS_CONFIG,
  UserPlanType,
  isStrictGmail,
  DEFAULT_ADMIN_PIN,
  OWNER_EMAIL,
  StoredUser,
} from '@/lib/user-store';
import { getActiveOTPs } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

function getEnrichedUsers(): StoredUser[] {
  const rawUsers = getAllUsers();
  const now = Date.now();
  return rawUsers.map((u) => {
    let daysRemaining: number | null = null;
    let planStatus: 'active' | 'expiring_soon' | 'expired' = u.planStatus || 'active';

    if (u.role !== 'owner' && u.planExpiresAt) {
      const diffMs = new Date(u.planExpiresAt).getTime() - now;
      if (diffMs <= 0) {
        daysRemaining = 0;
        planStatus = 'expired';
        u.planStatus = 'expired';
      } else {
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 3) {
          planStatus = 'expiring_soon';
          u.planStatus = 'expiring_soon';
        } else {
          planStatus = 'active';
          u.planStatus = 'active';
        }
      }
    }
    return {
      ...u,
      daysRemaining,
      planStatus,
    };
  });
}

export async function GET(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin') || req.nextUrl.searchParams.get('pin');
  const userEmail = req.headers.get('x-user-email') || req.nextUrl.searchParams.get('email');

  const isOwner = userEmail && userEmail.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const isPinValid = pin === DEFAULT_ADMIN_PIN;

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
  };

  if (!isOwner && !isPinValid) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required.' },
      { status: 403, headers: noCacheHeaders }
    );
  }

  const users = getEnrichedUsers();
  const otps = getActiveOTPs();
  return NextResponse.json({ success: true, users, otps }, { headers: noCacheHeaders });
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

    // Register, Sync or Admin Create user
    if (action === 'register' || action === 'sync' || action === 'admin-create-user') {
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
      persistUsersToDisk();
      if (action === 'admin-create-user') {
        return NextResponse.json({ success: true, user, users: getEnrichedUsers() });
      }
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

    // Get live credit balance and monthly expiry status for a user
    if (action === 'get-credits') {
      const { email, clientCreditsUsed } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email required.' }, { status: 400 });
      }
      let user: StoredUser | null | undefined = getUserByEmail(email);
      if (!user && isStrictGmail(email)) {
        user = registerOrUpdateUser(email.split('@')[0], email);
      }
      if (user && typeof clientCreditsUsed === 'number' && clientCreditsUsed > (user.creditsUsed || 0)) {
        user.creditsUsed = clientCreditsUsed;
      }
      const balance = checkCreditBalance(email, 0);
      return NextResponse.json({ success: true, balance });
    }

    // Record voice synthesis / cloning usage and deduct credits (1 char = 1 credit)
    if (action === 'increment-usage') {
      const { email, characters, creditsUsed } = body;
      if (email) {
        let user: StoredUser | null | undefined = getUserByEmail(email);
        if (!user && isStrictGmail(email)) {
          user = registerOrUpdateUser(email.split('@')[0], email);
        }
        recordAudioGeneration(email);
        if (typeof creditsUsed === 'number' && user) {
          user.creditsUsed = Math.max(user.creditsUsed || 0, creditsUsed);
          persistUsersToDisk();
        } else if (characters && typeof characters === 'number') {
          deductCredits(email, characters);
        }
      }
      const balance = email ? checkCreditBalance(email, 0) : null;
      return NextResponse.json({ success: true, balance });
    }

    // Protected Admin Actions: Toggle Block, Delete, Plan & Expiry Management
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

    // Admin: Restore / Import Database from JSON Backup
    if (action === 'restore-backup') {
      const { backupUsers } = body;
      if (!Array.isArray(backupUsers) || backupUsers.length === 0) {
        return NextResponse.json({ success: false, error: 'Invalid backup file or empty user list.' }, { status: 400 });
      }
      const ok = replaceAllUsers(backupUsers);
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Failed to restore database from backup.' }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Successfully restored ${backupUsers.length} accounts to database!`,
        users: getEnrichedUsers(),
      });
    }

    // Admin: Set a predefined monthly plan (Free, 1M, 3M, 10M, Unlimited)
    if (action === 'set-plan') {
      const { userId, planKey, durationDays } = body;
      const result = setUserPlan(userId, planKey as UserPlanType, durationDays ? Number(durationDays) : 30);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user, users: getEnrichedUsers() });
    }

    // Admin: Extend existing plan by X days (+30 days, etc.)
    if (action === 'extend-plan') {
      const { userId, extraDays } = body;
      const result = extendUserPlanDays(userId, extraDays ? Number(extraDays) : 30);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user, users: getEnrichedUsers() });
    }

    // Admin: Dynamically adjust / set custom credit limit with validity duration
    if (action === 'adjust-credits') {
      const { userId, newCreditLimit, customPlanName, durationDays } = body;
      const result = adjustUserCreditLimit(
        userId,
        Number(newCreditLimit),
        customPlanName,
        durationDays ? Number(durationDays) : 30
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user, users: getEnrichedUsers() });
    }

    if (action === 'toggle-block') {
      const { userId } = body;
      const result = toggleBlockUser(userId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user, users: getEnrichedUsers() });
    }

    if (action === 'delete') {
      const { userId } = body;
      const result = deleteUser(userId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, users: getEnrichedUsers() });
    }

    return NextResponse.json({ success: false, error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
