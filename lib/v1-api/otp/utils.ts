// lib/v1-api/otp/utils.ts
import crypto from 'crypto';

// Use a consistent encryption key from environment
const ENCRYPTION_KEY = process.env.OTP_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32);
const IV_LENGTH = 16;

/**
 * Generate a random OTP code
 */
export function generateOTP(length: number = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
}

/**
 * Encrypt OTP for storage (reversible - so we can resend the same code)
 */
export function encryptOTP(otp: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), 
    iv
  );
  let encrypted = cipher.update(otp, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt OTP from storage
 */
export function decryptOTP(encryptedData: string): string {
  try {
    const [ivHex, encrypted] = encryptedData.split(':');
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), 
      iv
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt OTP:', error);
    throw new Error('Failed to decrypt OTP');
  }
}

/**
 * Verify OTP by comparing with decrypted stored OTP
 */
export function verifyOTP(otp: string, encryptedOtp: string): boolean {
  try {
    const decryptedOtp = decryptOTP(encryptedOtp);
    return otp === decryptedOtp;
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return false;
  }
}

/**
 * Default OTP email template
 */

export function getDefaultOTPTemplate(otp: string, companyName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 480px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
        }
        .code {
          background-color: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: 4px;
          color: #333333;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666666;
        }
        .notice {
          color: #666;
          font-style: italic;
          margin-top: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0;color:#333333;">${companyName}</h2>
        </div>
        <p>Hello,</p>
        <p>Your verification code is:</p>
        <div class="code">${otp}</div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${companyName}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Simple text fallback
 */
export function getDefaultTextTemplate(otp: string, companyName:string): string {
  return `
Your verification code is: ${otp}

This code will expire in 10 minutes.

For security reasons, never share this code with anyone.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
  `.trim();
}

