# Functional Documentation - DropAPHI

## Overview
DropAPHI is a comprehensive API platform for messaging (Email, SMS, WhatsApp) and workspace management. It provides a robust billing engine, admin controls, and a developer-friendly dashboard.

## Core Features

### 1. Workspace Management
- **Dashboard**: Overview of credits, plan information, and top services by spend.
- **API Keys**: Create and manage keys with per-service permissions and credit caps.
- **Usage Logs**: Filterable logs for all services (Email, SMS, etc.) with 7-day metadata retention.
- **Domain Verification**: Add and verify sending domains using SPF, DKIM, and DMARC.

### 2. Billing & Credits
- **Tiered Credit System**:
    - **Monthly Bundle**: Included in the workspace's plan.
    - **Top-up Balance**: Purchased credits for overage or extra usage.
- **Credit Hierarchy**: Usage first deducts from the Monthly Bundle, then from the Top-up Wallet.
- **Grace Mode**: If credits hit zero, requests can be queued for up to 24 hours if enabled.
- **Auto Top-up**: Automatically trigger payments when balance falls below a threshold.
- **Rollover**: Paid plans support credit rollover to the next month.

### 3. Admin Controls
- **Plan Management**: Create, edit, and archive plans with detailed limits and feature flags.
- **Promo Codes**: Manage discounts (Percentage, Flat Amount) and Credit Bonuses.
- **Service Costs**: Configure real-time credit costs for all services without code changes.
- **Workspace Oversight**: Monitor balances, usage history, and manually adjust credits with audit logging.

### 4. Messaging Services
- **Email API**: Send transactional and campaign emails.
- **OTP Services**: specialized endpoints for Email, SMS, and WhatsApp OTPs.
- **Storage**: Manage file storage with overage pricing.

## Technical Architecture

### Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Lucide Icons.
- **Backend**: Next.js API Routes.
- **Database**: PostgreSQL with Prisma ORM.
- **State Management**: Zustand (for frontend stores).
- **Automation**: Cron jobs for monthly resets and log purging.

### Billing Synchronization Logic
The `BillingService` ensures that every request is validated against the current workspace balance and plan limits. It performs atomic updates to the `Wallet` and `Workspace` models to maintain data integrity.

### Data Retention
- Usage metadata is purged after 7 days to optimize storage while maintaining historical records for billing purposes.
