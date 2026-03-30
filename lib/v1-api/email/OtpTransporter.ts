// lib/email/services/email-sender.service.ts

import { transporter } from "@/lib/transport";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
  skipFooter?: boolean; // Option to skip footer if needed
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Company footer template
const getFooter = (appName: string = 'DropAphi'): string => {
  const year = new Date().getFullYear();
  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; font-family: Arial, sans-serif; font-size: 12px; color: #666666;">
      <p style="margin: 5px 0;">
        © ${year} 
        <a href="https://dropaphi.vercel.app" style="color: #667eea; text-decoration: none; font-weight: 500;">
          ${appName}
        </a>. All rights reserved.
      </p>
      <p style="margin: 5px 0; font-size: 11px; color: #999999;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `;
};

// Inject footer into HTML
const injectFooter = (html: string, footer: string): string => {
  // Check if HTML has body tag
  if (html.includes('</body>')) {
    return html.replace('</body>', footer + '\n</body>');
  }
  
  // Check if HTML has closing html tag
  if (html.includes('</html>')) {
    return html.replace('</html>', footer + '\n</html>');
  }
  
  // If no structure, just append footer
  return html + footer;
};

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const {
      to,
      subject,
      html,
      text,
      fromEmail,
      fromName,
      replyTo,
      attachments,
      headers,
      skipFooter = false,
    } = options;

    // Format recipients
    const recipients = Array.isArray(to) ? to.join(', ') : to;

    // Add footer to HTML (unless skipped)
    let finalHtml = html;
    if (!skipFooter) {
      const appName = 'DropAphi';
      const footer = getFooter(appName);
      finalHtml = injectFooter(html, footer);
    }

    // Prepare email options
    const mailOptions: any = {
      from: fromName ? `"${fromName}" <${process.env.SMTP_USER}>` : (fromEmail || process.env.SMTP_USER),
      to: recipients,
      subject,
      html: finalHtml,
      ...(text && { text }),
      ...(attachments && { attachments }),
      ...(headers && { headers }),
    };

    // Send email using transporter
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL_SENDER] Email sent: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    console.error('[EMAIL_SENDER] Failed to send:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'EMAIL_SEND_FAILED' 
    };
  }
}

// Export as object for backward compatibility
export const emailSender = {
  sendEmail,
  sendBatch: async (emails: EmailOptions[]): Promise<EmailResult[]> => {
    const results: EmailResult[] = [];
    for (const email of emails) {
      const result = await sendEmail(email);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  },
  verifyConnection: async (): Promise<boolean> => {
    try {
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('[EMAIL_SENDER] Transporter verification failed:', error);
      return false;
    }
  }
};

// Simple function export for direct use
export async function send3rdPartyOTPEmail(to: string, subject: string, html: string, appName: string) {
  try {
    // Add footer to the HTML
    const footer = getFooter(appName);
    const htmlWithFooter = injectFooter(html, footer);
    
    const info = await transporter.sendMail({
      from: `${appName} <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlWithFooter,
    });
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: "EMAIL_SEND_FAILED" };
  }
}






