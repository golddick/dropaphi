







// lib/email/invitation/invitation.ts
import { db } from '@/lib/db';
import { getInvitationEmailHtml, getInvitationEmailText } from '../templates/workspace-invitation';
import { sendEmail } from '../auth/email';
import { nodemailerService } from '@/lib/stores/workspace/workspace-email-sender';

interface InvitationData {
  id: string;
  workspaceId: string;
  email: string;
  role: string;
  token: string;
  invitedBy: string;
  workspaceName?: string;
  inviterName?: string;
  inviterEmail?: string;
}

interface WorkspaceSender {
  email: string;
  name: string;
  verified: boolean;
}

/**
 * Get workspace email sender
 */
async function getWorkspaceSender(workspaceId: string): Promise<WorkspaceSender | null> {
  try {
    // Try to get workspace with its email sender
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        emailSenders: true,
      },
    });

    if (!workspace) {
      console.log(`[Invitation] Workspace ${workspaceId} not found`);
      return null;
    }

    // Check if workspace has a verified email sender
    if (workspace.emailSenders) {
      console.log(`[Invitation] Using workspace sender: ${workspace.emailSenders.name} <${workspace.emailSenders.email}>`);
      return {
        email: workspace.emailSenders.email,
        name: workspace.emailSenders.name,
        verified: workspace.emailSenders.verified,
      };
    }

    // Fallback to workspace email if no sender configured
    if (workspace.email) {
      console.log(`[Invitation] No sender configured, using workspace email: ${workspace.email}`);
      return {
        email: workspace.email,
        name: workspace.name || workspace.email.split('@')[0],
        verified: false,
      };
    }

    // Final fallback to environment
    console.log('[Invitation] No workspace email, using environment fallback');
    return {
      email: process.env.DEFAULT_FROM_EMAIL || 'noreply@dropaphi.com',
      name: process.env.DEFAULT_FROM_NAME || 'Drop API',
      verified: false,
    };
  } catch (error) {
    console.error('[Invitation] Error getting workspace sender:', error);
    return null;
  }
}

export async function sendInvitationEmails(invitations: InvitationData[]): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  const results = await Promise.allSettled(
    invitations.map(invitation => sendInvitationEmail(invitation))
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`[Invitations] Sent ${successful}/${invitations.length} emails (${failed} failed)`);

  return {
    total: invitations.length,
    successful,
    failed
  };
}

async function sendInvitationEmail(invitation: InvitationData): Promise<any> {
  try {
    const inviterName = invitation.inviterName || 'Admin';
    const workspaceName = invitation.workspaceName || 'a workspace';
    
    // Get workspace sender
    const sender = await getWorkspaceSender(invitation.workspaceId);
    
    if (!sender) {
      throw new Error('No sender configured for this workspace');
    }

    // Use token directly in URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`;

    console.log(`[Invitation] Sending email to ${invitation.email} from ${sender.email}`);

    // Send email using nodemailer service
    const result = await nodemailerService.sendEmail({
      to: invitation.email,
      subject: `${inviterName} invited you to join ${workspaceName} on Drop APHI`,
      html: getInvitationEmailHtml({
        inviterName,
        inviterEmail: invitation.inviterEmail || '',
        workspaceName,
        inviteeEmail: invitation.email,
        role: invitation.role,
        inviteUrl,
        expiresIn: '7 days'
      }),
      text: getInvitationEmailText({
        inviterName,
        workspaceName,
        role: invitation.role,
        inviteUrl,
        expiresIn: '7 days'
      }),
      fromEmail: sender.email,
      fromName: sender.name,
      replyTo: sender.email,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }

    return result;
  } catch (error) {
    console.error(`[Invitation] Failed to send to ${invitation.email}:`, error);
    throw new Error(`Failed to send invitation to ${invitation.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send a single invitation (useful for resending)
 */
export async function sendSingleInvitation(invitationId: string): Promise<boolean> {
  try {
    const { db } = await import('@/lib/db');
    
    // Get invitation details
    const invitation = await db.teamInvitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Get workspace and inviter details
    const [workspace, inviter] = await Promise.all([
      db.workspace.findUnique({
        where: { id: invitation.workspaceId },
        select: { name: true }
      }),
      db.user.findUnique({
        where: { id: invitation.invitedBy },
        select: { fullName: true, email: true }
      })
    ]);

    const invitationData: InvitationData = {
      id: invitation.id,
      workspaceId: invitation.workspaceId,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      invitedBy: invitation.invitedBy,
      workspaceName: workspace?.name,
      inviterName: inviter?.fullName || inviter?.email,
      inviterEmail: inviter?.email
    };

    await sendInvitationEmail(invitationData);
    return true;
  } catch (error) {
    console.error('[Invitation] Failed to send single invitation:', error);
    return false;
  }
}

// Retry failed invitations
export async function retryFailedInvitations(invitationIds: string[]): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  try {
    const { db } = await import('@/lib/db');
    
    const invitations = await db.teamInvitation.findMany({
      where: {
        id: { in: invitationIds },
        status: 'PENDING'
      }
    });

    if (invitations.length === 0) {
      return { total: 0, successful: 0, failed: 0 };
    }

    // Get workspace and inviter details for each invitation
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (inv) => {
        const [workspace, inviter] = await Promise.all([
          db.workspace.findUnique({
            where: { id: inv.workspaceId },
            select: { name: true }
          }),
          db.user.findUnique({
            where: { id: inv.invitedBy },
            select: { fullName: true, email: true }
          })
        ]);

        return {
          id: inv.id,
          workspaceId: inv.workspaceId,
          email: inv.email,
          role: inv.role,
          token: inv.token,
          invitedBy: inv.invitedBy,
          workspaceName: workspace?.name,
          inviterName: inviter?.fullName || inviter?.email,
          inviterEmail: inviter?.email
        };
      })
    );

    return sendInvitationEmails(invitationsWithDetails);
  } catch (error) {
    console.error('[Invitation] Failed to retry invitations:', error);
    throw new Error(`Failed to retry invitations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

