// User and Owner Store for TTS bY Waqas Gill (EmpireNexs)
// Features: 1 Char = 1 Credit, Monthly PKR Plans (30-day validity), Auto-Expiration, Expiring Soon Alerts, Admin Expiry Controls

export type UserPlanType = 'free' | '1m' | '3m' | '10m' | 'unlimited';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  lastActive: string;
  voicesGenerated: number;
  creditsUsed: number;
  creditLimit: number; // 30,000 for free, 1,000,000 for 1M, etc., or -1 for Unlimited
  plan: UserPlanType;
  planName: string;
  isPaid: boolean;
  role: 'owner' | 'user';
  isBlocked: boolean;
  // Monthly billing & expiration fields
  planActivatedAt?: string;
  planExpiresAt?: string | null; // null for permanent owner account
  planStatus?: 'active' | 'expiring_soon' | 'expired';
  daysRemaining?: number | null;
}

export const OWNER_EMAIL = 'muhammadwaqasmwg@gmail.com';
export const DEFAULT_ADMIN_PIN = process.env.ADMIN_SECRET_PIN || '7860';

export const FREE_INITIAL_CREDITS = 30000;
export const MAX_PER_VOICE_CHARACTERS = 50000;
export const STANDARD_PLAN_DAYS = 30;

export const PLANS_CONFIG = {
  free: {
    name: 'Free Starter (Monthly)',
    credits: 30000,
    pricePKR: 0,
    period: 'monthly',
    validityDays: 30,
    description: '30,000 Credits / Month (Renews every 30 days)',
  },
  '1m': {
    name: 'Starter Pack (1M / Month)',
    credits: 1000000,
    pricePKR: 300,
    period: 'monthly',
    validityDays: 30,
    description: '1,000,000 Credits for Rs. 300 PKR / Month',
  },
  '3m': {
    name: 'Creator Pack (3M / Month)',
    credits: 3000000,
    pricePKR: 900,
    period: 'monthly',
    validityDays: 30,
    description: '3,000,000 Credits for Rs. 900 PKR / Month',
  },
  '10m': {
    name: 'Pro Studio (10M / Month)',
    credits: 10000000,
    pricePKR: 2500,
    period: 'monthly',
    validityDays: 30,
    description: '10,000,000 Credits for Rs. 2,500 PKR / Month',
  },
  unlimited: {
    name: 'Unlimited VIP (1 Month)',
    credits: -1, // -1 denotes unlimited
    pricePKR: 4000,
    period: 'monthly',
    validityDays: 30,
    description: 'Unlimited Voice Generations for Rs. 4,000 PKR / Month',
  },
};

export function isStrictGmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}

// In-memory cache on server seeded with Waqas Gill owner account and test user
let usersCache: StoredUser[] = [
  {
    id: 'owner-waqas',
    name: 'Waqas Gill',
    email: OWNER_EMAIL,
    password: 'owner_password_secure',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    voicesGenerated: 120,
    creditsUsed: 0,
    creditLimit: -1, // Unlimited
    plan: 'unlimited',
    planName: 'Unlimited VIP (Owner)',
    isPaid: true,
    role: 'owner',
    isBlocked: false,
    planActivatedAt: new Date().toISOString(),
    planExpiresAt: null, // Owner never expires
    planStatus: 'active',
  },
  {
    id: 'user_1790054111',
    name: 'saiem049382',
    email: 'saiem049382@gmail.com',
    createdAt: '2026-09-21T23:00:00.000Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    creditsUsed: 0,
    creditLimit: FREE_INITIAL_CREDITS,
    plan: 'free',
    planName: 'Free Starter (Monthly)',
    isPaid: false,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-09-21T23:00:00.000Z',
    planExpiresAt: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(), // 24 days left
    planStatus: 'active',
  },
];

export function getAllUsers(): StoredUser[] {
  // Enforce Gmail only: automatically purge any non-gmail accounts
  usersCache = usersCache.filter((u) => isStrictGmail(u.email));
  return usersCache;
}

