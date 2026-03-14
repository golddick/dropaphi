// lib/email/service/email-service.ts
import { db } from "@/lib/db";
import { dropid } from "dropid";


export interface CampaignStats {
  totalCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  averageOpenRate: number;
  averageClickRate: number;
  bounceRate: number;
  totalDelivered: number;
}

export interface EmailStats {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  uniqueOpens: number;
  uniqueClicks: number;
  totalDelivered: number;
  sentThisMonth: number;
  monthlyLimit: number;
  remainingThisMonth: number;
}

class EmailService {


  /**
   * Get campaign statistics for a workspace
   */
  async getCampaignStats(workspaceId: string): Promise<CampaignStats> {
    try {
      const campaigns = await db.emailCampaign.findMany({
        where: { workspaceId },
        include: {
          emails: {
            select: {
              status: true,
              openCount: true,
              clickCount: true,
              bouncedAt: true,
              deliveredAt: true,
              trackingEvents: {
                select: {
                  event: true
                }
              }
            }
          }
        }
      });

      const totalCampaigns = campaigns.length;
      
      // Aggregate email stats across all campaigns
      let totalSent = 0;
      let totalOpened = 0;
      let totalClicked = 0;
      let totalBounced = 0;
      let totalDelivered = 0;

      campaigns.forEach(campaign => {
        campaign.emails.forEach(email => {
          totalSent++;
          
          if ( email.deliveredAt) {
            totalDelivered++;
          }
          
          if (email.bouncedAt) {
            totalBounced++;
          }
          
          // Count unique opens (if openCount > 0)
          if (email.openCount > 0) {
            totalOpened++;
          }
          
          // Count unique clicks (if clickCount > 0)
          if (email.clickCount > 0) {
            totalClicked++;
          }
        });
      });

      const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const averageClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
      const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

      return {
        totalCampaigns,
        totalSent,
        totalOpened,
        totalClicked,
        averageOpenRate,
        averageClickRate,
        bounceRate,
        totalDelivered
      };
    } catch (error) {
      console.error('[EMAIL_SERVICE_CAMPAIGN_STATS_ERROR]', error);
      throw error;
    }
  }

