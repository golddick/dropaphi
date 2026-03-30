






// lib/auth/2fa-utils.ts
import { db } from '@/lib/db';
import { transporter } from '../transport';
import { randomInt } from 'crypto';

// Generate random OTP (6 digits)
export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

// Store OTP in database
export async function storeOTP(email: string, code: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Delete any existing OTPs for this email
  await db.twoFactorOTP.deleteMany({
    where: { email }
  });

  // Create new OTP
  await db.twoFactorOTP.create({
    data: {
      email,
      code,
      expiresAt,
      attempts: 0
    }
  });
}

// Verify OTP from database
export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const otpRecord = await db.twoFactorOTP.findUnique({
    where: { email }
  });

  if (!otpRecord) return false;
  
  // Check expiration
  if (new Date() > otpRecord.expiresAt) {
    await db.twoFactorOTP.delete({ where: { email } });
    return false;
  }

  // Check attempts
  if (otpRecord.attempts >= 5) {
    await db.twoFactorOTP.delete({ where: { email } });
    return false;
  }

  // Increment attempts
  await db.twoFactorOTP.update({
    where: { email },
    data: { attempts: { increment: 1 } }
  });

  const isValid = otpRecord.code === code;
  
  if (isValid) {
    // Delete after successful verification
    await db.twoFactorOTP.delete({ where: { email } });
  }
  
  return isValid;
}


// Send OTP via email
export async function sendOTPEmail(email: string, otp: string, name: string): Promise<void> {
  const mailOptions = {
    from: `"Drop-APHI Security" <${process.env.MAIL_FROM || 'security@dropapi.com'}>`,
    to: email,
    subject: 'Your Two-Factor Authentication Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC143C;">Two-Factor Authentication</h2>
        <p>Hello ${name},</p>
        <p>You've requested to enable two-factor authentication. Use the following code to complete the setup:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #DC143C; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email or contact support.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} DropAPHI. All rights reserved.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Generate backup codes
export function generateBackupCodes(): string[] {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    const code = Array.from({ length: 4 }, () => 
      Math.random().toString(36).substring(2, 6).toUpperCase()
    ).join('-');
    codes.push(code);
  }
  return codes;
}

// Hash backup code (simple hash for demo - use proper hashing in production)
export async function hashBackupCode(code: string): Promise<string> {
  // In production, use bcrypt or similar
  return Buffer.from(code).toString('base64');
}

// Verify backup code
export async function verifyBackupCode(code: string, hashedCodesString: string): Promise<boolean> {
  try {
    const hashedCodes = JSON.parse(hashedCodesString);
    const hashed = Buffer.from(code).toString('base64');
    return hashedCodes.includes(hashed);
  } catch {
    return false;
  }
}