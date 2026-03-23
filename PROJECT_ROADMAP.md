# FINDERS KEEPERS MONETIZATION ROADMAP
## Senior Developer Execution Plan | 16 Years Experience Methodology

---

## DEVELOPMENT PHILOSOPHY
- **Deep Work Blocks**: 90-min focused sessions, no context switching
- **Atomic Commits**: Each commit represents a single, complete feature
- **Test-Driven**: Unit tests before implementation
- **Documentation First**: Specs written before code
- **Code Review Ready**: All code follows project patterns, typed, linted

---

## PHASE STRUCTURE
Each phase: Plan → Design → Implement → Test → Deploy → Review

---

# PHASE 1: FOUNDATION & REWARD SYSTEM
**Goal**: Establish economic layer without breaking existing community trust
**Timeline**: 3-4 weeks
**Priority**: CRITICAL

## 1.1 Database Schema Updates
- [ ] Create `escrow_transactions` table
  - transaction_id (UUID, PK)
  - incident_id (FK → incidents)
  - owner_id (FK → profiles)
  - finder_id (FK → profiles, nullable)
  - amount (DECIMAL, 10,2)
  - platform_fee (DECIMAL, 10,2)
  - net_amount (DECIMAL, 10,2)
  - status: 'pending' | 'held' | 'released' | 'refunded' | 'disputed'
  - payment_method: 'stripe' | 'paypal'
  - stripe_payment_intent_id (VARCHAR)
  - created_at, updated_at, resolved_at (TIMESTAMPTZ)
  - refund_reason (TEXT, nullable)
  - dispute_notes (TEXT, nullable)
  
- [ ] Create `reward_preferences` table
  - preference_id (UUID, PK)
  - incident_id (FK → incidents)
  - reward_enabled (BOOLEAN, default false)
  - reward_amount (DECIMAL, 10,2, nullable)
  - min_claimer_rating (INTEGER, default 0)
  - anonymous_reward (BOOLEAN, default false)
  - priority_boost_hours (INTEGER, default 0)

- [ ] Create `matching_priorities` table  
  - priority_id (UUID, PK)
  - incident_id (FK → incidents)
  - priority_score (INTEGER, computed)
  - has_reward (BOOLEAN)
  - reward_amount (DECIMAL)
  - expires_at (TIMESTAMPTZ)
  - boost_purchased (BOOLEAN)

- [ ] Update `incidents` table
  - Add column: `reward_enabled` (BOOLEAN, default false)
  - Add column: `reward_amount` (DECIMAL, 10,2)
  - Add column: `escrow_transaction_id` (UUID, FK)
  - Add column: `priority_score` (INTEGER, default 0)
  - Add column: `visibility_boost_expires_at` (TIMESTAMPTZ)

## 1.2 Payment Integration (Stripe)
- [ ] Setup Stripe Connect for platform payments
  - Create Stripe account
  - Configure Connect onboarding for finders
  - Setup webhook handlers for payment events
  - Implement `src/lib/stripe.ts` client
  
- [ ] Create payment API routes
  - POST `/api/payment/create-intent` - Create payment intent for reward
  - POST `/api/payment/capture` - Capture held funds
  - POST `/api/payment/refund` - Process refund
  - POST `/api/payment/dispute` - Handle disputes
  - GET `/api/payment/status/:transactionId` - Check transaction status

- [ ] Create payout system for finders
  - POST `/api/payout/connect-account` - Create Connected account
  - POST `/api/payout/transfer` - Transfer to finder
  - GET `/api/payout/balance` - Check pending balance

## 1.3 Escrow System Implementation
- [ ] Create `src/lib/escrow.ts` module
  - `holdReward()` - Create and hold payment
  - `releaseToFinder()` - Release to finder minus fee
  - `refundToOwner()` - Full refund to owner
  - `getEscrowStatus()` - Current status check
  
