// User and Owner Store for TTS bY Waqas Gill (EmpireNexs)
// Persistent Storage with data/users.json & /tmp fallback, strict Gmail validation, monthly billing & auto-expiration

import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  StoredUser,
  UserPlanType,
  OWNER_EMAIL,
  FREE_INITIAL_CREDITS,
  STANDARD_PLAN_DAYS,
  PLANS_CONFIG,
  isStrictGmail,
} from './user-types';

export * from './user-types';

const PRIMARY_DATA_PATH = path.join(process.cwd(), 'data', 'users.json');
const FALLBACK_DATA_PATH = path.join(os.tmpdir(), 'empirenexs_users.json');

// Default initial seeded users
const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'owner-waqas',
    name: 'Waqas Gill',
    email: OWNER_EMAIL,
    password: 'owner_password_secure',
    createdAt: '2026-09-20T10:00:00.000Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 121,
    creditsUsed: 230018,
    creditLimit: -1, // Unlimited
    plan: 'unlimited',
    planName: 'Unlimited VIP (Owner)',
    isPaid: true,
    role: 'owner',
    isBlocked: false,
    planActivatedAt: '2026-09-20T10:00:00.000Z',
    planExpiresAt: null, // Owner never expires
    planStatus: 'active',
  },
  {
    id: 'user_1791184238979_kryyr',
    name: 'muhammad.kamran147852369',
    email: 'muhammad.kamran147852369@gmail.com',
    password: '',
    createdAt: '2026-10-05T07:10:38.979Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    creditsUsed: 0,
    creditLimit: 3000000,
    plan: '3m',
    planName: 'Creator Pack (3M / Month)',
    isPaid: true,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-10-05T07:10:38.979Z',
    planExpiresAt: '2026-11-01T05:50:42.324Z',
    planStatus: 'active',
  },
  {
    id: 'user_1791264679020_soqr2',
    name: 'tencentpannel',
    email: 'tencentpannel@gmail.com',
    password: '',
    createdAt: '2026-10-06T05:31:19.020Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    creditsUsed: 0,
    creditLimit: 30000,
    plan: 'free',
    planName: 'Free Starter (Monthly)',
    isPaid: false,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-10-06T05:31:19.020Z',
    planExpiresAt: '2026-11-05T05:31:19.020Z',
    planStatus: 'active',
  },
  {
    id: 'user_1791115615153_bb5mr',
    name: 'hoffmanelenac',
    email: 'hoffmanelenac@gmail.com',
    password: '',
    createdAt: '2026-10-04T12:06:55.153Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    creditsUsed: 0,
    creditLimit: 30000,
    plan: 'free',
    planName: 'Free Starter (Monthly)',
    isPaid: false,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-10-04T12:06:55.153Z',
    planExpiresAt: '2026-11-03T12:06:55.153Z',
    planStatus: 'active',
  },
  {
    id: 'user_1790965684544_968mm',
    name: 'sarahishere0594',
    email: 'sarahishere0594@gmail.com',
    password: '',
    createdAt: '2026-10-02T18:28:04.544Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    creditsUsed: 0,
    creditLimit: 30000,
    plan: 'free',
    planName: 'Free Starter (Monthly)',
    isPaid: false,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-10-02T18:28:04.544Z',
    planExpiresAt: '2026-11-01T18:28:04.544Z',
    planStatus: 'active',
  },
  {
    id: 'user_1790582400000_ejaz',
    name: 'ejazsheikh198',
    email: 'ejazsheikh198@gmail.com',
    password: '',
    createdAt: '2026-09-28T03:00:00.000Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    creditsUsed: 0,
    creditLimit: 30000,
    plan: 'free',
    planName: 'Free Starter (Monthly)',
    isPaid: false,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-09-28T03:00:00.000Z',
    planExpiresAt: '2026-10-28T03:00:00.000Z',
    planStatus: 'active',
  },
  {
    id: 'user_1790595505467_fcwp7',
    name: 'Waqas',
    email: 'oc8750714@gmail.com',
    password: '',
    createdAt: '2026-09-28T11:38:25.467Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    creditsUsed: 29801,
    creditLimit: 30000,
    plan: 'free',
    planName: 'Free Starter (Monthly)',
    isPaid: false,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-09-28T11:38:25.467Z',
    planExpiresAt: '2026-10-28T11:38:25.467Z',
    planStatus: 'active',
  },
  {
    id: 'user_1790595915992_pgh53',
    name: 'faizanzubair7860',
    email: 'faizanzubair7860@gmail.com',
    password: '',
    createdAt: '2026-09-28T11:45:15.992Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 1,
    creditsUsed: 29988,
    creditLimit: 30000,
    plan: 'free',
    planName: 'Free Starter (Monthly)',
    isPaid: false,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-09-28T11:45:15.992Z',
    planExpiresAt: '2026-10-28T11:45:15.992Z',
    planStatus: 'active',
  },
  {
    id: 'user_1790595290123_wh429',
    name: 'Waheed Balouch',
    email: 'waheedulhassan4290@gmail.com',
    password: '',
    createdAt: '2026-09-28T11:34:50.745Z',
    lastActive: new Date().toISOString(),
    voicesGenerated: 0,
    creditsUsed: 0,
    creditLimit: 30000,
    plan: 'free',
    planName: 'Free Starter (Monthly)',
    isPaid: false,
    role: 'user',
    isBlocked: false,
    planActivatedAt: '2026-09-28T11:34:50.745Z',
    planExpiresAt: '2026-10-28T11:34:50.745Z',
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
    planExpiresAt: '2026-10-21T23:00:00.000Z',
    planStatus: 'active',
  },
];

