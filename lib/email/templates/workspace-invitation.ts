// lib/email/templates/invitation.ts
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface InvitationEmailProps {
  inviterName: string;
  inviterEmail?: string;
  workspaceName: string;
  workspaceId?: string;
  workspaceSlug?: string;
  workspaceCreatedAt?: string;
  workspaceMemberCount?: number;
  workspacePlan?: string;
  inviteeEmail: string;
  role: string;
  inviteUrl: string;
  expiresIn: string;
}

export function getInvitationEmailHtml(props: InvitationEmailProps): string {
  const {
    inviterName,
    inviterEmail,
    workspaceName,
    workspaceId,
    workspaceSlug,
    workspaceCreatedAt,
    workspaceMemberCount,
    workspacePlan,
    role,
    inviteUrl,
    expiresIn
  } = props;

  const roleDescriptions: Record<string, string> = {
    ADMIN: "Full access to workspace settings, billing, and all projects. Can manage members and create/delete projects.",
    MEMBER: "Can create and manage projects, view workspace members, but cannot modify workspace settings or billing.",
    VIEWER: "Read-only access to all projects and workspace information. Cannot create or modify content."
  };

  const roleColors: Record<string, string> = {
    ADMIN: "#DC143C",
    MEMBER: "#3B82F6",
    VIEWER: "#6B7280"
  };

  const formattedDate = workspaceCreatedAt 
    ? new Date(workspaceCreatedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're invited to join ${workspaceName}</title>
      <style>
        @media only screen and (max-width: 600px) {
          .workspace-table td {
            display: block;
            width: 100% !important;
            box-sizing: border-box;
          }
          .workspace-table tr {
            margin-bottom: 16px;
            display: block;
          }
          .workspace-table td:first-child {
            background-color: #F5F5F5;
            font-weight: 600;
          }
        }
      </style>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1A1A1A; margin: 0; padding: 0; background-color: #F5F5F5;">
      <div style="max-width: 560px; margin: 40px auto; padding: 32px; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <!-- Header with Logo -->
        <div style="margin-bottom: 32px; text-align: center;">
          <span style="font-size: 24px; font-weight: 700; color: #DC143C;">Drop APHI</span>
        </div>

        <!-- Main Content -->
        <h1 style="font-size: 28px; font-weight: 700; color: #1A1A1A; margin-bottom: 16px; text-align: center;">
          You're Invited! 🎉
        </h1>
        
        <p style="color: #666666; margin-bottom: 32px; text-align: center; font-size: 16px;">
          <strong style="color: #1A1A1A;">${inviterName}</strong> has invited you to join their workspace on Drop API.
        </p>

        <!-- Workspace Details Table -->
        <table width="100%" style="margin-bottom: 32px; border-collapse: collapse; background-color: #F9F9F9; border-radius: 12px; overflow: hidden;" class="workspace-table">
          <tr>
            <td colspan="2" style="padding: 20px 24px 8px 24px; background-color: #F0F0F0;">
              <h2 style="font-size: 18px; font-weight: 600; color: #1A1A1A; margin: 0;">
                Workspace Details
              </h2>
            </td>
          </tr>
          
          <!-- Workspace Name -->
          <tr>
            <td style="padding: 16px 24px; width: 40%; background-color: #F5F5F5; font-weight: 500; color: #666666; border-bottom: 1px solid #E5E5E5;">
              Workspace Name
            </td>
            <td style="padding: 16px 24px; background-color: #FFFFFF; font-weight: 600; color: #1A1A1A; border-bottom: 1px solid #E5E5E5;">
              ${workspaceName}
            </td>
          </tr>

          <!-- Your Role -->
          <tr>
            <td style="padding: 16px 24px; background-color: #F5F5F5; font-weight: 500; color: #666666; border-bottom: 1px solid #E5E5E5;">
              Your Role
            </td>
            <td style="padding: 16px 24px; background-color: #FFFFFF; border-bottom: 1px solid #E5E5E5;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; background-color: ${roleColors[role]}20; color: ${roleColors[role]};">
                ${role}
              </span>
            </td>
          </tr>

          <!-- Invited By -->
          <tr>
            <td style="padding: 16px 24px; background-color: #F5F5F5; font-weight: 500; color: #666666; border-bottom: 1px solid #E5E5E5;">
              Invited By
            </td>
            <td style="padding: 16px 24px; background-color: #FFFFFF; border-bottom: 1px solid #E5E5E5;">
              <span style="font-weight: 600; color: #1A1A1A;">${inviterName}</span>
              ${inviterEmail ? `<br><span style="font-size: 13px; color: #666666;">${inviterEmail}</span>` : ''}
            </td>
          </tr>

          ${workspaceId ? `
          <!-- Workspace ID -->
          <tr>
            <td style="padding: 16px 24px; background-color: #F5F5F5; font-weight: 500; color: #666666; border-bottom: 1px solid #E5E5E5;">
              Workspace ID
            </td>
            <td style="padding: 16px 24px; background-color: #FFFFFF; border-bottom: 1px solid #E5E5E5;">
              <code style="font-family: monospace; font-size: 13px; color: #DC143C; background-color: #FFF5F5; padding: 2px 6px; border-radius: 4px;">${workspaceId}</code>
            </td>
          </tr>
          ` : ''}

          ${workspaceSlug ? `
          <!-- Workspace Slug -->
          <tr>
            <td style="padding: 16px 24px; background-color: #F5F5F5; font-weight: 500; color: #666666; border-bottom: 1px solid #E5E5E5;">
              Workspace URL
            </td>
            <td style="padding: 16px 24px; background-color: #FFFFFF; border-bottom: 1px solid #E5E5E5;">
              <code style="font-family: monospace; font-size: 13px; color: #3B82F6;">${APP_URL}/${workspaceSlug}</code>
            </td>
          </tr>
          ` : ''}

          ${workspaceMemberCount ? `
          <!-- Team Size -->
          <tr>
            <td style="padding: 16px 24px; background-color: #F5F5F5; font-weight: 500; color: #666666; border-bottom: 1px solid #E5E5E5;">
              Team Size
            </td>
            <td style="padding: 16px 24px; background-color: #FFFFFF; border-bottom: 1px solid #E5E5E5;">
              <span style="font-weight: 500;">${workspaceMemberCount}</span> member${workspaceMemberCount !== 1 ? 's' : ''}
            </td>
          </tr>
          ` : ''}

          ${workspacePlan ? `
          <!-- Plan -->
          <tr>
            <td style="padding: 16px 24px; background-color: #F5F5F5; font-weight: 500; color: #666666; border-bottom: 1px solid #E5E5E5;">
              Workspace Plan
            </td>
            <td style="padding: 16px 24px; background-color: #FFFFFF; border-bottom: 1px solid #E5E5E5;">
              <span style="text-transform: capitalize; font-weight: 500;">${workspacePlan.toLowerCase()}</span>
            </td>
          </tr>
          ` : ''}

          ${formattedDate ? `
          <!-- Created Date -->
          <tr>
            <td style="padding: 16px 24px; background-color: #F5F5F5; font-weight: 500; color: #666666; border-bottom: 1px solid #E5E5E5;">
              Workspace Created
            </td>
            <td style="padding: 16px 24px; background-color: #FFFFFF; border-bottom: 1px solid #E5E5E5;">
              ${formattedDate}
            </td>
          </tr>
          ` : ''}
        </table>

        <!-- Role Description Card -->
        <div style="background: linear-gradient(135deg, ${roleColors[role]}10 0%, ${roleColors[role]}05 100%); border-left: 4px solid ${roleColors[role]}; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <h3 style="font-size: 16px; font-weight: 600; color: ${roleColors[role]}; margin: 0;">
              ${role} Permissions
            </h3>
          </div>
          <p style="color: #666666; font-size: 14px; margin: 0; line-height: 1.6;">
            ${roleDescriptions[role] || roleDescriptions.MEMBER}
          </p>
        </div>

        <!-- Quick Stats Grid (Optional - shows when we have member count and plan) -->
        ${workspaceMemberCount && workspacePlan ? `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
          <div style="background-color: #F9F9F9; padding: 16px; border-radius: 8px; text-align: center;">
            <span style="font-size: 24px; font-weight: 700; color: #1A1A1A;">${workspaceMemberCount}</span>
            <span style="display: block; color: #666666; font-size: 13px;">Team Members</span>
          </div>
          <div style="background-color: #F9F9F9; padding: 16px; border-radius: 8px; text-align: center;">
            <span style="font-size: 24px; font-weight: 700; color: #1A1A1A; text-transform: capitalize;">${workspacePlan}</span>
            <span style="display: block; color: #666666; font-size: 13px;">Current Plan</span>
          </div>
        </div>
        ` : ''}

        <!-- CTA Button -->
        <table style="margin-bottom: 32px;" width="100%">
          <tr>
            <td align="center">
              <a href="${inviteUrl}" style="display: inline-block; background: #DC143C; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(220,20,60,0.3);">
                Accept Invitation
              </a>
            </td>
          </tr>
        </table>

        <!-- Alternative Link -->
        <div style="background-color: #F5F5F5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #666666; font-size: 13px; margin: 0 0 12px 0; font-weight: 500;">
            ⚡ Having trouble with the button?
          </p>
          <p style="color: #666666; font-size: 13px; margin: 0 0 8px 0;">
            Copy and paste this link into your browser:
          </p>
          <p style="background-color: #FFFFFF; padding: 12px; border-radius: 6px; font-size: 12px; color: #666666; word-break: break-all; margin: 0; border: 1px solid #E5E5E5;">
            ${inviteUrl}
          </p>
        </div>

        <!-- Expiry Notice -->
        <div style="background-color: #FFF5F5; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
          <p style="color: #DC143C; font-size: 13px; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">⏰</span>
            This invitation will expire in <strong>${expiresIn}</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #E5E5E5; padding-top: 24px; margin-top: 24px;">
          <p style="color: #999999; font-size: 12px; margin-bottom: 16px; text-align: center;">
            If you weren't expecting this invitation, you can safely ignore this email. 
            No account will be created unless you accept the invitation.
          </p>
          <p style="color: #999999; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} Drop APHI. All rights reserved.
          </p>
          <p style="color: #999999; font-size: 11px; text-align: center; margin-top: 16px;">
            Need help? <a href="mailto:support@dropapi.com" style="color: #DC143C; text-decoration: none;">Contact Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getInvitationEmailText(props: Omit<InvitationEmailProps, 'inviteeEmail' | 'inviterEmail' | 'workspaceId' | 'workspaceSlug' | 'workspaceCreatedAt' | 'workspaceMemberCount' | 'workspacePlan'>): string {
  const {
    inviterName,
    workspaceName,
    role,
    inviteUrl,
    expiresIn
  } = props;

  const roleDescriptions: Record<string, string> = {
    ADMIN: "Manage team members, settings, and all resources. Cannot delete workspace.",
    DEVELOPER: "Access API keys, webhooks, and technical settings.",
    WRITER: "Create and send messages email or sms, manage campaigns, and access analytics.",
    VIEWER: "Read-only access to all projects and workspace information. Cannot create or modify content."
  };

  return `

                   You're Invited!                           

${inviterName} has invited you to join their workspace on Drop API.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKSPACE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Workspace: ${workspaceName}
Your Role: ${role}
Invited By: ${inviterName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROLE PERMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${roleDescriptions[role] || roleDescriptions.MEMBER}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCEPT INVITATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click here to accept: ${inviteUrl}

Or copy and paste this link into your browser.

⚠️ This invitation will expire in ${expiresIn}

If you don't have a Drop APHI account yet, you'll be able to 
create one when you accept this invitation.

If you weren't expecting this invitation, you can safely ignore 
this email. No account will be created unless you accept.

© ${new Date().getFullYear()} Drop APHI. All rights reserved.
Need help? Contact support@dropapi.com
  `;
}







// // lib/email/templates/invitation.ts
// const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// interface InvitationEmailProps {
//   inviterName: string;
//   inviterEmail?: string;
//   workspaceName: string;
//   inviteeEmail: string;
//   role: string;
//   inviteUrl: string;
//   expiresIn: string;
// }

// export function getInvitationEmailHtml(props: InvitationEmailProps): string {
//   const {
//     inviterName,
//     inviterEmail,
//     workspaceName,
//     role,
//     inviteUrl,
//     expiresIn
//   } = props;

//   const roleDescriptions: Record<string, string> = {
//     ADMIN: "Full access to workspace settings, billing, and all projects. Can manage members and create/delete projects.",
//     MEMBER: "Can create and manage projects, view workspace members, but cannot modify workspace settings or billing.",
//     VIEWER: "Read-only access to all projects and workspace information. Cannot create or modify content."
//   };

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>You're invited to join ${workspaceName}</title>
//     </head>
//     <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1A1A1A; margin: 0; padding: 0;">
//       <div style="max-width: 560px; margin: 0 auto; padding: 40px 24px;">
//         <!-- Header -->
//         <div style="margin-bottom: 32px;">
//           <span style="font-size: 20px; font-weight: 700; color: #DC143C;">Drop APHI</span>
//         </div>

//         <!-- Main Content -->
//         <h1 style="font-size: 24px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px;">
//           You're invited to join ${workspaceName}
//         </h1>
        
//         <p style="color: #666666; margin-bottom: 24px;">
//           <strong style="color: #1A1A1A;">${inviterName}</strong> has invited you to join their workspace on Drop API.
//         </p>

//         <!-- Workspace Details -->
//         <div style="background-color: #F9F9F9; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
//           <h2 style="font-size: 16px; font-weight: 600; color: #1A1A1A; margin-top: 0; margin-bottom: 16px;">
//             Invitation Details
//           </h2>
          
//           <div style="margin-bottom: 12px;">
//             <span style="color: #666666; font-size: 14px; display: block;">Workspace</span>
//             <span style="color: #1A1A1A; font-weight: 500; font-size: 16px;">${workspaceName}</span>
//           </div>
          
//           <div style="margin-bottom: 12px;">
//             <span style="color: #666666; font-size: 14px; display: block;">Your Role</span>
//             <span style="color: #1A1A1A; font-weight: 500; font-size: 16px; text-transform: capitalize;">${role.toLowerCase()}</span>
//           </div>
          
//           <div style="margin-bottom: 12px;">
//             <span style="color: #666666; font-size: 14px; display: block;">Invited By</span>
//             <span style="color: #1A1A1A; font-weight: 500; font-size: 16px;">${inviterName}</span>
//             ${inviterEmail ? `<span style="color: #666666; font-size: 13px; display: block;">${inviterEmail}</span>` : ''}
//           </div>
//         </div>

//         <!-- Role Description -->
//         <div style="background-color: rgba(220, 20, 60, 0.05); border-left: 4px solid #DC143C; padding: 16px; margin-bottom: 24px;">
//           <h3 style="font-size: 14px; font-weight: 600; color: #DC143C; margin-top: 0; margin-bottom: 4px;">
//             ${role} Permissions
//           </h3>
//           <p style="color: #666666; font-size: 13px; margin: 0;">
//             ${roleDescriptions[role] || roleDescriptions.MEMBER}
//           </p>
//         </div>

//         <!-- CTA Button -->
//         <table style="margin-bottom: 24px;" width="100%">
//           <tr>
//             <td align="center">
//               <a href="${inviteUrl}" style="display: inline-block; background: #DC143C; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
//                 Accept Invitation
//               </a>
//             </td>
//           </tr>
//         </table>

//         <!-- Alternative Link -->
//         <p style="color: #666666; font-size: 13px; margin-bottom: 16px;">
//           If the button doesn't work, copy and paste this link into your browser:
//         </p>
//         <p style="background-color: #F5F5F5; padding: 12px; border-radius: 6px; font-size: 12px; color: #666666; word-break: break-all; margin-bottom: 24px;">
//           ${inviteUrl}
//         </p>

//         <!-- Expiry Notice -->
//         <p style="color: #999999; font-size: 12px; margin-bottom: 16px;">
//           This invitation will expire in <strong>${expiresIn}</strong>. If you don't have a Drop API account, you'll be able to create one when you accept.
//         </p>

//         <!-- Footer -->
//         <div style="border-top: 1px solid #E5E5E5; padding-top: 24px; margin-top: 24px;">
//           <p style="color: #999999; font-size: 12px; margin-bottom: 8px;">
//             If you weren't expecting this invitation, you can safely ignore this email.
//           </p>
//           <p style="color: #999999; font-size: 12px;">
//             &copy; ${new Date().getFullYear()} Drop APHI. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// }

// export function getInvitationEmailText(props: Omit<InvitationEmailProps, 'inviteeEmail' | 'inviterEmail'>): string {
//   const {
//     inviterName,
//     workspaceName,
//     role,
//     inviteUrl,
//     expiresIn
//   } = props;

//   return `
// You're invited to join ${workspaceName}

// ${inviterName} has invited you to join their workspace on Drop API.

// Invitation Details:
// - Workspace: ${workspaceName}
// - Your Role: ${role}
// - Invited By: ${inviterName}

// Role Permissions:
// ${role === 'ADMIN' ? '- Full access to workspace settings and billing\n- Manage team members\n- Create and delete projects' : ''}
// ${role === 'MEMBER' ? '- Create and manage projects\n- View workspace members\n- Cannot modify workspace settings' : ''}
// ${role === 'VIEWER' ? '- Read-only access to all projects\n- View workspace information\n- Cannot create or modify content' : ''}

// Accept your invitation here:
// ${inviteUrl}

// This invitation will expire in ${expiresIn}. If you don't have a Drop API account, you'll be able to create one when you accept.

// If you weren't expecting this invitation, you can safely ignore this email.

// © ${new Date().getFullYear()} Drop APHI. All rights reserved.
//   `;
// }