import { layout } from "./base";

export const welcome = (data: any) => layout(`
  <h2 style="color: #1a1a1a;">Welcome to ${data.company || 'DropAPHI'}!</h2>
  <p>Hello ${data.name || 'there'},</p>
  <p>We're excited to have you on board! Get started by exploring our features and setting up your account.</p>
  <div style="text-align: center;">
    <a href="${data.actionUrl || '#'}" class="button">Get Started</a>
  </div>
  <p>If you have any questions, just reply to this email - we're always happy to help!</p>
`);

export const newsletter = (data: any) => layout(`
  <h2 style="color: #1a1a1a;">${data.title || 'Monthly Newsletter'}</h2>
  <p>Hello ${data.name || 'Subscriber'},</p>
  ${data.articles ? data.articles.map((article: any) => `
    <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;">
      <h3 style="color: #dc143c; margin-bottom: 10px;">${article.title}</h3>
      <p>${article.excerpt}</p>
      <a href="${article.url}" style="color: #dc143c; text-decoration: none; font-weight: bold;">Read more →</a>
    </div>
  `).join('') : `
    <div style="margin-bottom: 30px;">
      <h3 style="color: #dc143c;">${data.articleTitle || 'Latest Updates'}</h3>
      <p>${data.articleContent || 'Check out our latest features and updates.'}</p>
    </div>
  `}
  <p style="font-size: 14px; color: #666;">
    <a href="${data.unsubscribeUrl || '#'}" style="color: #666;">Unsubscribe</a> • 
    <a href="${data.privacyUrl || '#'}" style="color: #666;">Privacy Policy</a>
  </p>
`);

export const marketing = (data: any) => layout(`
  <h2 style="color: #dc143c; font-size: 28px;">${data.headline || 'Special Offer!'}</h2>
  <p style="font-size: 18px;">${data.subheadline || 'Limited time only'}</p>
  <p>${data.message || 'Check out our latest products and exclusive offers.'}</p>
  
  ${data.features ? `
    <div style="margin: 30px 0;">
      ${data.features.map((feature: any) => `
        <div style="margin-bottom: 15px;">
          <strong style="color: #dc143c;">• ${feature.title}</strong>: ${feature.description}
        </div>
      `).join('')}
    </div>
  ` : ''}

  <div style="text-align: center;">
    <a href="${data.ctaUrl || '#'}" class="button">${data.ctaText || 'Shop Now'} →</a>
  </div>
  <p style="font-size: 12px; color: #999; text-align: center;">
    Offer expires ${data.expiryDate || 'soon'}. Terms apply.
  </p>
`);

export const notification = (data: any) => layout(`
  <h2 style="color: ${data.type === 'error' ? '#dc143c' : '#1a1a1a'}; border-left: 4px solid #dc143c; padding-left: 15px;">
    ${data.title || 'Notification'}
  </h2>
  <p>${data.message || 'You have a new notification.'}</p>
  ${data.actionUrl ? `
    <div style="text-align: center;">
      <a href="${data.actionUrl}" class="button">${data.actionText || 'View Details'}</a>
    </div>
  ` : ''}
`);

export const otp = (data: any) => layout(`
  <h2 style="color: #1a1a1a;">Verification Code</h2>
  <p>Your verification code for <strong>${data.brandName || 'DropAPHI'}</strong> is:</p>
  <div style="background-color: #f9f9f9; border: 1px dashed #dc143c; padding: 20px; text-align: center; margin: 30px 0;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc143c;">${data.code}</span>
  </div>
  <p style="font-size: 14px; color: #666;">
    This code will expire in ${data.expiry || '10'} minutes. If you didn't request this code, please ignore this email.
  </p>
`);
