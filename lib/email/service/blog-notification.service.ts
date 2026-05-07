import { db } from "@/lib/db";
import { mailSender, EmailOptions } from "./transporter";
import { isServiceActive } from "@/lib/services/service-status";
import { Services } from "@/lib/generated/prisma";

interface BlogNotificationOptions {
  workspaceId: string;
  postId: string;
}

interface TemplateVariables {
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
  coverImage?: string;
  authorName: string;
  workspaceName: string;
  unsubscribeUrl: string;
  year: string;
}

class BlogNotificationService {
  async notifySubscribers({ workspaceId, postId }: BlogNotificationOptions) {
    try {
      // Check if BLOG and EMAIL services are globally active
      const emailActive = await isServiceActive(Services.EMAIL);
      const blogActive = await isServiceActive(Services.BLOG);
      
      if (!emailActive || !blogActive) {
        return { success: false, error: 'Email or Blog service is currently disabled system-wide' };
      }

      // Get workspace, post, and subscribers
      const [workspace, post, subscribers] = await Promise.all([
        db.workspace.findUnique({
          where: { id: workspaceId },
          include: { emailSenders: true }
        }),
        db.blogPost.findUnique({
          where: { id: postId },
          include: { author: { select: { fullName: true } } }
        }),
        db.subscriber.findMany({
          where: { 
            workspaceId, 
            status: 'ACTIVE' 
          },
          select: { id: true, email: true, name: true }
        })
      ]);

      if (!workspace || !post) {
        throw new Error('Workspace or Post not found');
      }

      if (subscribers.length === 0) {
        return { success: true, message: 'No active subscribers to notify' };
      }

      const sender = workspace.emailSenders || {
        email: process.env.MAIL_FROM || 'no-reply@dropaphi.xyz',
        name: workspace.name || 'DropAphi',
      };

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dropaphi.xyz';
      const postUrl = `${baseUrl}/blog/${post.slug}`;

      // Prepare template variables
      const variables: TemplateVariables = {
        postTitle: post.title,
        postExcerpt: post.excerpt || '',
        postUrl,
        coverImage: post.coverImage || undefined,
        authorName: post.author.fullName,
        workspaceName: workspace.name,
        unsubscribeUrl: `${baseUrl}/api/unsubscribe`, // transporter adds full unsubscribe link with params
        year: new Date().getFullYear().toString(),
      };

      const html = this.renderTemplate(variables);
      const subject = `New Post: ${post.title} | ${workspace.name}`;

      // Send emails to all subscribers
      const results = await Promise.all(
        subscribers.map(async (subscriber) => {
          // Create Email record for history and tracking
          const emailRecord = await db.email.create({
            data: {
              workspaceId,
              fromEmail: sender.email,
              fromName: sender.name,
              toEmails: [subscriber.email],
              subject,
              bodyHtml: html,
              status: 'PENDING',
              source: 'blog_notification',
              mailSentFrom: 'IN_APP',
            }
          });

          return mailSender.sendEmail({
            to: subscriber.email,
            subject,
            html,
            fromEmail: sender.email,
            fromName: sender.name,
            workspaceId,
            emailId: emailRecord.id,
          });
        })
      );

      const successfulSent = results.filter(r => r.success).length;

      return {
        success: true,
        total: subscribers.length,
        sent: successfulSent,
        failed: subscribers.length - successfulSent
      };

    } catch (error) {
      console.error('[BLOG_NOTIFICATION] Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private renderTemplate(v: TemplateVariables): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${v.postTitle}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #e1e1e1;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            padding: 24px;
            text-align: center;
            border-bottom: 1px solid #f0f0f0;
          }
          .header .workspace-name {
            font-size: 14px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .cover-image {
            width: 100%;
            height: auto;
            max-height: 300px;
            object-fit: cover;
          }
          .content {
            padding: 32px 24px;
          }
          h1 {
            font-size: 24px;
            margin-top: 0;
            color: #000;
          }
          .excerpt {
            color: #444;
            font-size: 16px;
            margin-bottom: 24px;
          }
          .author {
            font-size: 14px;
            color: #888;
            margin-bottom: 32px;
          }
          .button-container {
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 12px 28px;
            background-color: #000;
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            border-radius: 6px;
            font-size: 16px;
          }
          .footer {
            padding: 24px;
            background-color: #fcfcfc;
            border-top: 1px solid #f0f0f0;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          .footer a {
            color: #999;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="workspace-name">${v.workspaceName}</span>
          </div>
          
          ${v.coverImage ? `<img src="${v.coverImage}" alt="${v.postTitle}" class="cover-image" />` : ''}
          
          <div class="content">
            <h1>${v.postTitle}</h1>
            <div class="author">By ${v.authorName}</div>
            
            ${v.postExcerpt ? `<p class="excerpt">${v.postExcerpt}</p>` : ''}
            
            <div class="button-container">
              <a href="${v.postUrl}" class="button">Read Full Post</a>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; ${v.year} ${v.workspaceName}. All rights reserved.</p>
            <p>You're receiving this because you're subscribed to updates from ${v.workspaceName}.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const blogNotification = new BlogNotificationService();