- [ ] Create escrow service layer
  - Transaction state machine implementation
  - Fee calculation (10% platform, configurable)
  - Auto-refund after 30 days if no claim
  - Dispute resolution workflow

- [ ] Add escrow UI components
  - `<EscrowStatusBadge />` - Show transaction status
  - `<RewardDepositModal />` - Owner deposit flow
  - `<ReleaseConfirmationModal />` - Owner confirms receipt
  - `<DisputeForm />` - Raise dispute interface

## 1.4 Priority Matching Algorithm
- [ ] Update matching engine
  - Modify `src/lib/matchingAlgorithm.ts`
  - Add reward_weight to scoring (0.3 factor)
  - Priority boost = base_score + (reward_amount * 0.1) + boost_hours
  - Sort results by priority_score DESC
  
- [ ] Create priority indicators
  - Gold/Silver/Bronze badge system based on reward amount
  - "Priority Listing" tag in item cards
  - Boosted items appear first in browse

## 1.5 Security & Compliance
- [ ] Implement fraud detection
  - Rate limiting on reward claims
  - Duplicate detection algorithm
  - Suspicious pattern alerts
  
- [ ] Compliance requirements
  - KYC for rewards over $100
  - Tax reporting integration (1099 for US)
  - Transaction logging for audit

## PHASE 1 COMPLETION CHECKLIST
- [ ] All database migrations applied
- [ ] Stripe test payments working end-to-end
- [ ] Escrow flows tested (deposit, release, refund)
- [ ] Priority matching sorting verified
- [ ] Unit tests > 80% coverage
- [ ] Integration tests for payment flows
- [ ] Documentation updated

---

# PHASE 2: PREMIUM TIERS & FREEMIUM
**Goal**: Convert free users to paid subscribers
**Timeline**: 2-3 weeks  
**Depends On**: Phase 1

## 2.1 Subscription Schema
- [ ] Create `subscriptions` table
  - subscription_id (UUID, PK)
  - user_id (FK → profiles)
  - tier: 'free' | 'basic' | 'business'
  - stripe_subscription_id (VARCHAR)
  - current_period_start, current_period_end (TIMESTAMPTZ)
  - status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  - cancel_at_period_end (BOOLEAN)
  
- [ ] Create `subscription_features` table
  - feature_id (UUID, PK)
  - tier (VARCHAR)
  - feature_name (VARCHAR)
  - feature_limit (INTEGER)
  - description (TEXT)

## 2.2 Feature Gates
- [ ] Create `src/lib/subscription.ts` service
  - `canAccessFeature(userId, featureName)` - Check access
  - `getUserTier(userId)` - Get current tier
  - `getFeatureLimit(userId, featureName)` - Get limits
  - `incrementUsage(userId, featureName)` - Track usage

- [ ] Define tier features

| Feature | Free | Basic ($4.99) | Business ($9.99) |
|---------|------|---------------|------------------|
| Active Items | 3 | Unlimited | Unlimited |
| Storage Days | 30 | 90 | 365 |
| Priority Boosts/mo | 0 | 3 | 10 |
| Message History | 7 days | 90 days | Unlimited |
| Photo Uploads/item | 3 | 10 | Unlimited |
| Analytics Dashboard | No | Basic | Advanced |
| Custom Branding | No | No | Yes |
| API Access | No | No | Yes |

## 2.3 Subscription UI
- [ ] Create pricing page
  - `/pricing` - Compare tiers
  - Feature comparison table
  - FAQ section
  - CTA buttons with Stripe checkout

- [ ] Create upgrade modal
  - `<UpgradeModal />` - Triggered on feature limit
  - Highlight what user is missing
  - One-click upgrade flow

- [ ] Create billing dashboard
  - `/profile/billing` - Manage subscription
  - Payment methods management
  - Invoice history
  - Cancel/pause subscription

