/**
 * Default email templates for common use cases
 */
export const defaultTemplates = {
  welcome: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: white;
      font-size: 36px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to ${data.company || 'Our Platform'}!</h1>
    </div>
    <div class="content">
      <h2 style="color: #2d3748;">Hello ${data.name || 'there'}!</h2>
      <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
        We're excited to have you on board! Get started by exploring our features and setting up your account.
      </p>
      <div style="text-align: center;">
        <a href="${data.actionUrl || '#'}" class="button">Get Started</a>
      </div>
      <p style="color: #718096; font-size: 14px; margin-top: 30px;">
        If you have any questions, just reply to this email - we're always happy to help!
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${data.company || 'Our Platform'}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `,

  newsletter: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f4f7;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      background-color: #1a202c;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: white;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .article {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 1px solid #e9ecef;
    }
    .article h2 {
      color: #2d3748;
      margin-bottom: 10px;
    }
    .article p {
      color: #4a5568;
      line-height: 1.6;
    }
    .read-more {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
    }
    .unsubscribe {
      color: #a0aec0;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.title || 'Monthly Newsletter'}</h1>
    </div>
    <div class="content">
      <p style="color: #4a5568; margin-bottom: 30px;">Hello ${data.name || 'Subscriber'},</p>
      ${data.articles ? data.articles.map((article: any) => `
        <div class="article">
          <h2>${article.title}</h2>
          <p>${article.excerpt}</p>
          <a href="${article.url}" class="read-more">Read more →</a>
        </div>
      `).join('') : `
        <div class="article">
          <h2>${data.articleTitle || 'Latest Updates'}</h2>
          <p>${data.articleContent || 'Check out our latest features and updates.'}</p>
        </div>
      `}
    </div>
    <div class="footer">
      <p style="color: #718096;">${data.footerText || 'Stay connected with us!'}</p>
      <p class="unsubscribe">
        <a href="${data.unsubscribeUrl || '#'}" style="color: #a0aec0;">Unsubscribe</a> • 
        <a href="${data.privacyUrl || '#'}" style="color: #a0aec0;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
  `,

  marketing: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
    }
    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 60px 30px;
      text-align: center;
    }
    .hero h1 {
      margin: 0;
      color: white;
      font-size: 42px;
      font-weight: 800;
    }
    .hero p {
      color: rgba(255,255,255,0.9);
      font-size: 18px;
      margin-top: 15px;
    }
    .content {
      padding: 40px 30px;
    }
    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 30px 0;
    }
    .feature {
      flex: 1 1 200px;
      text-align: center;
      padding: 20px;
    }
    .feature-icon {
      font-size: 40px;
      margin-bottom: 15px;
    }
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 40px;
      font-weight: 700;
      font-size: 18px;
      margin: 20px 0;
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>${data.headline || 'Special Offer!'}</h1>
      <p>${data.subheadline || 'Limited time only'}</p>
    </div>
    <div class="content">
      <p style="color: #4a5568; font-size: 18px; line-height: 1.6; text-align: center;">
        ${data.message || 'Check out our latest products and exclusive offers.'}
      </p>
      
      <div class="features">
        ${data.features ? data.features.map((feature: any) => `
          <div class="feature">
            <div class="feature-icon">${feature.icon || '✨'}</div>
            <h3>${feature.title}</h3>
            <p style="color: #718096;">${feature.description}</p>
          </div>
        `).join('') : ''}
      </div>

      <div style="text-align: center;">
        <a href="${data.ctaUrl || '#'}" class="cta-button">
          ${data.ctaText || 'Shop Now'} →
        </a>
      </div>

      <p style="color: #a0aec0; font-size: 14px; text-align: center; margin-top: 30px;">
        Offer expires ${data.expiryDate || 'soon'}. Terms apply.
      </p>
    </div>
    <div class="footer">
      <p style="color: #718096;">${data.company || 'Our Store'}</p>
      <p style="color: #a0aec0; font-size: 12px;">
        <a href="${data.unsubscribeUrl || '#'}" style="color: #a0aec0;">Unsubscribe</a> • 
        <a href="${data.storeUrl || '#'}" style="color: #a0aec0;">Visit Store</a>
      </p>
    </div>
  </div>
</body>
</html>
  `,

  notification: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f4f7;
    }
    .container {
      max-width: 500px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background-color: ${data.type === 'success' ? '#48bb78' : data.type === 'warning' ? '#ed8936' : '#4299e1'};
      padding: 20px;
      text-align: center;
    }
    .header h2 {
      margin: 0;
      color: white;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 20px;
    }
    .message {
      color: #2d3748;
      font-size: 16px;
      line-height: 1.6;
      margin: 20px 0;
    }
    .action-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${data.type === 'success' ? '#48bb78' : data.type === 'warning' ? '#ed8936' : '#4299e1'};
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 10px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #718096;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${data.title || 'Notification'}</h2>
    </div>
    <div class="content">
      <div class="icon">${data.icon || '🔔'}</div>
      <div class="message">
        ${data.message || 'You have a new notification.'}
      </div>
      ${data.actionUrl ? `
        <div style="text-align: center;">
          <a href="${data.actionUrl}" class="action-button">
            ${data.actionText || 'View Details'}
          </a>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>${data.footer || 'Thank you for using our service!'}</p>
    </div>
  </div>
</body>
</html>
  `,
};

/**
 * Process template with variables
 */
export function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, value);
  });
  
  return processed;
}

/**
 * Generate plain text from HTML
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();
}