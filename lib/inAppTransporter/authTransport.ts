

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





// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   host: process.env.AUTH_SMTP_HOST,
//   port: process.env.AUTH_SMTP_PORT,
//   secure: process.env.AUTH_SMTP_SECURE, // IMPORTANT
//   requireTLS: true, // force TLS upgrade
//   auth: {
//     user: process.env.AUTH_SMTP_USER,
//     pass: process.env.AUTH_SMTP_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false, // avoids cert issues on shared hosting
//   },
//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
//   socketTimeout: 15000,
// });