## 2.4 Feature Implementations
- [ ] Storage extension system
  - Background job to soft-delete expired items
  - Grace period notifications (7, 3, 1 days before)
  - Archive instead of delete for paid tiers

- [ ] Priority boost system
  - `POST /api/boost/purchase` - Buy boost
  - 24-hour visibility boost
  - "Sponsored" badge on boosted items
  - Usage tracking per user

- [ ] Analytics dashboard
  - Views per item
  - Match rate
  - Response time
  - Success rate
  - Export to CSV

## PHASE 2 COMPLETION CHECKLIST
- [ ] Subscription tiers functional
- [ ] Feature gates working
- [ ] Stripe billing integration complete
- [ ] Upgrade flows tested
- [ ] Billing dashboard functional
- [ ] Analytics dashboard deployed

---

# PHASE 3: INSURANCE PARTNERSHIP API
**Goal**: B2B2C integration with insurance providers
**Timeline**: 3-4 weeks
**Depends On**: Phase 1

## 3.1 Insurance Provider Schema
- [ ] Create `insurance_partners` table
  - partner_id (UUID, PK)
  - name (VARCHAR)
  - api_key_hash (VARCHAR)
  - webhook_url (VARCHAR)
  - commission_rate (DECIMAL, 3,2)
  - active (BOOLEAN)
  - created_at, updated_at

- [ ] Create `insurance_claims` table
  - claim_id (UUID, PK)
  - partner_id (FK)
  - incident_id (FK, nullable)
  - policy_number (VARCHAR)
  - claim_status: 'open' | 'verified' | 'rejected' | 'closed'
  - claimed_amount (DECIMAL)
  - platform_recovered (BOOLEAN)
  - recovery_value (DECIMAL)
  - platform_commission (DECIMAL)

## 3.2 Partner API (B2B)
- [ ] Create partner authentication
  - API key + secret authentication
  - Rate limiting per partner
  - IP whitelist option
  
- [ ] Create partner endpoints
  - POST `/api/v1/partner/report-lost` - Report lost item
  - GET `/api/v1/partner/status/:claimId` - Check claim status
  - POST `/api/v1/partner/verify-recovery` - Confirm we found item
  - GET `/api/v1/partner/analytics` - Partner dashboard data

- [ ] Webhook system
  - Partner notification on item found
  - Recovery status updates
  - Daily/weekly digests

## 3.3 Claim Verification Flow
- [ ] Create verification workflow
  - Item found → Insurance notified
  - Verification photos shared
  - Police report upload option
  - Claim status sync to partner

- [ ] Commission tracking
  - 15-20% of claim value as platform fee
  - Monthly commission reports
  - Automated invoicing

## PHASE 3 COMPLETION CHECKLIST
- [ ] Partner API documented
- [ ] Authentication tested
- [ ] Webhooks delivering
- [ ] Sample partner integration working
- [ ] Commission tracking accurate

---

# PHASE 4: LOCAL BUSINESS NETWORK
**Goal**: Monetize through local business partnerships
**Timeline**: 2-3 weeks
**Depends On**: Phase 1

## 4.1 Business Schema
- [ ] Create `business_accounts` table
  - business_id (UUID, PK)
  - name, address, phone, email
  - lat, lng (GEO coordinates)
  - category: 'locksmith' | 'pet_store' | 'repair' | 'cafe' | 'other'
  - verification_status: 'pending' | 'verified' | 'rejected'
  - subscription_tier: 'free' | 'featured' | 'premium'
  - subscription_expires_at

- [ ] Create `business_ads` table
  - ad_id (UUID, PK)
  - business_id (FK)
  - ad_type: 'banner' | 'sponsored_exchange' | 'category_feature'
  - content (JSON)
  - geo_radius_miles (INTEGER)
  - budget (DECIMAL)
  - clicks, impressions
  - active, start_date, end_date

## 4.2 Business Dashboard
- [ ] Create business portal
  - `/business` - Business login
  - `/business/dashboard` - Analytics
  - `/business/ads` - Manage ads
  - `/business/exchange-points` - Manage exchange locations

