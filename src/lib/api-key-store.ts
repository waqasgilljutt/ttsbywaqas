import fs from 'fs';
import path from 'path';
import os from 'os';
import { NextRequest } from 'next/server';

export interface DeveloperApiKey {
  id: string;
  key: string;
  ownerName: string;
  ownerEmail: string;
  tierName: string;
  characterLimit: number;
  charactersUsed: number;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt: string;
}

const PRIMARY_KEYS_PATH = path.join(process.cwd(), 'data', 'api-keys.json');
const FALLBACK_KEYS_PATH = path.join(os.tmpdir(), 'empirenexs_api_keys.json');

// Default seeded demo/master dev keys
const DEFAULT_API_KEYS: DeveloperApiKey[] = [
  {
    id: 'key_owner_master',
    key: 'nexs_live_waqas_owner_unlimited_master',
    ownerName: 'Waqas Gill (EmpireNexs)',
    ownerEmail: 'muhammadwaqasmwg@gmail.com',
    tierName: 'Master Enterprise Key (Unlimited)',
    characterLimit: -1,
    charactersUsed: 0,
    status: 'active',
    createdAt: '2026-10-01T00:00:00.000Z',
    expiresAt: '2030-01-01T00:00:00.000Z',
  },
];

let apiKeysCache: DeveloperApiKey[] | null = null;

function loadKeys(): DeveloperApiKey[] {
  if (apiKeysCache) return apiKeysCache;

  let loaded: DeveloperApiKey[] | null = null;
  try {
    if (fs.existsSync(PRIMARY_KEYS_PATH)) {
      const raw = fs.readFileSync(PRIMARY_KEYS_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loaded = parsed;
      }
    }
  } catch {}

  if (!loaded) {
    try {
      if (fs.existsSync(FALLBACK_KEYS_PATH)) {
        const raw = fs.readFileSync(FALLBACK_KEYS_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed;
        }
      }
    } catch {}
  }

  if (!loaded || loaded.length === 0) {
    loaded = [...DEFAULT_API_KEYS];
    persistKeys(loaded);
  }

  apiKeysCache = loaded;
  return loaded;
}

function persistKeys(keys: DeveloperApiKey[]) {
  apiKeysCache = keys;
  const json = JSON.stringify(keys, null, 2);
  try {
    const dir = path.dirname(PRIMARY_KEYS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRIMARY_KEYS_PATH, json, 'utf-8');
  } catch {}
  try {
    fs.writeFileSync(FALLBACK_KEYS_PATH, json, 'utf-8');
  } catch {}
}

export function getAllApiKeys(): DeveloperApiKey[] {
  return loadKeys();
}

export function createApiKey(
  ownerName: string,
  ownerEmail: string,
  quotaCharacters: number,
  tierLabel = 'Custom Developer Quota',
  durationDays = 30
): DeveloperApiKey {
  const keys = loadKeys();
  const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const now = new Date();
  const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const newKey: DeveloperApiKey = {
    id: `apikey_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    key: `nexs_live_${randomHex}`,
    ownerName: ownerName.trim(),
    ownerEmail: ownerEmail.trim().toLowerCase(),
    tierName: tierLabel,
    characterLimit: quotaCharacters,
    charactersUsed: 0,
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  keys.unshift(newKey);
  persistKeys(keys);
  return newKey;
}

export function revokeApiKey(keyString: string): boolean {
  const keys = loadKeys();
  const found = keys.find((k) => k.key === keyString || k.id === keyString);
  if (!found) return false;
  found.status = 'revoked';
  persistKeys(keys);
  return true;
}

export function validateApiKey(
  keyString: string,
  requestedChars: number
): { valid: boolean; error?: string; keyRecord?: DeveloperApiKey } {
  const keys = loadKeys();
  const record = keys.find((k) => k.key === keyString.trim());

  if (!record) {
    return {
      valid: false,
      error: 'Invalid API Key. Please provide a valid developer API key from EmpireNexs.',
    };
  }

  if (record.status !== 'active') {
    return {
      valid: false,
      error: `This API Key has been ${record.status}. Contact EmpireNexs to reactivate.`,
    };
  }

  const now = Date.now();
  if (record.expiresAt && new Date(record.expiresAt).getTime() < now) {
    record.status = 'expired';
    persistKeys(keys);
    return {
      valid: false,
      error: 'This API Key has expired. Please renew your monthly custom developer quota.',
    };
  }

  if (record.characterLimit !== -1) {
    const remaining = Math.max(0, record.characterLimit - record.charactersUsed);
    if (record.charactersUsed + requestedChars > record.characterLimit) {
      return {
        valid: false,
        error: `API Key quota exceeded. Remaining: ${remaining.toLocaleString()} characters. Contact EmpireNexs to upgrade your quota.`,
      };
    }
  }

  return { valid: true, keyRecord: record };
}

export function deductApiKeyChars(keyString: string, count: number): void {
  const keys = loadKeys();
  const record = keys.find((k) => k.key === keyString.trim());
  if (record && record.characterLimit !== -1) {
    record.charactersUsed += count;
    persistKeys(keys);
  }
}

/**
 * Validates whether the incoming HTTP request is originating from our official frontend website,
 * or if it is an external third-party scraper/bot/app requiring a dedicated API key.
 */
export function isInternalWebRequest(req: NextRequest): boolean {
  const origin = (req.headers.get('origin') || '').toLowerCase();
  const referer = (req.headers.get('referer') || '').toLowerCase();
  const secFetchSite = (req.headers.get('sec-fetch-site') || '').toLowerCase();
  const clientPlatform = req.headers.get('x-client-platform');

  // 1. Check sec-fetch-site header (sent by modern browsers for same-origin fetch)
  if (secFetchSite === 'same-origin' || secFetchSite === 'same-site') {
    return true;
  }

  // 2. Check if Origin matches our domains
  const allowedHosts = [
    'ttsnexs.online',
    'ttsbywaqas.vercel.app',
    'localhost',
    '127.0.0.1',
    'empirenexs.com',
  ];

  for (const host of allowedHosts) {
    if (origin.includes(host) || referer.includes(host)) {
      return true;
    }
  }

  // 3. Optional client platform identifier accompanied by referer
  if (clientPlatform === 'ttsnexs-web' && (referer.includes('ttsnexs') || referer.includes('localhost') || referer.includes('vercel.app'))) {
    return true;
  }

  return false;
}