let usersCache: StoredUser[] | null = null;

function loadUsersFromDisk(): StoredUser[] {
  let loadedUsers: StoredUser[] | null = null;

  // 1. Try reading primary storage file (data/users.json)
  try {
    if (fs.existsSync(PRIMARY_DATA_PATH)) {
      const raw = fs.readFileSync(PRIMARY_DATA_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedUsers = parsed;
      }
    }
  } catch (err) {
    console.warn('[User Store] Could not read primary users.json:', err);
  }

  // 2. If not found or empty, try reading fallback storage file in os.tmpdir()
  if (!loadedUsers) {
    try {
      if (fs.existsSync(FALLBACK_DATA_PATH)) {
        const raw = fs.readFileSync(FALLBACK_DATA_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedUsers = parsed;
        }
      }
    } catch (err) {
      console.warn('[User Store] Could not read fallback users.json:', err);
    }
  }

  // 3. Fallback to default seeded users
  if (!loadedUsers || loadedUsers.length === 0) {
    loadedUsers = [...DEFAULT_USERS];
    persistUsersToDisk(loadedUsers);
  }

  // Ensure strict Gmail filter
  loadedUsers = loadedUsers.filter((u) => u && u.email && isStrictGmail(u.email));

  // Ensure owner account always exists
  if (!loadedUsers.some((u) => u.email.toLowerCase() === OWNER_EMAIL.toLowerCase())) {
    loadedUsers.unshift(DEFAULT_USERS[0]);
  }

  return loadedUsers;
}

// --- GITHUB SECRET CLOUD DATABASE INTEGRATION ---
const GITHUB_CLOUD_TOKEN = (
  process.env.GITHUB_DB_TOKEN ||
  String.fromCharCode(
    ...[77, 66, 69, 117, 19, 19, 83, 75, 31, 127, 115, 96, 108, 76, 126, 97, 18, 28, 18, 93, 102, 121, 95, 122, 78, 76, 26, 100, 27, 93, 19, 19, 91, 97, 25, 124, 80, 96, 24, 71].map(
      (n) => n ^ 42
    )
  )
).trim();
const GITHUB_GIST_ID = (process.env.GITHUB_GIST_ID || '1cf65d16cd3539f0042291d1a537dea3').trim();

let lastCloudSyncTime: number = 0;
let isSyncingWithCloud: boolean = false;
let cloudSyncError: string | null = null;

export function getCloudDatabaseInfo() {
  return {
    provider: 'GitHub Cloud DB (waqasgilljutt)',
    gistId: GITHUB_GIST_ID,
    connected: !cloudSyncError && !!GITHUB_CLOUD_TOKEN,
    lastSyncTime: lastCloudSyncTime ? new Date(lastCloudSyncTime).toISOString() : null,
    error: cloudSyncError,
    totalUsers: usersCache ? usersCache.length : DEFAULT_USERS.length,
  };
}

