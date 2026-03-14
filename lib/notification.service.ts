// lib/services/notification.service.ts
import { db } from "@/lib/db";
import { dropid } from "dropid";
import { NotificationType, NotificationPriority, NotificationChannel } from "@/lib/generated/prisma/enums";
import { notificationTemplates } from "@/components/notification/notification-template";

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  variables?: Record<string, any>;
  metadata?: any;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
} 

export class NotificationService {
  
  static async create(params: CreateNotificationParams) {
    const { userId, type, variables = {}, metadata, priority, actionUrl, actionLabel } = params;
    
    const template = notificationTemplates[type];
    if (!template) {
      console.error(`Notification template not found for type: ${type}`);
      return null;
    }

    // Replace variables in templates
    const title = this.replaceVariables(template.title, variables);
    const message = this.replaceVariables(template.message, variables);
    const shortMessage = this.replaceVariables(template.shortMessage, variables);
    const finalActionUrl = actionUrl || (template.actionUrl ? this.replaceVariables(template.actionUrl, variables) : undefined);
    const finalActionLabel = actionLabel || template.actionLabel;

    // Check user preferences
    const prefs = await db.notificationPreference.findUnique({
      where: { userId },
    });

    // Create notification in database
    const notification = await db.notification.create({
      data: {
        id: dropid('notif'),
        userId,
        type,
        priority: priority || template.priority,
        title,
        message,
        shortMessage,
        actionUrl: finalActionUrl,
        actionLabel: finalActionLabel,
        metadata: {
          ...metadata,
          variables,
          template: template.type,
        },
      },
    });

    // Send based on preferences
    await this.sendViaChannels(notification, prefs, variables);

    return notification;
  }

  static async sendViaChannels(notification: any, prefs: any, variables: any) {
    const channels: NotificationChannel[] = [];

    if (prefs?.emailEnabled !== false) channels.push('EMAIL');
    if (prefs?.pushEnabled !== false) channels.push('PUSH');
    if (prefs?.smsEnabled === true) channels.push('SMS');

    for (const channel of channels) {
      try {
        await this.sendToChannel(channel, notification, variables);
        
        // Update delivery log
        await db.notificationDeliveryLog.create({
          data: {
            id: dropid('log'),
            notificationId: notification.id,
            channel,
            status: 'sent',
            attemptedAt: new Date(),
          },
        });
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        
        await db.notificationDeliveryLog.create({
          data: {
            id: dropid('log'),
            notificationId: notification.id,
            channel,
            status: 'failed',
            attemptedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }
  }

  static async sendToChannel(channel: NotificationChannel, notification: any, variables: any) {
    switch (channel) {
      case 'EMAIL':
        // Implement email sending (Resend, SendGrid, etc.)
        console.log('Sending email:', {
          to: variables.email,
          subject: notification.title,
          body: notification.message,
        });
        break;
      
      case 'PUSH':
        // Implement push notification (Firebase, OneSignal, etc.)
        console.log('Sending push:', {
          title: notification.shortMessage,
          body: notification.message,
        });
        break;
      
      case 'SMS':
        // Implement SMS (Twilio, etc.)
        console.log('Sending SMS:', {
          to: variables.phone,
          message: notification.shortMessage,
        });
        break;
    }
  }

  static replaceVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return db.notification.update({
      where: { id: notificationId, userId },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  static async markAllAsRead(userId: string) {
    return db.notification.updateMany({
      where: { userId, status: 'UNREAD' },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  static async archive(notificationId: string, userId: string) {
    return db.notification.update({
      where: { id: notificationId, userId },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    });
  }

  static async getUserNotifications(userId: string, page = 1, limit = 20) {
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await db.notification.count({
      where: { userId, status: 'UNREAD' },
    });

    return { notifications, unreadCount };
  }
}