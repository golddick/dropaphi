import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a random OTP code
 */
export function generateOTP(length: number = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min)).toString();
}

/**
 * Hash OTP for storage
 */
export async function hashOTP(otp: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

/**
 * Verify OTP against hash
 */
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/**
 * Default OTP email template (fallback when user doesn't provide HTML)
 */
export function getDefaultOTPTemplate(otp: string, companyName: string = 'DropAPHI'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 480px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: white;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 10px 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
    }
    .content {
      padding: 40px 30px;
    }
    .otp-container {
      background: linear-gradient(135deg, #f5f7fa 0%, #e9ecf2 100%);
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .otp-code {
      font-size: 52px;
      font-weight: 800;
      letter-spacing: 12px;
      color: #667eea;
      font-family: 'Courier New', monospace;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    .info-box {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .info-text {
      color: #4a5568;
      font-size: 15px;
      line-height: 1.6;
      margin: 10px 0;
    }
    .expiry-badge {
      display: inline-block;
      background-color: #667eea;
      color: white;
      padding: 8px 16px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 500;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      color: #6c757d;
      text-decoration: none;
      margin: 0 10px;
      font-size: 13px;
    }
    .footer-links a:hover {
      color: #667eea;
    }
    .social-icons {
      margin: 20px 0;
    }
    .social-icon {
      display: inline-block;
      width: 36px;
      height: 36px;
      background-color: #e9ecef;
      border-radius: 50%;
      margin: 0 5px;
      line-height: 36px;
      text-align: center;
    }
    @media only screen and (max-width: 480px) {
      .container { margin: 10px; }
      .content { padding: 20px; }
      .otp-code { font-size: 40px; letter-spacing: 8px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${companyName}</h1>
      <p>Secure Verification Code</p>
    </div>
    <div class="content">
      <h2 style="color: #2d3748; margin-bottom: 20px; font-size: 24px;">
        Hello there!
      </h2>
      <p class="info-text">
        We received a request to verify your identity. Use the verification code below to complete your action.
      </p>
      
      <div class="otp-container">
        <div style="color: #718096; font-size: 14px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">
          Verification Code
        </div>
        <div class="otp-code">${otp}</div>
      </div>

      <div class="info-box">
        <p class="info-text">
          <strong>This code will expire in 10 minutes</strong><br>
          For security reasons, never share this code with anyone.
        </p>
      </div>

      <p style="color: #a0aec0; font-size: 13px; text-align: center; margin-top: 20px;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
    
    <div class="footer">
      <div style="font-size: 20px; font-weight: bold; color: #2d3748; margin-bottom: 10px;">
        ${companyName}
      </div>
      <p style="color: #718096; font-size: 14px; margin-bottom: 15px;">
        Making authentication simple and secure
      </p>
      <p style="color: #a0aec0; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
        123 Verification Street, Security City, SC 12345
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Simple text fallback (when HTML is not provided)
 */
export function getDefaultTextTemplate(otp: string): string {
  return `
Your verification code is: ${otp}

This code will expire in 10 minutes.

For security reasons, never share this code with anyone.

If you didn't request this code, please ignore this email.

© ${new Date().getFullYear()} DropAPHI. All rights reserved.
  `.trim();
}