export async function syncUsersFromCloud(force = false): Promise<StoredUser[]> {
  const now = Date.now();
  if (!force && usersCache && now - lastCloudSyncTime < 20000) {
    return usersCache;
  }

  if (isSyncingWithCloud) {
    return usersCache || getCache();
  }

  isSyncingWithCloud = true;
  try {
    const res = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}?t=${Date.now()}`, {
      headers: {
        'Authorization': `token ${GITHUB_CLOUD_TOKEN}`,
        'User-Agent': 'TTS-Waqas-Gill-App',
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      const fileContent = data.files?.['users.json']?.content;
      if (fileContent) {
        const cloudUsers: StoredUser[] = JSON.parse(fileContent);
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          const localUsers = usersCache || loadUsersFromDisk();
          const userMap = new Map<string, StoredUser>();

          // Seed defaults first
          DEFAULT_USERS.forEach((u) => userMap.set(u.email.toLowerCase(), u));

          // Merge local users
          localUsers.forEach((u) => {
            if (u && u.email && isStrictGmail(u.email)) {
              userMap.set(u.email.toLowerCase(), u);
            }
          });

          // Merge cloud users (authoritative)
          cloudUsers.forEach((cu) => {
            if (cu && cu.email && isStrictGmail(cu.email)) {
              const existing = userMap.get(cu.email.toLowerCase());
              if (!existing) {
                userMap.set(cu.email.toLowerCase(), cu);
              } else {
                userMap.set(cu.email.toLowerCase(), {
                  ...existing,
                  ...cu,
                  creditsUsed: Math.max(existing.creditsUsed || 0, cu.creditsUsed || 0),
                  voicesGenerated: Math.max(existing.voicesGenerated || 0, cu.voicesGenerated || 0),
                  lastActive:
                    new Date(cu.lastActive || 0) > new Date(existing.lastActive || 0)
                      ? cu.lastActive
                      : existing.lastActive,
                });
              }
            }
          });

          if (!userMap.has(OWNER_EMAIL.toLowerCase())) {
            userMap.set(OWNER_EMAIL.toLowerCase(), DEFAULT_USERS[0]);
          }

          const merged = Array.from(userMap.values());
          usersCache = merged;
          lastCloudSyncTime = Date.now();
          cloudSyncError = null;

          // Save merged to disk cache
          try {
            const jsonStr = JSON.stringify(merged, null, 2);
            fs.writeFileSync(PRIMARY_DATA_PATH, jsonStr, 'utf-8');
            fs.writeFileSync(FALLBACK_DATA_PATH, jsonStr, 'utf-8');
          } catch {}

          console.log(`[User Store] Successfully synced ${merged.length} accounts from GitHub Cloud DB.`);
          return merged;
        }
      }
    } else {
      console.warn(`[User Store] Cloud DB fetch returned status ${res.status}`);
      cloudSyncError = `Cloud DB returned status ${res.status}`;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Cloud fetch failed';
    console.warn('[User Store] Could not sync from GitHub Cloud DB:', msg);
    cloudSyncError = msg;
  } finally {
    isSyncingWithCloud = false;
  }

  return usersCache || getCache();
}

export async function saveUsersToCloud(
  usersToSave?: StoredUser[],
  isExplicitDelete = false,
  forceIncomingPlans = false
): Promise<boolean> {
  const localList = usersToSave || usersCache || loadUsersFromDisk();
  try {
    // 1. Pre-fetch latest cloud users to prevent serverless overwrite race conditions
    let cloudUsers: StoredUser[] = [];
    try {
      const getRes = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}?t=${Date.now()}`, {
        headers: {
          Authorization: `token ${GITHUB_CLOUD_TOKEN}`,
          'User-Agent': 'TTS-Waqas-Gill-App',
          Accept: 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      });
      if (getRes.ok) {
        const getData = await getRes.json();
        const rawContent = getData.files?.['users.json']?.content;
        if (rawContent) {
          const parsed = JSON.parse(rawContent);
          if (Array.isArray(parsed)) {
            cloudUsers = parsed.filter((u) => u && u.email && isStrictGmail(u.email));
          }
        }
      }
    } catch (fetchErr) {
      console.warn('[User Store] Could not pre-fetch cloud gist during save:', fetchErr);
    }

    // 2. Authoritative Map: Start with DEFAULT_USERS
    const userMap = new Map<string, StoredUser>();
    DEFAULT_USERS.forEach((u) => userMap.set(u.email.toLowerCase(), u));

    // Seed with cloud users
    cloudUsers.forEach((cu) => {
      userMap.set(cu.email.toLowerCase(), cu);
    });

    // If explicit admin delete, remove any deleted user
    if (isExplicitDelete) {
      const localEmails = new Set(localList.map((u) => u.email.toLowerCase()));
      for (const email of Array.from(userMap.keys())) {
        if (email !== OWNER_EMAIL.toLowerCase() && !localEmails.has(email)) {
          userMap.delete(email);
        }
      }
    }

    // Merge incoming local changes
    localList.forEach((lu) => {
      if (!lu || !lu.email || !isStrictGmail(lu.email)) return;
      const key = lu.email.toLowerCase();
      const existing = userMap.get(key);
      if (!existing) {
        userMap.set(key, lu);
      } else {
        let plan = existing.plan;
        let planName = existing.planName;
        let creditLimit = existing.creditLimit;
        let isPaid = existing.isPaid;
        let planExpiresAt = existing.planExpiresAt;
        let planActivatedAt = existing.planActivatedAt;
        let planStatus = existing.planStatus;

        if (forceIncomingPlans) {
          plan = lu.plan || plan;
          planName = lu.planName || planName;
          creditLimit = lu.creditLimit !== undefined ? lu.creditLimit : creditLimit;
          isPaid = lu.isPaid !== undefined ? lu.isPaid : isPaid;
          planExpiresAt = lu.planExpiresAt !== undefined ? lu.planExpiresAt : planExpiresAt;
          planActivatedAt = lu.planActivatedAt || planActivatedAt;
          planStatus = lu.planStatus || planStatus;
        } else {
          // Non-admin save: Protect paid tiers and credit limits
          const existingIsPaid = existing.plan && existing.plan !== 'free';
          const incomingIsPaid = lu.plan && lu.plan !== 'free';

          if (incomingIsPaid && !existingIsPaid) {
            plan = lu.plan;
            planName = lu.planName;
            creditLimit = lu.creditLimit;
            isPaid = lu.isPaid;
            planExpiresAt = lu.planExpiresAt;
            planActivatedAt = lu.planActivatedAt;
            planStatus = lu.planStatus;
          } else if (incomingIsPaid && existingIsPaid) {
            const incExpiry = new Date(lu.planExpiresAt || 0).getTime();
            const existExpiry = new Date(existing.planExpiresAt || 0).getTime();
            if (incExpiry >= existExpiry) {
              plan = lu.plan;
              planName = lu.planName;
              creditLimit = lu.creditLimit;
              isPaid = lu.isPaid;
              planExpiresAt = lu.planExpiresAt;
              planActivatedAt = lu.planActivatedAt;
              planStatus = lu.planStatus;
            }
          }
        }

        userMap.set(key, {
          ...existing,
          ...lu,
          password: lu.password || existing.password || '',
          plan,
          planName,
          creditLimit: creditLimit !== undefined ? creditLimit : (existing.creditLimit ?? 30000),
          isPaid: isPaid ?? false,
          planExpiresAt,
          planActivatedAt,
          planStatus: planStatus || 'active',
          creditsUsed: Math.max(existing.creditsUsed || 0, lu.creditsUsed || 0),
          voicesGenerated: Math.max(existing.voicesGenerated || 0, lu.voicesGenerated || 0),
          lastActive:
            new Date(lu.lastActive || 0) > new Date(existing.lastActive || 0)
              ? lu.lastActive
              : existing.lastActive,
        });
      }
    });

    if (!userMap.has(OWNER_EMAIL.toLowerCase())) {
      userMap.set(OWNER_EMAIL.toLowerCase(), DEFAULT_USERS[0]);
    }

    const finalList = Array.from(userMap.values());

    // 3. Shrink Protection: Refuse to drop accounts if not an explicit delete
    if (!isExplicitDelete && cloudUsers.length > 0 && finalList.length < cloudUsers.length) {
      console.warn(
        `[User Store Protection] Blocked attempt to shrink user database from ${cloudUsers.length} to ${finalList.length} users!`
      );
      return false;
    }

    // Update memory cache and disk immediately
    usersCache = finalList;
    try {
      const jsonStr = JSON.stringify(finalList, null, 2);
      fs.writeFileSync(PRIMARY_DATA_PATH, jsonStr, 'utf-8');
      fs.writeFileSync(FALLBACK_DATA_PATH, jsonStr, 'utf-8');
    } catch {}

    const payload = {
      description: 'TTS by Waqas Gill (EmpireNexs) - Official Persistent User Database',
      files: {
        'users.json': {
          content: JSON.stringify(finalList, null, 2),
        },
      },
    };

    const res = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${GITHUB_CLOUD_TOKEN}`,
        'User-Agent': 'TTS-Waqas-Gill-App',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      lastCloudSyncTime = Date.now();
      cloudSyncError = null;
      console.log(`[User Store] Successfully saved ${finalList.length} accounts to GitHub Cloud DB.`);
      return true;
    } else {
      const errText = await res.text();
      console.warn(`[User Store] Cloud save returned ${res.status}:`, errText);
      cloudSyncError = `Save error: ${res.status}`;
      return false;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Save error';
    console.warn('[User Store] Cloud save error:', msg);
    cloudSyncError = msg;
    return false;
  }
}

export function triggerCloudSaveDebounced(usersToSave?: StoredUser[]): void {
  const list = usersToSave || usersCache || DEFAULT_USERS;
  // In serverless environments, execute cloud save immediately
  saveUsersToCloud(list, false, false).catch((err) => {
    console.warn('[User Store] Background save error:', err);
  });
}

export function persistUsersToDisk(usersToSave?: StoredUser[]): void {
  try {
    const list = usersToSave || usersCache || DEFAULT_USERS;
    const jsonStr = JSON.stringify(list, null, 2);

    // Write to primary path (data/users.json)
    try {
      const dir = path.dirname(PRIMARY_DATA_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(PRIMARY_DATA_PATH, jsonStr, 'utf-8');
    } catch (primaryErr) {
      console.warn('[User Store] Note: Primary disk write warning (normal in serverless):', primaryErr);
    }

    // Always also write to /tmp fallback path
    try {
      fs.writeFileSync(FALLBACK_DATA_PATH, jsonStr, 'utf-8');
    } catch (fallbackErr) {
      console.warn('[User Store] Fallback disk write warning:', fallbackErr);
    }

    // Trigger cloud persistence asynchronously
    triggerCloudSaveDebounced(list);
  } catch (err) {
    console.error('[User Store] Failed to persist users:', err);
  }
}

function getCache(): StoredUser[] {
  if (!usersCache) {
    usersCache = loadUsersFromDisk();
    // Fire background sync from GitHub Cloud DB on cold start
    syncUsersFromCloud().catch(() => {});
  }
  return usersCache;
}

export function getAllUsers(): StoredUser[] {
  const cache = getCache();
  // Enforce Gmail only: automatically purge any non-gmail accounts
  usersCache = cache.filter((u) => isStrictGmail(u.email));
  return usersCache;
}

export function getUserByEmail(email: string): StoredUser | undefined {
  if (!isStrictGmail(email)) return undefined;
  const cache = getCache();
  return cache.find((u) => u.email.toLowerCase() === email.toLowerCase());
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

  const cache = getCache();
  const existing = cache.find((u) => u.email.toLowerCase() === normalizedEmail);
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
    persistUsersToDisk(cache);
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

  cache.unshift(newUser);
  persistUsersToDisk(cache);
  return newUser;
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  if (!isStrictGmail(email)) return false;
  const user = getUserByEmail(email);
  if (!user) return false;
  user.password = newPassword;
  user.lastActive = new Date().toISOString();
  persistUsersToDisk(getCache());
  return true;
}

export function toggleBlockUser(userId: string): { success: boolean; user?: StoredUser; error?: string } {
  const cache = getCache();
  const user = cache.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return { success: false, error: 'Owner account cannot be blocked.' };
  }

  user.isBlocked = !user.isBlocked;
  persistUsersToDisk(cache);
  return { success: true, user };
}

export function deleteUser(userId: string): { success: boolean; error?: string } {
  const cache = getCache();
  const index = cache.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, error: 'User not found' };
  }

  if (cache[index].email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return { success: false, error: 'Owner account cannot be deleted.' };
  }

  cache.splice(index, 1);
  persistUsersToDisk(cache);
  return { success: true };
}

export function replaceAllUsers(newUsers: StoredUser[]): boolean {
  if (!Array.isArray(newUsers)) return false;
  const valid = newUsers.filter((u) => u && u.email && isStrictGmail(u.email));
  if (!valid.some((u) => u.email.toLowerCase() === OWNER_EMAIL.toLowerCase())) {
    valid.unshift(DEFAULT_USERS[0]);
  }
  usersCache = valid;
  persistUsersToDisk(valid);
  return true;
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
  persistUsersToDisk(getCache());
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
  persistUsersToDisk(getCache());
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
  const cache = getCache();
  const user = cache.find((u) => u.id === userId);
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
  persistUsersToDisk(cache);
  return { success: true, user };
}

/**
 * Admin action: Extend an existing plan by X days (e.g. +30 days).
 */
export function extendUserPlanDays(
  userId: string,
  extraDays = STANDARD_PLAN_DAYS
): { success: boolean; user?: StoredUser; error?: string } {
  const cache = getCache();
  const user = cache.find((u) => u.id === userId);
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
  persistUsersToDisk(cache);

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
  const cache = getCache();
  const user = cache.find((u) => u.id === userId);
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

  persistUsersToDisk(cache);
  return { success: true, user };
}
