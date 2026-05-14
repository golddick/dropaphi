# DropAphi v1 - API Reference

DropAphi provides a suite of tools for Email delivery, OTP (One-Time Password) management, and File storage.

## 🛡️ Authentication

All API requests must include your API key in the `X-API-Key` header.

| Header | Description |
| :--- | :--- |
| `X-API-Key` | Your secret API key (starts with `da_live_` or `da_test_`) |

**Example:**
```bash
curl -H "X-API-Key: da_live_your_key" https://api.dropaphi.com/v1/...
```

---

## 📧 Email API

### Send Email
`POST /v1/email/send`

Send a transactional or marketing email.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Hello World",
  "html": "<h1>Welcome</h1><p>Glad to have you.</p>",
  "text": "Welcome! Glad to have you.",
  "fromName": "Your Brand",
  "template": "welcome",
  "templateData": {
    "name": "John Doe"
  }
}
```

- `to`: Recipient email (string or array).
- `template`: Optional. Choose from `welcome`, `newsletter`, `marketing`, `notification`.
- `attachments`: Optional array of `{ filename: string, content: string (base64) }`.

### Get Templates
`GET /v1/email/templates`

List available pre-built templates and their required variables.

### Get Email Status
`GET /v1/email/[id]`

Retrieve delivery and tracking status (opens/clicks) for a specific email.

---

## 📰 Newsletter API

### Subscribe
`POST /v1/newsletter/subscribe`

Subscribe a new user to your newsletter and trigger a welcome email.

**Request Body:**
```json
{
  "email": "subscriber@example.com",
  "name": "Jane Doe",
  "source": "landing_page",
  "templateId": "tmpl_123456"
}
```

- `email`: Required. Subscriber's email address.
- `name`: Optional. Subscriber's name.
- `source`: Optional. Where the subscription originated (e.g., "header", "footer").
- `templateId`: Optional. ID of a custom template created in the Email Builder to use as the welcome email. If not provided, the workspace's default welcome template is used.

---

## 🎨 Email Builder

Design responsive emails without coding. See the [Email Builder Documentation](/docs/email-builder) for details on how to use the visual editor, variables, and how to integrate saved templates with your API calls.

---

## 🔑 OTP API (One-Time Password)

### Send OTP
`POST /v1/otp/send`

Generate and send a numeric verification code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "brandName": "DropAphi",
  "length": 6,
  "expiry": 10
}
```

- `length`: Code length (4-8 digits). Default: 6.
- `expiry`: Validity in minutes. Default: 10.
- **Security**: 60-second cooldown between sends to the same email.

### Verify OTP
`POST /v1/otp/verify`

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Resend OTP
`POST /v1/otp/resend`

Resend the code if not received. Resets the expiry and attempts.

---

## 📁 Files API

### Upload File
`POST /v1/files/upload`

Upload a file (Multipart Form Data).

**Form Fields:**
- `file`: The binary file.
- `metadata`: Optional JSON string (e.g., `{"visibility": "PUBLIC", "folder": "invoices"}`).

**Limits:**
- Maximum file size: 10MB.
- Allowed types: Images, PDF, Text, Zip.

### List Files
`GET /v1/files`

**Query Parameters:**
- `page`: Page number (default: 1).
- `limit`: Results per page (default: 50).
- `folder`: Filter by folder metadata.

### Get File Details
`GET /v1/files/[fileId]`

Returns file metadata and access URLs. Private files require the `X-API-Key`.

---

## 🚦 Rate Limits & Quotas

- **OTP**: 60-second cooldown per recipient.
- **Storage**: Workspace-specific limits apply (viewable in dashboard).
- **Email**: Daily/Monthly limits based on your subscription tier.

## 🤖 Agent Instructions (for AI)

When using this API:
1. **Always** include the `X-API-Key`.
2. **Handle 429** responses by waiting the suggested time in the `details.nextAttemptIn` field.
3. **Prefer HTML** for emails unless requested otherwise.
4. **Visibility**: Use `PRIVATE` for sensitive documents in the Files API.
