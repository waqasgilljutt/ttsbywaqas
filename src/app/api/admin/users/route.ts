import { NextRequest, NextResponse } from 'next/server';
import {
  getAllUsers,
  getUserByEmail,
  registerOrUpdateUser,
  toggleBlockUser,
  deleteUser,
  recordAudioGeneration,
  DEFAULT_ADMIN_PIN,
  OWNER_EMAIL,
} from '@/lib/user-store';

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
  return NextResponse.json({ success: true, users });
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

    // Register or Sync user
    if (action === 'register' || action === 'sync') {
      const { name, email } = body;
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
      }
      const user = registerOrUpdateUser(name, email);
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

    // Record voice synthesis / cloning usage
    if (action === 'increment-usage') {
      const { email } = body;
      if (email) {
        recordAudioGeneration(email);
      }
      return NextResponse.json({ success: true });
    }

    // Protected Admin Actions: Toggle Block & Delete
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
