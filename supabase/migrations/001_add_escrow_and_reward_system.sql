-- Migration: 001_add_escrow_and_reward_system
-- Created: 2026-03-10
-- Description: Adds escrow, reward, and subscription tables for monetization

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- ESCROW TRANSACTIONS TABLE
-- ==============================================
CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    finder_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Financial fields
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status workflow
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'held', 'released', 'refunded', 'disputed')),
    
    -- Payment provider fields
    payment_provider VARCHAR(20) DEFAULT 'stripe',
    payment_intent_id VARCHAR(255),
    payout_transfer_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    held_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ, -- Auto-refund if not claimed
    
    -- Dispute fields
    disputed_at TIMESTAMPTZ,
    dispute_reason TEXT,
    dispute_resolved_at TIMESTAMPTZ,
    dispute_resolution TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Refund fields
    refund_reason TEXT,
    
    -- Constraints
    CONSTRAINT positive_amount CHECK (amount > 0 OR status = 'pending'),
    CONSTRAINT fee_calculation CHECK (net_amount = amount - platform_fee)
);

-- Indexes for escrow_transactions
CREATE INDEX idx_escrow_incident ON escrow_transactions(incident_id);
CREATE INDEX idx_escrow_owner ON escrow_transactions(owner_id);
CREATE INDEX idx_escrow_finder ON escrow_transactions(finder_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_expires ON escrow_transactions(expires_at) WHERE status = 'held';

-- ==============================================
-- REWARD PREFERENCES TABLE
-- ==============================================
CREATE TABLE reward_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE UNIQUE,
    
    -- Reward settings
    reward_enabled BOOLEAN DEFAULT FALSE,
    reward_amount DECIMAL(10,2) CHECK (reward_amount >= 0),
    min_claimer_rating INTEGER DEFAULT 0 CHECK (min_claimer_rating BETWEEN 0 AND 5),
    anonymous_reward BOOLEAN DEFAULT FALSE,
    
    -- Boost settings
    priority_boost_hours INTEGER DEFAULT 0 CHECK (priority_boost_hours >= 0),
    boost_expires_at TIMESTAMPTZ,
    
    -- Verification questions for claimers
    verification_questions JSONB DEFAULT '[]'::jsonb,
    -- Format: [{"question": "...", "answer_hash": "...", "hint": "..."}]
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reward_incident ON reward_preferences(incident_id);
CREATE INDEX idx_reward_enabled ON reward_preferences(reward_enabled) WHERE reward_enabled = TRUE;

-- ==============================================
-- SUBSCRIPTIONS TABLE
-- ==============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Tier info
    tier VARCHAR(20) NOT NULL DEFAULT 'free'
        CHECK (tier IN ('free', 'basic', 'business')),
    
    -- Stripe fields
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    
    -- Billing cycle
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Usage tracking
    items_used_this_period INTEGER DEFAULT 0,
    boosts_used_this_period INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    canceled_at TIMESTAMPTZ
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ==============================================
-- SUBSCRIPTION TIER FEATURES TABLE
-- ==============================================
CREATE TABLE subscription_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_name VARCHAR(20) NOT NULL UNIQUE
        CHECK (tier_name IN ('free', 'basic', 'business')),
    
    -- Limits
    max_active_items INTEGER NOT NULL,
    max_storage_days INTEGER NOT NULL,
    max_boosts_per_month INTEGER NOT NULL,
    max_message_history_days INTEGER NOT NULL,
    max_photos_per_item INTEGER NOT NULL,
    
    -- Features (boolean flags)
    has_analytics BOOLEAN DEFAULT FALSE,
    has_custom_branding BOOLEAN DEFAULT FALSE,
    has_api_access BOOLEAN DEFAULT FALSE,
    has_priority_support BOOLEAN DEFAULT FALSE,
    
    -- Pricing (for reference, actual billing in Stripe)
    monthly_price DECIMAL(10,2),
    yearly_price DECIMAL(10,2),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tier configurations
INSERT INTO subscription_tiers (
    tier_name, max_active_items, max_storage_days, max_boosts_per_month,
    max_message_history_days, max_photos_per_item,
    has_analytics, has_custom_branding, has_api_access, has_priority_support,
    monthly_price, yearly_price
) VALUES 
    ('free', 3, 30, 0, 7, 3, FALSE, FALSE, FALSE, FALSE, 0, 0),
    ('basic', NULL, 90, 3, 90, 10, TRUE, FALSE, FALSE, FALSE, 4.99, 49.99),
    ('business', NULL, 365, 10, NULL, NULL, TRUE, TRUE, TRUE, TRUE, 9.99, 99.99);

-- ==============================================
-- MATCHING PRIORITIES TABLE
-- ==============================================
CREATE TABLE matching_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE UNIQUE,
    
    -- Priority calculation fields
    base_score INTEGER DEFAULT 0,
    priority_score INTEGER DEFAULT 0, -- Computed final score
    
    -- Reward factors
    has_reward BOOLEAN DEFAULT FALSE,
    reward_amount DECIMAL(10,2),
    reward_weight DECIMAL(3,2) DEFAULT 0.0,
    
    -- Boost factors
    has_boost BOOLEAN DEFAULT FALSE,
    boost_multiplier DECIMAL(3,2) DEFAULT 1.0,
    boost_expires_at TIMESTAMPTZ,
    
    -- Subscription factors
    owner_tier_boost DECIMAL(3,2) DEFAULT 1.0,
    
    -- Computed
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matching_priority_score ON matching_priorities(priority_score DESC);
CREATE INDEX idx_matching_reward ON matching_priorities(has_reward) WHERE has_reward = TRUE;
CREATE INDEX idx_matching_boost ON matching_priorities(has_boost) WHERE has_boost = TRUE;

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Escrow transactions policies
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own escrow transactions" 
    ON escrow_transactions FOR SELECT 
    USING (owner_id = auth.uid() OR finder_id = auth.uid());

CREATE POLICY "System can create escrow transactions" 
    ON escrow_transactions FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "System can update escrow transactions" 
    ON escrow_transactions FOR UPDATE 
    USING (true);

-- Reward preferences policies
ALTER TABLE reward_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reward preferences" 
    ON reward_preferences FOR SELECT 
    USING (true);

CREATE POLICY "Item owners can manage reward preferences" 
    ON reward_preferences FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM incidents i 
            WHERE i.id = reward_preferences.incident_id 
            AND i.reporter_id = auth.uid()
        )
    );

