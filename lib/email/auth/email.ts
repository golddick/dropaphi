// src/lib/email.ts
import { transporter } from '@/lib/transport';
import * as nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function sendViaNodemailerWithRetry(opts: SendEmailOptions, retryCount = 0): Promise<any> {
  try {
    const mailOptions = {
      from: `Drop APHI <${process.env.MAIL_FROM ?? "noreply@thenews.africa"}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    };

    // Add timeout promise to prevent hanging
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout after 10 seconds')), 10000);
    });

    const info = await Promise.race([sendPromise, timeoutPromise]) as nodemailer.SentMessageInfo;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Nodemailer] Message sent successfully: %s', info.messageId);
    }
    
    return info;
  } catch (error: any) {
    console.error(`[Nodemailer] Attempt ${retryCount + 1} failed:`, error.message);
    
    // Log more details for debugging
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout') || error.message.includes('Greeting')) {
      console.error('[Nodemailer] Connection timeout - check SMTP server availability');
      console.error('[Nodemailer] Current config:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? 'configured' : 'missing',
        pass: process.env.SMTP_PASS ? 'configured' : 'missing',
      });
    }
    
    // Retry logic for timeout or connection errors
    if (retryCount < MAX_RETRIES && 
        (error.code === 'ETIMEDOUT' || 
         error.message.includes('timeout') || 
         error.message.includes('Greeting') ||
         error.message.includes('ECONNREFUSED'))) {
      
      console.log(`[Nodemailer] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1))); // Exponential backoff
      
      return sendViaNodemailerWithRetry(opts, retryCount + 1);
    }
    
    throw new Error(`Nodemailer error: ${error.message}`);
  }
}

async function sendViaNodemailer(opts: SendEmailOptions) {
  try {
    return await sendViaNodemailerWithRetry(opts);
  } catch (error) {
    console.error('[Nodemailer] All retry attempts failed:', error);
    throw error;
  }
}

async function sendToConsole(opts: SendEmailOptions) {
  console.log("\n📧 ---- Dev Email ----");
  console.log("To:", opts.to);
  console.log("Subject:", opts.subject);
  console.log("Body:", opts.text ?? opts.html.substring(0, 200) + "...");
  console.log("--------------------\n");
  
  // Simulate successful send
  return { 
    messageId: 'console-' + Date.now(),
    response: 'Console email sent'
  };
}

export async function sendEmail(opts: SendEmailOptions) {
  const provider = process.env.MAIL_PROVIDER ?? "nodemailer";
  
  // In development, if email fails, fallback to console
  try {
    if (provider === "nodemailer") {
      return await sendViaNodemailer(opts);
    }
    
    return await sendToConsole(opts);
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
    
    // In development, fallback to console
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Email Service] Falling back to console output');
      return sendToConsole(opts);
    }
    
    // In production, rethrow
    throw error;
  }
}

// ---- Templated auth emails --------------------------------
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://dropaphi.vercel.app";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/auth/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Verify your Drop API email",
    text: `Click to verify: ${url}`, 
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#DC143C">Drop API</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#1A1A1A;margin-bottom:8px">
          Verify your email
        </h1>
        <p style="color:#666;margin-bottom:32px">
          Click the button below to verify your email address and activate your account.
          This link expires in 24 hours.
        </p>
        <a href="${url}" style="display:inline-block;background:#DC143C;color:#fff;
          padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;
          font-size:15px">
          Verify Email
        </a>
        <p style="color:#999;font-size:13px;margin-top:32px">
          If you didn't create a Drop API account, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/auth/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Reset your Drop API password",
    text: `Reset link (expires in 1 hour): ${url}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#DC143C">Drop API</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#1A1A1A;margin-bottom:8px">
          Reset your password
        </h1>
        <p style="color:#666;margin-bottom:32px">
          We received a request to reset your password. Click the button below —
          this link is valid for 1 hour.
        </p>
        <a href="${url}" style="display:inline-block;background:#DC143C;color:#fff;
          padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;
          font-size:15px">
          Reset Password
        </a>
        <p style="color:#999;font-size:13px;margin-top:32px">
          If you didn't request a password reset, you can ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  validityMins: number
) {
  return sendEmail({
    to: email,
    subject: `Your Drop API verification code: ${otp}`,
    text: `Your OTP code is ${otp}. It expires in ${validityMins} minutes.`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px">
        <div style="margin-bottom:32px">
          <span style="font-size:20px;font-weight:700;color:#DC143C">Drop API</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;color:#1A1A1A;margin-bottom:8px">
          Verification Code
        </h1>
        <p style="color:#666;margin-bottom:24px">Your one-time password is:</p>
        <div style="background:#F5F5F5;border-radius:12px;padding:24px;text-align:center;
          margin-bottom:24px">
          <span style="font-size:48px;font-weight:700;letter-spacing:16px;color:#DC143C;
            font-family:monospace">${otp}</span>
        </div>
        <p style="color:#999;font-size:14px">
          This code expires in <strong>${validityMins} minutes</strong>.
          Never share it with anyone.
        </p>
      </div>
    `,
  });
}











