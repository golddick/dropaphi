

import * as nodemailer from 'nodemailer';

// Main transporter for ALL emails, using SMTP_* env vars
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  // Handle various formats for SMTP_SECURE
  secure: 
    (process.env.SMTP_SECURE ?? '').toString() === "true" || 
    Number(process.env.SMTP_PORT) === 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  rateDelta: 5000,
  tls: { rejectUnauthorized: false },
  // Only enable logs in development
  logger: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production',
});