-- Subscriptions policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" 
    ON subscriptions FOR SELECT 
    USING (user_id = auth.uid());

-- Subscription tiers (public read)
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription tiers" 
    ON subscription_tiers FOR SELECT 
    USING (true);

-- Matching priorities (public read, system write)
ALTER TABLE matching_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matching priorities" 
    ON matching_priorities FOR SELECT 
    USING (true);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_escrow_transactions_updated_at 
    BEFORE UPDATE ON escrow_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reward_preferences_updated_at 
    BEFORE UPDATE ON reward_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_tiers_updated_at 
    BEFORE UPDATE ON subscription_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matching_priorities_updated_at 
    BEFORE UPDATE ON matching_priorities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- FUNCTION: Calculate platform fee
-- ==============================================
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    -- 10% platform fee, min $0.50, max $50
    RETURN LEAST(GREATEST(amount * 0.10, 0.50), 50.00);
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- FUNCTION: Calculate priority score
-- ==============================================
CREATE OR REPLACE FUNCTION calculate_priority_score(incident_id UUID)
RETURNS INTEGER AS $$
DECLARE
    base_score INTEGER := 0;
    reward_bonus INTEGER := 0;
    boost_bonus INTEGER := 0;
    tier_multiplier DECIMAL := 1.0;
BEGIN
    -- Base score from age (newer = higher)
    SELECT EXTRACT(EPOCH FROM (NOW() - i.created_at)) / 3600 INTO base_score
    FROM incidents i WHERE i.id = incident_id;
    base_score := GREATEST(100 - base_score, 0);
    
    -- Reward bonus
    SELECT COALESCE(r.reward_amount * 10, 0) INTO reward_bonus
    FROM reward_preferences r WHERE r.incident_id = calculate_priority_score.incident_id;
    
    -- Boost bonus
    SELECT COALESCE(m.boost_multiplier * 50, 0) INTO boost_bonus
    FROM matching_priorities m 
    WHERE m.incident_id = calculate_priority_score.incident_id 
    AND m.boost_expires_at > NOW();
    
    -- Tier multiplier from owner subscription
    SELECT COALESCE(
        CASE st.tier_name
            WHEN 'basic' THEN 1.2
            WHEN 'business' THEN 1.5
            ELSE 1.0
        END, 1.0
    ) INTO tier_multiplier
    FROM incidents i
    JOIN subscriptions s ON s.user_id = i.reporter_id
    JOIN subscription_tiers st ON st.tier_name = s.tier
    WHERE i.id = incident_id;
    
    RETURN FLOOR((base_score + reward_bonus + boost_bonus) * tier_multiplier);
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- FUNCTION: Auto-expire old escrow
-- ==============================================
CREATE OR REPLACE FUNCTION auto_expire_escrow()
RETURNS void AS $$
BEGIN
    UPDATE escrow_transactions
    SET 
        status = 'refunded',
        refunded_at = NOW(),
        refund_reason = 'Auto-refund: No claim within 30 days'
    WHERE status = 'held' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create cron job for auto-expiry (requires pg_cron extension)
-- SELECT cron.schedule('auto-expire-escrow', '0 0 * * *', 'SELECT auto_expire_escrow()');