export function getUserByEmail(email: string): StoredUser | undefined {
  if (!isStrictGmail(email)) return undefined;
  return usersCache.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function isEmailRegistered(email: string): boolean {
  return !!getUserByEmail(email);
}

export function registerOrUpdateUser(name: string, email: string, password?: string): StoredUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isStrictGmail(normalizedEmail)) {
    console.warn(`[User Store] Blocked registration of non-Gmail account: ${email}`);
    return null;
  }

  const existing = getUserByEmail(normalizedEmail);
  const now = new Date();

  if (existing) {
    existing.lastActive = now.toISOString();
    if (name && name.trim()) existing.name = name.trim();
    if (password) existing.password = password;
    if (existing.creditsUsed === undefined) existing.creditsUsed = 0;
    if (existing.creditLimit === undefined) existing.creditLimit = existing.role === 'owner' ? -1 : FREE_INITIAL_CREDITS;
    if (!existing.plan) existing.plan = existing.role === 'owner' ? 'unlimited' : 'free';
    if (!existing.planName) existing.planName = existing.role === 'owner' ? 'Unlimited VIP (Owner)' : 'Free Starter (Monthly)';
    
    // Ensure expiration date is set for regular users
    if (existing.role !== 'owner' && !existing.planExpiresAt) {
      existing.planActivatedAt = now.toISOString();
      existing.planExpiresAt = new Date(now.getTime() + STANDARD_PLAN_DAYS * 24 * 60 * 60 * 1000).toISOString();
    }
    return existing;
  }

  const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();
  const newUser: StoredUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name?.trim() || (isOwner ? 'Waqas Gill' : normalizedEmail.split('@')[0]),
    email: normalizedEmail,
    password: password || '',
    createdAt: now.toISOString(),
    lastActive: now.toISOString(),
    voicesGenerated: 0,
    creditsUsed: 0,
    creditLimit: isOwner ? -1 : FREE_INITIAL_CREDITS,
    plan: isOwner ? 'unlimited' : 'free',
    planName: isOwner ? 'Unlimited VIP (Owner)' : 'Free Starter (Monthly)',
    isPaid: isOwner,
    role: isOwner ? 'owner' : 'user',
    isBlocked: false,
    planActivatedAt: now.toISOString(),
    planExpiresAt: isOwner ? null : new Date(now.getTime() + STANDARD_PLAN_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    planStatus: 'active',
  };

  usersCache.unshift(newUser);
  return newUser;
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  if (!isStrictGmail(email)) return false;
  const user = getUserByEmail(email);
  if (!user) return false;
  user.password = newPassword;
  user.lastActive = new Date().toISOString();
  return true;
}

export function toggleBlockUser(userId: string): { success: boolean; user?: StoredUser; error?: string } {
  const user = usersCache.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return { success: false, error: 'Owner account cannot be blocked.' };
  }

  user.isBlocked = !user.isBlocked;
  return { success: true, user };
}

export function deleteUser(userId: string): { success: boolean; error?: string } {
  const index = usersCache.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, error: 'User not found' };
  }

  if (usersCache[index].email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return { success: false, error: 'Owner account cannot be deleted.' };
  }

  usersCache.splice(index, 1);
  return { success: true };
}

/**
 * Checks if user has enough credits and whether their monthly plan is active or expired.
 * 1 Character = 1 Credit.
 */
export function checkCreditBalance(
  email: string,
  requestedCharacters: number
): {
  allowed: boolean;
  isUnlimited: boolean;
  creditsUsed: number;
  creditLimit: number;
  remainingCredits: number;
  planName: string;
  planExpiresAt?: string | null;
  daysRemaining?: number | null;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
  error?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

  let user: StoredUser | null | undefined = getUserByEmail(normalizedEmail);
  if (!user && isStrictGmail(normalizedEmail)) {
    user = registerOrUpdateUser(normalizedEmail.split('@')[0], normalizedEmail);
  }

  if (!user) {
    return {
      allowed: false,
      isUnlimited: false,
      creditsUsed: 0,
      creditLimit: FREE_INITIAL_CREDITS,
      remainingCredits: 0,
      planName: 'Free Starter (Monthly)',
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: false,
      error: 'Please sign in with your official @gmail.com account to generate speech.',
    };
  }

  // --- MONTHLY EXPIRATION CHECK ---
  let daysRemaining: number | null = null;
  let isExpired = false;
  let isExpiringSoon = false;

  if (!isOwner && user.planExpiresAt) {
    const expiresTime = new Date(user.planExpiresAt).getTime();
    const nowTime = Date.now();
    const diffMs = expiresTime - nowTime;

    if (diffMs <= 0) {
      isExpired = true;
      daysRemaining = 0;
      user.planStatus = 'expired';
    } else {
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysRemaining <= 3) {
        isExpiringSoon = true;
        user.planStatus = 'expiring_soon';
      } else {
        user.planStatus = 'active';
      }
    }
  }

  // If plan is expired, immediately block synthesis and require renewal
  if (isExpired) {
    const formattedExpiry = user.planExpiresAt
      ? new Date(user.planExpiresAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      : 'recently';

    return {
      allowed: false,
      isUnlimited: false,
      creditsUsed: user.creditsUsed || 0,
      creditLimit: user.creditLimit || FREE_INITIAL_CREDITS,
      remainingCredits: 0,
      planName: `${user.planName || 'Monthly Plan'} (Expired)`,
      planExpiresAt: user.planExpiresAt,
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: true,
      error: `Your monthly plan expired on ${formattedExpiry}. Please renew your plan from Pricing to continue generating studio voiceovers.`,
    };
  }

  const isUnlimited = isOwner || user.creditLimit === -1 || user.plan === 'unlimited';

  if (isUnlimited) {
    return {
      allowed: true,
      isUnlimited: true,
      creditsUsed: user.creditsUsed || 0,
      creditLimit: -1,
      remainingCredits: Infinity,
      planName: isOwner ? 'Unlimited VIP (Owner)' : (user.planName || 'Unlimited VIP (1 Month)'),
      planExpiresAt: user.planExpiresAt,
      daysRemaining,
      isExpiringSoon,
      isExpired: false,
    };
  }

  const limit = user.creditLimit || FREE_INITIAL_CREDITS;
  const used = user.creditsUsed || 0;
  const remaining = Math.max(0, limit - used);

  if (used + requestedCharacters > limit) {
    return {
      allowed: false,
      isUnlimited: false,
      creditsUsed: used,
      creditLimit: limit,
      remainingCredits: remaining,
      planName: user.planName || 'Free Starter (Monthly)',
      planExpiresAt: user.planExpiresAt,
      daysRemaining,
      isExpiringSoon,
      isExpired: false,
      error: `Credit limit reached: You have ${remaining.toLocaleString()} credits remaining (${used.toLocaleString()} / ${limit.toLocaleString()} used). This generation requires ${requestedCharacters.toLocaleString()} credits. Please upgrade or recharge your plan.`,
    };
  }

  return {
    allowed: true,
    isUnlimited: false,
    creditsUsed: used,
    creditLimit: limit,
    remainingCredits: remaining - requestedCharacters,
    planName: user.planName || 'Free Starter (Monthly)',
    planExpiresAt: user.planExpiresAt,
    daysRemaining,
    isExpiringSoon,
    isExpired: false,
  };
}

