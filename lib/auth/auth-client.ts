// lib/auth-client.ts
// ============================================================
// Client-safe auth utilities (can be imported in client components)
// ============================================================

import { hash, compare } from "bcryptjs";
import { customAlphabet } from "nanoid";

// ---- Types -------------------------------------------------
export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: number;
}

// ---- Password ----------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed);
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength = 0;

  if (password.length < 8) {
    errors.push("At least 8 characters required");
  } else {
    strength++;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("At least one uppercase letter");
  } else {
    strength++;
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("At least one lowercase letter");
  } else {
    strength++;
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("At least one number");
  } else {
    strength++;
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("At least one special character");
  } else {
    strength++;
  }

  return { 
    valid: errors.length === 0, 
    errors,
    strength: Math.min(strength, 4) // 0-4 scale
  };
}

// ---- Opaque Tokens (email verification, password reset) ----
const secureToken = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  48
);

export function generateSecureToken(): string {
  return secureToken();
}

/** OTP generator: 4, 6, or 8 digits */
export function generateOtp(length: 4 | 6 | 8 = 6): string {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  return String(Math.floor(Math.random() * (max - min)) + min);
} 

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Helper function for date formatting (if needed)
function format(date: Date, formatStr: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}



