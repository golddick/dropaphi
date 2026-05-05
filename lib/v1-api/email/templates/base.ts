/**
 * Common Styles for v1 Email Templates
 * Simple White, Black, and a touch of Red. No gradients.
 */
export const templateStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #ffffff;
    color: #1a1a1a;
  }
  .container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
  }
  .header {
    padding-bottom: 20px;
    border-bottom: 2px solid #dc143c;
    margin-bottom: 30px;
  }
  .logo {
    font-size: 24px;
    font-weight: bold;
    color: #dc143c;
    text-decoration: none;
  }
  .content {
    line-height: 1.6;
    font-size: 16px;
    color: #1a1a1a;
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background-color: #dc143c;
    color: #ffffff !important;
    text-decoration: none;
    border-radius: 4px;
    font-weight: 600;
    margin: 20px 0;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e5e5;
    font-size: 12px;
    color: #666666;
    text-align: center;
  }
`;

export const layout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${templateStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">DropAPHI</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} DropAPHI. All rights reserved.</p>
      <p>This is an automated message, please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;