/**
 * Records audio generation count for a user.
 */
export function recordAudioGeneration(email: string): void {
  if (!isStrictGmail(email)) return;
  const user = getUserByEmail(email);
  if (!user) return;
  user.voicesGenerated = (user.voicesGenerated || 0) + 1;
  user.lastActive = new Date().toISOString();
}

/**
 * Deducts characters/credits from user after synthesis completes.
 */
export function deductCredits(email: string, charactersCount: number): void {
  if (!isStrictGmail(email)) return;
  const user = getUserByEmail(email);
  if (!user) return;

  user.creditsUsed = (user.creditsUsed || 0) + charactersCount;
  user.voicesGenerated = (user.voicesGenerated || 0) + 1;
  user.lastActive = new Date().toISOString();
}

/**
 * Admin action: Assign or renew a specific monthly plan for a user.
 * durationDays defaults to 30 days (1 month).
 */
export function setUserPlan(
  userId: string,
  planKey: UserPlanType,
  durationDays = STANDARD_PLAN_DAYS
): { success: boolean; user?: StoredUser; error?: string } {
  const user = usersCache.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const planInfo = PLANS_CONFIG[planKey];
  if (!planInfo) {
    return { success: false, error: 'Invalid plan selected' };
  }

  const now = new Date();
  user.plan = planKey;
  user.planName = planInfo.name;
  user.creditLimit = planInfo.credits;
  user.creditsUsed = 0; // Reset credit cycle on new plan purchase
  user.isPaid = planKey !== 'free';
  user.planActivatedAt = now.toISOString();

  if (user.role === 'owner') {
    user.planExpiresAt = null;
    user.planStatus = 'active';
  } else {
    user.planExpiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    user.planStatus = 'active';
  }

  user.lastActive = now.toISOString();
  return { success: true, user };
}

/**
 * Admin action: Extend an existing plan by X days (e.g. +30 days).
 */
export function extendUserPlanDays(
  userId: string,
  extraDays = STANDARD_PLAN_DAYS
): { success: boolean; user?: StoredUser; error?: string } {
  const user = usersCache.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (user.role === 'owner') {
    return { success: true, user };
  }

  const now = Date.now();
  let baseTime = now;
  if (user.planExpiresAt) {
    const existingExpires = new Date(user.planExpiresAt).getTime();
    if (existingExpires > now) {
      baseTime = existingExpires; // extend from current future date
    }
  }

  user.planExpiresAt = new Date(baseTime + extraDays * 24 * 60 * 60 * 1000).toISOString();
  user.planStatus = 'active';
  user.lastActive = new Date().toISOString();

  return { success: true, user };
}

/**
 * Admin action: Increase or decrease a user's credit limit dynamically.
 */
export function adjustUserCreditLimit(
  userId: string,
  newCreditLimit: number,
  customPlanName?: string,
  durationDays = STANDARD_PLAN_DAYS
): { success: boolean; user?: StoredUser; error?: string } {
  const user = usersCache.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const now = new Date();
  user.creditLimit = newCreditLimit;
  if (customPlanName) {
    user.planName = customPlanName;
  }
  user.isPaid = newCreditLimit > FREE_INITIAL_CREDITS || newCreditLimit === -1;
  user.lastActive = now.toISOString();

  if (user.role !== 'owner') {
    user.planActivatedAt = now.toISOString();
    user.planExpiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    user.planStatus = 'active';
  }

  return { success: true, user };
}
