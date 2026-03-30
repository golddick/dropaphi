

// lib/api-key/utils.ts
import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const ENC_SECRET = process.env.ENC_SECRET as string;

if (!JWT_SECRET || !ENC_SECRET) {
  throw new Error("Missing JWT_SECRET or ENC_SECRET in environment");
}

export interface GeneratedApiKey {
  key: string;           // The RAW key that user sees (e.g., "da_live_xK9mPq2rT5")
  encryptedKey: string;  // The encrypted version stored in DB
  prefix: string;        // Key prefix (da_live_ or da_test_)
  hash: string;          // The encrypted key (stored in keyHash)
  lastFour: string;      // Last 4 chars for display
  jwt: string;           // JWT token stored in DB
}

// --------------------
// Encryption Helpers
// --------------------

export function encryptKey(key: string): string {
  // Ensure ENC_SECRET is exactly 32 bytes for AES-256
  const keyBuffer = Buffer.from(ENC_SECRET.padEnd(32).slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptKey(encryptedKey: string): string {
  try {
    const keyBuffer = Buffer.from(ENC_SECRET.padEnd(32).slice(0, 32));
    const [ivHex, encrypted] = encryptedKey.split(":");
    if (!ivHex || !encrypted) {
      throw new Error("Invalid encrypted key format");
    }
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt API key");
  }
}

// --------------------
// JWT Helpers
// --------------------

function generateJwt(payload: object, expiresIn: string | number = "365d"): string {
  if (typeof expiresIn === "number") {
    expiresIn = `${expiresIn}s`;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

// --------------------
// API Key Generation
// --------------------

/**
 * Generate a user-friendly API key
 * Format: da_live_XXXXXXXXXX or da_test_XXXXXXXXXX (10 random chars)
 */
export function generateApiKey(workspaceId: string, keyId: string, environment: 'live' | 'test', ): GeneratedApiKey {
  const prefix = environment === 'live' ? 'da_live_' : 'da_test_';
  
  // Generate 10 random characters (url-safe)
  // Using base64url and taking first 10 chars
  const randomBytes = crypto.randomBytes(10); // 10 bytes = ~13 base64 chars, we'll take first 10
  const randomPart = randomBytes
    .toString('base64url')
    .substring(0, 10); // Take exactly 10 chars
  
  // Create the user-friendly raw key
  const rawKey = prefix + randomPart; // e.g., "da_live_xK9mPq2rT5"
  
  // Encrypt the raw key for storage
  const encryptedKey = encryptKey(rawKey);
  
  // Create JWT payload with key metadata
  const payload = {
    kid: keyId,
    wid: workspaceId,
    env: environment,
    type: 'api_key',
    iat: Math.floor(Date.now() / 1000),
  };
  
  const jwtExpiration = environment === 'live' ? '90d' : '365d';
  const jwtToken = generateJwt(payload, jwtExpiration);
  
  // Last four of the RAW key (for display masking)
  const lastFour = rawKey.slice(-4);
  
  return { 
    key: rawKey,           // USER SEES THIS: "da_live_xK9mPq2rT5"
    encryptedKey,          // Stored in DB
    prefix, 
    hash: encryptedKey,    // Stored in keyHash
    lastFour,
    jwt: jwtToken
  };
}

/**
 * Mask API key for display (shows prefix + lastFour)
 * e.g., "da_live_••••••••xK9m" or "da_test_••••••••AbCd"
 */
export function maskApiKey(key: string): string {
  if (!key) return '';
  
  // Extract prefix and last 4 chars
  let prefix = '';
  let lastFour = '';
  
  if (key.startsWith('da_live_')) {
    prefix = 'da_live_';
    lastFour = key.slice(-4);
  } else if (key.startsWith('da_test_')) {
    prefix = 'da_test_';
    lastFour = key.slice(-4);
  } else {
    // Fallback for unknown format
    return key.length > 8 ? `${key.substring(0, 4)}...${key.slice(-4)}` : '••••';
  }
  
  // Return masked format (8 dots for the hidden part)
  return `${prefix}••••••••${lastFour}`;
}

/**
 * Get environment from key
 */
export function getKeyEnvironment(key: string): 'live' | 'test' | null {
  if (key.startsWith('da_live_')) return 'live';
  if (key.startsWith('da_test_')) return 'test';
  return null;
}


/**
 * Validate API key format
 * Checks that it starts with the correct prefix and has at least some characters after
 */
export function isValidKeyFormat(key: string): boolean {
  if (!key) return false;
  
  // Check that it starts with the correct prefix
  const isValidPrefix = key.startsWith('da_live_') || key.startsWith('da_test_');
  if (!isValidPrefix) return false;
  
  // Make sure there's at least 1 character after the prefix
  const afterPrefix = key.substring(key.indexOf('_') + 5);
  return afterPrefix.length > 0;
}