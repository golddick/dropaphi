# Deployment & SDK Publishing Guide

This guide explains how to push the Dropaphi platform to production and how to make the SDKs available for installation.

---

## 1. Deploying the Platform (Next.js)

The platform is built with Next.js and optimized for **Vercel**.

### Prerequisites
- A Vercel account.
- A Supabase project (for database and storage).
- SMTP credentials (for sending emails/OTPs).

### Steps
1. **Push to GitHub**: Ensure all your changes are committed and pushed to your repository.
2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com) and click "Add New" -> "Project".
   - Import your `dropaphi` repository.
3. **Configure Environment Variables**:
   Add the following variables in the Vercel dashboard:
   - `DATABASE_URL`: Your Prisma database connection string.
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: For file storage.
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: For email delivery.
   - `NEXTAUTH_SECRET`: For dashboard authentication.
4. **Deploy**: Click "Deploy". Your platform will be live at `https://dropaphi.xyz` (or your assigned Vercel URL).

---

## 2. Publishing the SDKs

To make the SDKs installable via `npm install`, you need to build and publish them.

### @dropaphi/node (Backend SDK)
1. **Navigate to the SDK folder**:
   ```bash
   cd sdk/node
   ```
2. **Setup package.json**: (Ensure it has a build script using `tsup` or `tsc`).
3. **Build**:
   ```bash
   pnpm install
   pnpm run build
   ```
4. **Publish**:
   ```bash
   pnpm login
   pnpm publish --access public
   ```

### @dropaphi/react (Frontend Components)
1. **Navigate to the SDK folder**:
   ```bash
   cd sdk/react
   ```
2. **Build**:
   ```bash
   npm install
   npm run build
   ```
3. **Publish**:
   ```bash
   npm publish --access public
   ```

---

## 3. How Users Install the SDK

Once published, your users can integrate Dropaphi into their projects easily:

### Node.js Integration
```bash
npm install @dropaphi/node
```
```javascript
import { Dropaphi } from '@dropaphi/node';
const dropaphi = new Dropaphi('da_live_your_key');
```

### React Integration
```bash
npm install @dropaphi/react
```
```javascript
import { NewsletterForm } from '@dropaphi/react';

function App() {
  return (
    <NewsletterForm 
      apiKey="da_live_xxx" 
      className="my-custom-style"
    />
  );
}
```

---

## 4. Verification

After deployment:
1. **API Check**: Visit `https://dropaphi.xyz/api/v1/health` (if implemented) or try a `POST` to `/api/v1/email/send` via cURL.
2. **SDK Check**: Create a small test project, run `npm install` of your local SDK folder, and verify the methods work against the production URL.
3. **CORS Check**: Ensure your frontend can call the API without CORS errors (already handled in `lib/cors.ts`).