  /**
   * Get email statistics for a workspace
   */
  async getWorkspaceStats(workspaceId: string): Promise<EmailStats> {
    try {
      // Get workspace to check limits
      const workspace = await db.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          emailLimit: true,
          currentEmailsSent: true,
        }
      });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      // Get all emails for this workspace
      const emails = await db.email.findMany({
        where: { workspaceId },
        include: {
          trackingEvents: {
            select: {
              event: true
            }
          }
        }
      });

      // Calculate stats
      const totalSent = emails.length;
      const totalOpened = emails.filter(email => email.openCount > 0).length;
      const totalClicked = emails.filter(email => email.clickCount > 0).length;
      const totalBounced = emails.filter(email => email.bouncedAt).length;
      const totalDelivered = emails.filter(email => email.deliveredAt).length;

      // Unique opens and clicks (counting emails that have been opened/clicked at least once)
      const uniqueOpens = totalOpened;
      const uniqueClicks = totalClicked;

      // Get current month's sent count
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const sentThisMonth = await db.email.count({
        where: {
          workspaceId,
          createdAt: {
            gte: firstDayOfMonth
          }
        }
      });

      const monthlyLimit = workspace.emailLimit || 0;
      const remainingThisMonth = Math.max(0, monthlyLimit - sentThisMonth);

      return {
        totalSent,
        totalOpened,
        totalClicked,
        totalBounced,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
        uniqueOpens,
        uniqueClicks,
        totalDelivered,
        sentThisMonth,
        monthlyLimit,
        remainingThisMonth
      };
    } catch (error) {
      console.error('[EMAIL_SERVICE_STATS_ERROR]', error);
      throw error;
    }
  }

  /**
   * Track email open
   */
  async trackOpen(emailId: string, eventData: {
    ipAddress?: string;
    userAgent?: string;
    country?: string;
  }) {
    try {
      // Create tracking event
      await db.emailTrackingEvent.create({
        data: {
          id: dropid('etv'),
          emailId,
          event: 'open',
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          country: eventData.country,
        }
      });

      // Update email open count and openedAt if first open
      const email = await db.email.findUnique({
        where: { id: emailId },
        select: { openCount: true, openedAt: true }
      });

      await db.email.update({
        where: { id: emailId },
        data: {
          openCount: {
            increment: 1
          },
          openedAt: email?.openCount === 0 ? new Date() : undefined
        }
      });

    } catch (error) {
      console.error('[EMAIL_SERVICE_TRACK_OPEN_ERROR]', error);
    }
  }

  /**
   * Track email click
   */
  async trackClick(emailId: string, url: string, eventData: {
    ipAddress?: string;
    userAgent?: string;
    country?: string;
  }) {
    try {
      // Create tracking event
      await db.emailTrackingEvent.create({
        data: {
          id: dropid('etv'),
          emailId,
          event: 'click',
          url,
          ipAddress: eventData.ipAddress,
          userAgent: eventData.userAgent,
          country: eventData.country,
        }
      });

      // Update email click count and clickedAt if first click
      const email = await db.email.findUnique({
        where: { id: emailId },
        select: { clickCount: true, clickedAt: true }
      });

      await db.email.update({
        where: { id: emailId },
        data: {
          clickCount: {
            increment: 1
          },
          clickedAt: email?.clickCount === 0 ? new Date() : undefined
        }
      });

    } catch (error) {
      console.error('[EMAIL_SERVICE_TRACK_CLICK_ERROR]', error);
    }
  }

  /**
   * Track email delivery
   */
  async trackDelivery(emailId: string) {
    try {
      await db.email.update({
        where: { id: emailId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date()
        }
      });
    } catch (error) {
      console.error('[EMAIL_SERVICE_TRACK_DELIVERY_ERROR]', error);
    }
  }

  /**
   * Track email bounce
   */
  async trackBounce(emailId: string, reason?: string) {
    try {
      await db.email.update({
        where: { id: emailId },
        data: {
          status: 'BOUNCED',
          bouncedAt: new Date(),
          bounceReason: reason
        }
      });

      // Update campaign rates if applicable
      const email = await db.email.findUnique({
        where: { id: emailId },
        select: { campaignId: true }
      });

      if (email?.campaignId) {
        await this.updateCampaignRates(email.campaignId);
      }
    } catch (error) {
      console.error('[EMAIL_SERVICE_TRACK_BOUNCE_ERROR]', error);
    }
  }

  /**
   * Update campaign open and click rates
   */
  private async updateCampaignRates(campaignId: string) {
    try {
      const campaign = await db.emailCampaign.findUnique({
        where: { id: campaignId },
        include: {
          emails: {
            select: {
              openCount: true,
              clickCount: true,
              status: true
            }
          }
        }
      });

      if (!campaign) return;

      const totalEmails = campaign.emails.length;
      const totalOpened = campaign.emails.filter(e => e.openCount > 0).length;
      const totalClicked = campaign.emails.filter(e => e.clickCount > 0).length;

      const openRate = totalEmails > 0 ? (totalOpened / totalEmails) * 100 : 0;
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

      await db.emailCampaign.update({
        where: { id: campaignId },
        data: {
          openRate,
          clickRate
        }
      });
    } catch (error) {
      console.error('[EMAIL_SERVICE_UPDATE_CAMPAIGN_RATES_ERROR]', error);
    }
  }

  /**
   * Get email details with tracking events
   */
  async getEmailDetails(emailId: string) {
    try {
      const email = await db.email.findUnique({
        where: { id: emailId },
        include: {
          trackingEvents: {
            orderBy: { createdAt: 'desc' }
          },
          campaign: true,
          template: true
        }
      });

      return email;
    } catch (error) {
      console.error('[EMAIL_SERVICE_GET_EMAIL_DETAILS_ERROR]', error);
      throw error;
    }
  }

  /**
   * Get campaign details with emails
   */
  async getCampaignDetails(campaignId: string) {
    try {
      const campaign = await db.emailCampaign.findUnique({
        where: { id: campaignId },
        include: {
          emails: {
            include: {
              trackingEvents: {
                orderBy: { createdAt: 'desc' }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return campaign;
    } catch (error) {
      console.error('[EMAIL_SERVICE_GET_CAMPAIGN_DETAILS_ERROR]', error);
      throw error;
    }
  }

  /**
   * Get email stats for a specific campaign
   */
  async getCampaignEmailStats(campaignId: string) {
    try {
      const emails = await db.email.findMany({
        where: { campaignId },
        select: {
          id: true,
          status: true,
          openCount: true,
          clickCount: true,
          deliveredAt: true,
          bouncedAt: true,
          trackingEvents: {
            select: {
              event: true,
              createdAt: true,
              url: true,
              country: true
            }
          }
        }
      });

      const totalSent = emails.length;
      const totalDelivered = emails.filter(e => e.deliveredAt).length;
      const totalBounced = emails.filter(e => e.bouncedAt).length;
      const totalOpened = emails.filter(e => e.openCount > 0).length;
      const totalClicked = emails.filter(e => e.clickCount > 0).length;
      
      // Aggregate open and click counts
      const totalOpenEvents = emails.reduce((sum, e) => sum + e.openCount, 0);
      const totalClickEvents = emails.reduce((sum, e) => sum + e.clickCount, 0);

      // Group clicks by URL
      const clicksByUrl: Record<string, number> = {};
      emails.forEach(email => {
        email.trackingEvents
          .filter(e => e.event === 'click' && e.url)
          .forEach(e => {
            if (e.url) {
              clicksByUrl[e.url] = (clicksByUrl[e.url] || 0) + 1;
            }
          });
      });

      // Group opens by country
      const opensByCountry: Record<string, number> = {};
      emails.forEach(email => {
        email.trackingEvents
          .filter(e => e.event === 'open' && e.country)
          .forEach(e => {
            if (e.country) {
              opensByCountry[e.country] = (opensByCountry[e.country] || 0) + 1;
            }
          });
      });

      return {
        totalSent,
        totalDelivered,
        totalBounced,
        totalOpened,
        totalClicked,
        totalOpenEvents,
        totalClickEvents,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
        clicksByUrl,
        opensByCountry
      };
    } catch (error) {
      console.error('[EMAIL_SERVICE_GET_CAMPAIGN_EMAIL_STATS_ERROR]', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();