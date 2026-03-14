import { transporter } from "../transport";


// Store OTPs temporarily
const otpStore = new Map<string, { code: string; expires: number; attempts: number }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(key: string, code: string): void {
  otpStore.set(key, {
    code,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });
  
  // Auto-cleanup after 10 minutes
  setTimeout(() => {
    otpStore.delete(key);
  }, 10 * 60 * 1000);
}

export function verifyOTP(key: string, code: string): boolean {
  const data = otpStore.get(key);
  if (!data) return false;
  if (Date.now() > data.expires) {
    otpStore.delete(key);
    return false;
  }
  
  data.attempts++;
  if (data.attempts > 5) {
    otpStore.delete(key);
    return false;
  }
  
  const isValid = data.code === code;
  if (isValid) otpStore.delete(key);
  return isValid;
}

export async function sendEmailVerificationOTP(
  email: string, 
  otp: string, 
  name: string,
  context: string
): Promise<void> {
  // Always log OTP for development/debugging
  console.log("=================================");
  console.log(`🔐 ${context} OTP for ${email}:`, otp);
  console.log("🔐 Recipient name:", name);
  console.log("=================================");

  // Check if email transporter is configured
  if (!transporter) {
    console.log("⚠️ Email transporter not configured - OTP not sent via email");
    return;
  }

  try {
    // Format context for display
    const displayContext = context === 'Email Sender' ? 'Email Verification' : context;
    
    // Send email using central transporter
    const info = await transporter.sendMail({
      from: `"Drop-APHI Security" <${process.env.MAIL_FROM || 'noreply@dropapi.com'}>`,
      to: email,
      subject: `Your ${displayContext} Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${displayContext} Code</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f7;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 2px solid #f0f0f0;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #DC143C;
            }
            .content {
              padding: 30px 20px;
            }
            .otp-box {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 20px 0;
              border: 2px dashed #DC143C;
            }
            .otp-code {
              font-family: 'Courier New', monospace;
              font-size: 48px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #DC143C;
              margin: 20px 0;
            }
            .expiry {
              color: #666;
              font-size: 14px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #999;
              font-size: 12px;
              border-top: 1px solid #f0f0f0;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeeba;
              color: #856404;
              padding: 12px;
              border-radius: 6px;
              font-size: 13px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="logo">DropAPI</span>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${name},</h2>
              
              <p style="margin-bottom: 20px;">
                You've requested to verify your ${displayContext.toLowerCase()}. 
                Use the following code to complete the verification process:
              </p>
              
              <div class="otp-box">
                <div style="color: #666; margin-bottom: 10px;">Your verification code</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry">This code expires in 10 minutes</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. 
                Our team will never ask for this code.
              </div>
              
              <p style="margin-top: 30px;">
                If you didn't request this verification, please ignore this email or 
                <a href="mailto:support@dropapi.com" style="color: #DC143C;">contact support</a> 
                if you have concerns.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} DropAPHI. All rights reserved.</p>
              <p style="margin-top: 5px;">
                This email was sent to ${email} for verification purposes.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${name},
        
        You've requested to verify your ${displayContext.toLowerCase()}. 
        Your verification code is: ${otp}
        
        This code expires in 10 minutes.
        
        Security Notice: Never share this code with anyone. Our team will never ask for this code.
        
        If you didn't request this verification, please ignore this email.
        
        © ${new Date().getFullYear()} DropAPHI. All rights reserved.
      `,
    });

    console.log(`✅ ${displayContext} email sent to ${email}:`, info.messageId);
    
    // Log for production monitoring (if using a service like Sentry)
    if (process.env.NODE_ENV === 'production') {
      // You can add production logging here
      console.log(`📧 Email sent: ${info.messageId}`);
    }
  } catch (error) {
    console.error(`❌ Failed to send ${context} email:`, error);
    
    // Throw a user-friendly error
    throw new Error('Failed to send verification email. Please try again later.');
  }
}