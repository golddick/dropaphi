# DropAphi v1 - API Reference

DropAphi provides a suite of tools for Email delivery, OTP (One-Time Password) management, and File storage.

## 🛡️ Authentication

All API requests must include your API key in the `DROP-API-Key` header.

| Header | Description |
| :--- | :--- |
| `DROP-API-Key` | Your secret API key (starts with `da_live_` or `da_test_`) |

**Example:**
```bash
curl -H "DROP-API-Key: da_live_your_key" https://api.dropaphi.com/v1/...
```

---

## � Blog API

### List published blog posts
`GET /v1/blog`

Fetch published posts for the workspace associated with your API key.

**Query parameters:**
- `page` (number, default `1`)
- `limit` (number, default `10`, max `50`)
- `tag` (string, optional)
- `isFeatured` (boolean, optional)
- `search` (string, optional)

**Successful response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post_123",
        "title": "Why communication matters",
        "slug": "why-communication-matters",
        "excerpt": "A short summary",
        "publishedAt": "2026-08-01T00:00:00.000Z",
        "author": { "fullName": "Jane Doe", "avatarUrl": "https://..." },
        "workspace": { "name": "Acme", "slug": "acme" }
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
  }
}
```

### Get blog post by slug
`GET /v1/blog/{slug}`

Get a single published blog post by its slug.

**Successful response:**
```json
{
  "success": true,
  "data": {
    "id": "post_123",
    "title": "Why communication matters",
    "slug": "why-communication-matters",
    "content": "<p>Full blog content</p>",
    "excerpt": "A short summary",
    "publishedAt": "2026-08-01T00:00:00.000Z",
    "author": { "fullName": "Jane Doe", "avatarUrl": "https://...", "bio": "Writer" },
    "workspace": { "name": "Acme", "slug": "acme", "logoUrl": "https://..." }
  }
}
```

---

## �📧 Email API

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
- `template`: Optional. Choose from `welcome`, `newsletter`, `marketing`, `notification`, `invite`, `otp`.
- `attachments`: Optional array of `{ filename: string, content: string (base64) }`.

### Get Templates
`GET /v1/email/templates`

List available pre-built templates and their required variables.

### Default Templates
The following built-in templates are available by default:
- `welcome`
- `newsletter`
- `marketing`
- `notification`
- `invite`
- `otp`

Use the `template` field on `POST /v1/email/send` to send one of these default templates.

**Example:**
```json
{
  "to": "recipient@example.com",
  "subject": "You're invited",
  "template": "invite",
  "templateData": {
    "name": "Jane",
    "workspaceName": "Acme Team",
    "inviterName": "Alice",
    "acceptUrl": "https://dropaphi.com/invite/abc123",
    "role": "DEVELOPER",
    "expiresIn": "48 hours"
  }
}
```

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
- `file`: The binary file field.
- `metadata`: Optional JSON string (e.g., `{"visibility": "PUBLIC", "folder": "invoices"}`).

**Limits:**
- Maximum file size: 100MB for non-video files.
- Maximum video size: 2MB per video file.
- Allowed types: Images, video files, documents, archives, and text formats.
- Use multipart/form-data with a valid boundary.

### List Files
`GET /v1/files`

**Query Parameters:**
- `page`: Page number (default: 1).
- `limit`: Results per page (default: 50).
- `folder`: Filter by folder metadata.

### Get File Details
`GET /v1/files/[fileId]`

Returns file metadata and access URLs. Private files require the `DROP-API-Key`.

---

## 🚦 Rate Limits & Quotas

- **OTP**: 60-second cooldown per recipient.
- **Storage**: Workspace-specific limits apply (viewable in dashboard).
- **Email**: Daily/Monthly limits based on your subscription tier.

## 🤖 Agent Instructions (for AI)

When using this API:
1. **Always** include the `DROP-API-Key`.
2. **Handle 429** responses by waiting the suggested time in the `details.nextAttemptIn` field.
3. **Prefer HTML** for emails unless requested otherwise.
4. **Visibility**: Use `PRIVATE` for sensitive documents in the Files API.
