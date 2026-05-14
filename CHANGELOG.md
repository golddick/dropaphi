# Change Log

All notable changes to this project will be documented in this file.

## [2026-04-29]

### Added
- **Bulk Save Feature:** Added a "Save All Changes" button to the Admin Settings page, allowing admins to update pricing and rules for all services in a single request.

### Fixed
- **Admin Service Costs API:** Resolved a persistent `TypeError: Cannot convert undefined or null to object` in the POST route by implementing safer body parsing and removing problematic `Object.keys()` calls on potentially uninitialized data.
- **Bulk Update Support:** Refactored the `/api/admin/service-costs` POST handler to support both single-object and array-based payloads, enabling efficient bulk updates.
- **Type Safety:** Updated the Zod schema in the Admin API to allow decimals for `usageRate` (coerce to number instead of integer) to match the UI's capability.

## [2026-04-26]

### Added
- **Marketplace Billing Architecture:**
  - Implemented a decoupled "Marketplace" model for service top-ups, allowing Free and Paid users to purchase credits independently of their monthly plans.
  - Added `usageRate` and `minPurchase` fields to `ServiceCost` model in `schema.prisma` to allow fine-grained control over credit costs vs. consumption.
- **Admin System Settings:**
  - Revamped Admin Settings UI to manage global service pricing, credit usage rates, and minimum top-up requirements.
  - Connected Admin Settings to the live `ServiceCost` database via `/api/admin/service-costs`.
- **Dynamic Top-up Modal:**
  - Refactored User Top-up Modal to fetch live pricing and rules from the database.
  - Changed top-up flow from "Packages" to "Custom Units" based on unit costs set by Admin.

### Fixed
- **Admin Service Costs API:** Resolved a `TypeError` in the POST route when saving service configurations. Refactored the `upsert` logic to properly initialize default values and handle optional fields consistently, ensuring robust database operations even when some fields are omitted or null.
- **Admin UI Data Integrity:** Improved the Admin Settings page to ensure all numeric inputs (Cost, Usage Rate, Min Purchase) are explicitly cast to the correct types before being sent to the server. Added `onBlur` sanitization to provide a cleaner user experience while preventing invalid data states.
- **Prisma Integration:** Resolved `PrismaClientValidationError` in Admin Service Costs API by regenerating the Prisma Client to sync with the new schema fields (`usageRate`, `minPurchase`).
- **Admin UI Inputs:** Re-engineered the input logic in Admin Settings to fix an issue where users couldn't type or were locked out of numeric fields. Switched to a robust text-based input pattern with regex validation for immediate typing feedback and `onBlur` parsing for numeric consistency.
- **Service Enum Alignment:** 
    - Synchronized the Admin Settings UI and API with the `Services` enum in `schema.prisma`.
    - Added missing `API` service to the Enum.
    - Implemented a bidirectional mapping layer in the Pricing API to ensure dashboard compatibility while using type-safe uppercase Enums in the database.
- **Service Governance & Control:**
    - Implemented a global "On/Off" switch for all services (Email, SMS, OTP, etc.) in the Admin Settings.
    - Added `isActive` field to `ServiceCost` model to act as a master override for both Marketplace top-ups and Plan-based limits.
    - Synchronized the Admin Plans UI to provide real-time warnings when configuring services that are globally disabled.
    - Updated the Top-up Modal to block purchases and display maintenance messages for inactive services.

### Changed
- **Pricing API:** Updated `/api/pricing` to deliver unit costs, usage rates, and minimum purchase requirements.
- **Project Standards:** Standardized on `pnpm` for all package management operations.

## [2026-04-25]

### Added
- **Tiered Email Sender Verification:**
  - Implemented OTP-based email ownership verification (Standard for all users).
  - Implemented robust DNS verification (SPF, DKIM, DMARC) for domain authority (Standard for Paid tiers).
- **Database:**
  - Added `SenderOTP` model to `schema.prisma` for ephemeral verification codes.
- **API:**
  - `POST /api/workspace/[workspaceId]/email-senders/initiate-verify`: Triggers OTP email.
  - `POST /api/workspace/[workspaceId]/email-senders/verify-otp`: Validates code and marks sender as verified.
- **Utils:**
  - Refactored `dns-utils.ts` to support exact value matching and specific selectors (e.g., `dropaphi._domainkey`).

### Changed
- **DNS Verification:** Updated `verify-dns` route to use robust checks and return detailed validation results (found vs expected).
- **Email Service:** Enhanced `EmailSenderService` with OTP generation and verification logic.

## [2026-04-24]

### Added
- Created `CHANGELOG.md` to track project evolution.
- Created `functional-doc.md` for project documentation.

### Changed
- Refined `Plan` and `Wallet` models in `prisma/schema.prisma` to remove legacy AI-related fields (`aiTokenLimit`, `aiTokenCredits`).
- Updated `BillingService` to ensure synchronization between usage and limits.
- Improved Admin API handlers for plans and promo codes to handle flat amounts and bonus credits correctly.

### Removed
- Legacy AI-related fields (`aiTokenLimit`, `aiTokenCredits`, `currentAiTokensUsed`) from `Plan`, `Wallet`, `Workspace`, and `UsageLog` models.
- AI Assistant section and related "AI Token" UI elements from the Workspace Overview and Billing pages.

### Fixed
- Fixed ID generation in plan routes using `dropid`.
- Resolved type inconsistencies in `lib/stores/types.ts` and `lib/stores/subscription.ts`.
- Fixed dynamic plan loading and promo code application in the Billing Page.
- Corrected service mapping in `BillingService` and `UsageService` to ensure accurate usage tracking and credit deduction.
