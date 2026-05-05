import * as v1Templates from "./templates";

/**
 * Default email templates for common use cases
 */
export const defaultTemplates = {
  welcome: v1Templates.welcome,
  newsletter: v1Templates.newsletter,
  marketing: v1Templates.marketing,
  notification: v1Templates.notification,
  otp: v1Templates.otp,
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