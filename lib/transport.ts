

import * as nodemailer from 'nodemailer';


export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  rateDelta: 5000,
  tls: { rejectUnauthorized: false },
  logger: true,
  debug: true,
});




// import * as nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT),

//   secure: Number(process.env.SMTP_PORT) === 465,

//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },

//   pool: true,
//   maxConnections: 5,
//   maxMessages: 100,

//   rateDelta: 1000,
//   rateLimit: 5,

//   logger: process.env.NODE_ENV !== "production",
//   debug: process.env.NODE_ENV !== "production",
// });