## 4.3 Geo-Targeted Ads
- [ ] Ad serving system
  - Contextual ads based on item category
  - Geo-fencing (show ads within X miles)
  - Lost keys → Locksmith ads
  - Lost pet → Pet store/vet ads
  - Lost phone → Repair shop ads

- [ ] Exchange point feature
  - Businesses can be "safe exchange points"
  - Verified location badge
  - QR code check-in system
  - Commission per successful exchange

## PHASE 4 COMPLETION CHECKLIST
- [ ] Business signup flow
- [ ] Ad serving algorithm
- [ ] Exchange point system
- [ ] Business dashboard functional
- [ ] Commission tracking

---

# PHASE 5: B2B WHITE-LABEL PLATFORM
**Goal**: License platform to enterprises
**Timeline**: 4-6 weeks
**Depends On**: Phase 2, 3, 4

## 5.1 Multi-Tenant Architecture
- [ ] Create `tenants` table
  - tenant_id (UUID, PK)
  - name, slug (unique subdomain)
  - custom_domain (VARCHAR, nullable)
  - tier: 'startup' | 'growth' | 'enterprise'
  - branding (JSON): colors, logo, favicon
  - features_enabled (JSON)
  - max_users, max_items
  - billing_info

- [ ] Tenant isolation
  - Row-level security by tenant_id
  - Separate storage buckets per tenant
  - Tenant-aware queries

## 5.2 White-Label Customization
- [ ] Dynamic theming system
  - CSS custom properties injection
  - Logo upload and CDN serving
  - Custom favicon
  - Font selection
  
- [ ] Feature toggles per tenant
  - Enable/disable: rewards, messaging, maps, etc.
  - Custom workflows per tenant
  - API access levels

## 5.3 Enterprise Admin
- [ ] Super admin dashboard
  - `/admin/tenants` - Manage all tenants
  - Usage analytics across tenants
  - Billing aggregation
  - Feature flag management

- [ ] Tenant admin
  - User management
  - Moderation tools
  - Custom integrations
  - Export all data

## 5.4 Pricing Tiers
- [ ] Enterprise pricing
  - Startup: $99/mo (up to 500 users)
  - Growth: $299/mo (up to 5,000 users)
  - Enterprise: $999/mo (unlimited, custom)

## PHASE 5 COMPLETION CHECKLIST
- [ ] Multi-tenant isolation complete
- [ ] Theming system functional
- [ ] Tenant onboarding flow
- [ ] Admin dashboards deployed
- [ ] Sample white-label tenant live

---

# CURRENT WORK LOG
**Last Updated**: 2026-03-10
**Current Phase**: Phase 1
**Current Task**: Database Schema Updates - escrow_transactions table
**Deep Work Session**: Not started

## Today's Session
- [ ] Created PROJECT_ROADMAP.md
- [ ] Next: Begin Phase 1.1 - Database migrations

## Blockers
- None

## Notes
- Keep original "community-first" messaging even with monetization
- Free tier must remain genuinely useful
- All paid features should have clear value demonstration

---

# TECHNICAL DEBT TRACKING
- [ ] Consolidate Zustand stores (performance)
- [ ] Add React Query for server state
- [ ] Implement proper error boundaries
- [ ] Add E2E tests with Playwright
- [ ] Performance audit (Core Web Vitals)
- [ ] Accessibility audit (WCAG 2.1 AA)

---

# CODING STANDARDS
1. **TypeScript**: Strict mode, no `any` types
2. **Components**: Functional, typed props, named exports
3. **State**: Zustand for client, React Query for server
4. **API**: RESTful, typed responses, consistent error format
5. **Tests**: Jest + React Testing Library, 80%+ coverage
6. **Commits**: Conventional commits, atomic changes

---

*This is a living document. Update after every deep work session.*
