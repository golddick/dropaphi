// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   host: process.env.AUTH_SMTP_HOST,
//   port: Number(process.env.AUTH_SMTP_PORT),
//   secure: true, // true for 465
//   auth: {
//     user: process.env.AUTH_SMTP_USER,
//     pass: process.env.AUTH_SMTP_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false, // avoid SSL issues on some hosts
//   },
//   pool: true,
//   maxConnections: 5,
//   maxMessages: 100,
// });



import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "mail.dropaphi.xyz",
  port: 587,
  secure: false, // IMPORTANT
  requireTLS: true, // force TLS upgrade
  auth: {
    user: process.env.AUTH_SMTP_USER,
    pass: process.env.AUTH_SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // avoids cert issues on shared hosting
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});