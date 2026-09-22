// User and Owner Store for TTS bY Waqas Gill (EmpireNexs)

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  lastActive: string;
  voicesGenerated: number;
  role: 'owner' | 'user';
  isBlocked: boolean;
}

export const OWNER_EMAIL = 'muhammadwaqasmwg@gmail.com';
export const DEFAULT_ADMIN_PIN = process.env.ADMIN_SECRET_PIN || '7860';

// In-memory cache on server, seeded with Waqas Gill owner account
let usersCache: StoredUser[] = [
  {
    id: 'owner-waqas',
    name: 'Waqas Gill',
    email: OWNER_EMAIL,
    password: 'owner_password_secure',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    voicesGenerated: 120,
    role: 'owner',
    isBlocked: false,
  },
];

export function isStrictGmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email.trim());
}

export function getAllUsers(): StoredUser[] {
  // Enforce Gmail only: automatically purge any temp/disposable/non-gmail accounts
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

  if (existing) {
    existing.lastActive = new Date().toISOString();
    if (name && name.trim()) existing.name = name.trim();
    if (password) existing.password = password;
    return existing;
  }

  const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();
  const newUser: StoredUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name?.trim() || (isOwner ? 'Waqas Gill' : normalizedEmail.split('@')[0]),
    email: normalizedEmail,
    password: password || '',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    role: isOwner ? 'owner' : 'user',
    isBlocked: false,
  };

  usersCache.unshift(newUser);
  return newUser;
}

export function updateUserPassword(email: string, newPassword: string): boolean {
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

export function recordAudioGeneration(email: string): void {
  const user = getUserByEmail(email);
  if (user) {
    user.voicesGenerated = (user.voicesGenerated || 0) + 1;
    user.lastActive = new Date().toISOString();
  }
}
