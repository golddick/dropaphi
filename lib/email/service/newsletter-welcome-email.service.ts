// lib/email/services/welcome-email.service.ts
import { db } from "@/lib/db";
import { emailSender, EmailOptions } from "./email-sender.service";

interface WelcomeEmailOptions {
  workspaceId: string;
  subscriber: {
    id: string;
    email: string;
    name?: string | null;
  };
  templateId?: string;
  customVariables?: Record<string, string>;
}

interface TemplateVariables {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  unsubscribeUrl: string;
  workspaceName: string;
  workspaceEmail: string;
  year: string;
  date: string;
  subscriberId: string;
  [key: string]: string; // Allow custom variables
}

class WelcomeEmailService {
  /**
   * Send welcome email with template or fallback
   */
  async sendWelcomeEmail({ workspaceId, subscriber, templateId, customVariables = {} }: WelcomeEmailOptions) {
    try {
      // Get workspace details
      const workspace = await db.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          emailSenders: true,
        },
      });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      const workspace_fromName = workspace.emailSenders?.name

      // Get sender details
      const sender = workspace.emailSenders || {
        email: process.env.MAIL_FROM || 'noreply@dropaphi.com',
        name: workspace_fromName || 'DropAphi',
      };

      // Prepare variables
      const variables = await this.prepareVariables(workspace, subscriber, customVariables);

      // Try to get template from database
      let template = await this.findTemplate(workspaceId, templateId);

      let emailOptions: EmailOptions;

      if (template) {
        // Use template from database
        emailOptions = await this.buildFromTemplate(template, variables, sender);
        
        // Update template usage count
        await db.emailTemplate.update({
          where: { id: template.id },
          data: { useCount: { increment: 1 } },
        });
      } else {
        // Use fallback template
        emailOptions = this.buildFallbackTemplate(variables, sender);
      }

      // Send email
      const result = await emailSender.sendEmail(emailOptions);

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        usedTemplate: template?.name || 'fallback',
      };

    } catch (error) {
      console.error('[WELCOME_EMAIL] Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Find template by ID or name
   */
  private async findTemplate(workspaceId: string, templateId?: string) {
    if (templateId) {
      const template = await db.emailTemplate.findFirst({
        where: {
          id: templateId,
          workspaceId,
          isActive: true,
        },
      });
      if (template) return template;
    }

    // Try to find by name patterns
    const template = await db.emailTemplate.findFirst({
      where: {
        workspaceId,
        OR: [
          { name: "Newsletter_welcome" },
          { name: "welcome_email" },
          { name: { contains: "welcome", mode: 'insensitive' } }
        ],
        isActive: true,
      },
      orderBy: { useCount: 'desc' },
    });

    return template;
  }

  /**
   * Prepare all variables for template
   */
  private async prepareVariables(
    workspace: any, 
    subscriber: WelcomeEmailOptions['subscriber'],
    customVariables: Record<string, string>
  ): Promise<TemplateVariables> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const nameParts = subscriber.name?.split(' ') || [];
    
    return {
      // Subscriber info
      name: subscriber.name || 'Subscriber',
      firstName: nameParts[0] || 'Subscriber',
      lastName: nameParts.slice(1).join(' ') || '',
      email: subscriber.email,
      subscriberId: subscriber.id,

      // URLs
      unsubscribeUrl: `${baseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&workspace=${workspace.id}`,

      // Workspace info
      workspaceName: workspace.name || 'Our Newsletter',
      workspaceEmail: workspace.email || workspace.emailSenders?.email || '',

      // Dynamic values
      year: new Date().getFullYear().toString(),
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),

      // Allow custom variables to override defaults
      ...customVariables,
    };
  }

  /**
   * Build email from database template
   */
  private async buildFromTemplate(
    template: any, 
    variables: TemplateVariables,
    sender: any
  ): Promise<EmailOptions> {
    let html = template.bodyHtml || '';
    let text = template.bodyText || '';
    let subject = template.subject;

    // Replace all variables in all formats
    html = this.replaceVariables(html, variables);
    text = this.replaceVariables(text, variables);
    subject = this.replaceVariables(subject, variables);

    return {
      to: variables.email,
      subject,
      html,
      text: text || undefined,
      fromEmail: sender.email,
      fromName: sender.name,
    };
  }

  /**
   * Build fallback template when no template found
   */
  private buildFallbackTemplate(
    variables: TemplateVariables,
    sender: any
  ): EmailOptions {
    const subject = `Welcome to ${variables.workspaceName}, ${variables.firstName}!`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${variables.workspaceName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
          }
          .content {
            background: #f9f9f9;
            padding: 40px 20px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 12px;
          }
          .unsubscribe {
            color: #999;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${variables.workspaceName}!</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${variables.firstName},</h2>
            
            <p>Thank you for subscribing to ${variables.workspaceName} with <strong>${variables.email}</strong>! We're excited to have you on board.</p>
            
            <p>As a subscriber, you'll receive:</p>
            
            <ul style="color: #666; margin: 20px 0;">
              <li>Exclusive content and updates</li>
              <li>Early access to new features</li>
              <li>Special offers and promotions</li>
              <li>Industry insights and tips</li>
            </ul>
            
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
            
            <p style="color: #999; font-size: 14px;">
              You're receiving this email because you subscribed to ${variables.workspaceName}.
          </div>
          
          <div class="footer">
            <p>&copy; ${variables.year} ${variables.workspaceName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Welcome to ${variables.workspaceName}!

Hello ${variables.firstName},

Thank you for subscribing to ${variables.workspaceName} with ${variables.email}! We're excited to have you on board.

As a subscriber, you'll receive:
- Exclusive content and updates
- Early access to new features
- Special offers and promotions
- Industry insights and tips

Please confirm your subscription by visiting: ${variables.confirmUrl}

If you didn't sign up for this newsletter, you can safely ignore this email.

---

You're receiving this email because you subscribed to ${variables.workspaceName}.

© ${variables.year} ${variables.workspaceName}. All rights reserved.
    `;

    return {
      to: variables.email,
      subject,
      html,
      text,
      fromEmail: sender.email,
      fromName: sender.name,
    };
  }

  /**
   * Replace variables in template (supports multiple formats)
   */
  private replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content;

    // Support multiple variable formats
    const formats = [
      // {{variable}}
      (key: string) => new RegExp(`{{${key}}}`, 'g'),
      // {{ variable }}
      (key: string) => new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
      // [[variable]]
      (key: string) => new RegExp(`\\[\\[${key}\\]\\]`, 'g'),
      // ${variable}
      (key: string) => new RegExp(`\\$\\{${key}\\}`, 'g'),
    ];

    Object.entries(variables).forEach(([key, value]) => {
      formats.forEach(format => {
        result = result.replace(format(key), value);
      });
    });

    return result;
  }
}

// Export singleton instance
export const welcomeEmail = new WelcomeEmailService();