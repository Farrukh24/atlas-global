-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - COMPLETE DEPLOYMENT SCHEMA
-- =============================================================================

-- 1. SETUP
CREATE SCHEMA IF NOT EXISTS logistics_eco;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;
SET search_path TO logistics_eco, public;

-- 2. DOMAINS & CORE TABLES
DROP DOMAIN IF EXISTS "timestamptz_now" CASCADE;
CREATE DOMAIN "timestamptz_now" AS TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS language_codes (
    code CHAR(2) PRIMARY KEY, name VARCHAR(50), native_name VARCHAR(100),
    direction VARCHAR(3) DEFAULT 'ltr', is_active BOOLEAN DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS country_codes (
    code CHAR(2) PRIMARY KEY, name VARCHAR(100), currency_code CHAR(3), 
    is_active BOOLEAN DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS currency_codes (
    code CHAR(3) PRIMARY KEY, name VARCHAR(100), symbol VARCHAR(10), 
    decimals INTEGER, is_active BOOLEAN DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS translation_keys (
    key VARCHAR(255) PRIMARY KEY, domain VARCHAR(50), description TEXT
);
CREATE TABLE IF NOT EXISTS translations (
    key VARCHAR(255) REFERENCES translation_keys(key) ON DELETE CASCADE,
    language_code CHAR(2) REFERENCES language_codes(code) ON DELETE CASCADE,
    translation TEXT NOT NULL,
    PRIMARY KEY (key, language_code)
);

-- 3. PARTIES & IDENTITY
CREATE TABLE IF NOT EXISTS parties (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) CHECK (type IN ('carrier', 'shipper', 'broker', 'forwarder', 'warehouse_operator', 'admin')),
    legal_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50), tax_country_code CHAR(2) REFERENCES country_codes(code),
    verification_status VARCHAR(50) DEFAULT 'unverified',
    account_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    party_id BIGINT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carrier_profiles (
    party_id BIGINT PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
    operating_scac VARCHAR(10), fleet_size INTEGER, safety_rating VARCHAR(50)
);
CREATE TABLE IF NOT EXISTS shipper_profiles (
    party_id BIGINT PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
    industry_sector VARCHAR(100), credit_limit_amount DECIMAL(20,4)
);
CREATE TABLE IF NOT EXISTS broker_profiles (
    party_id BIGINT PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
    bond_amount DECIMAL(20,4)
);

-- 4. LOCATIONS & ASSETS
CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY, owner_party_id BIGINT REFERENCES parties(id),
    location_name VARCHAR(255), location_type VARCHAR(50), is_public BOOLEAN DEFAULT FALSE,
    address_line1 VARCHAR(255), city VARCHAR(100), country_code CHAR(2),
    geolocation GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment_types (
    id SERIAL PRIMARY KEY, code VARCHAR(50) UNIQUE, name_key VARCHAR(255), category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS equipment_assets (
    id BIGSERIAL PRIMARY KEY, owner_party_id BIGINT REFERENCES parties(id),
    equipment_type_id INTEGER REFERENCES equipment_types(id),
    unit_identifier VARCHAR(100), registration_country CHAR(2),
    current_status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id BIGSERIAL PRIMARY KEY, carrier_party_id BIGINT REFERENCES parties(id),
    first_name VARCHAR(100), last_name VARCHAR(100),
    contact_phone VARCHAR(50), current_status VARCHAR(50) DEFAULT 'off_duty',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY, owner_party_id BIGINT REFERENCES parties(id),
    document_type VARCHAR(50), file_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTIONS (LOADS)
CREATE TABLE IF NOT EXISTS loads (
    id BIGSERIAL PRIMARY KEY, load_number VARCHAR(50) UNIQUE NOT NULL,
    shipper_party_id BIGINT NOT NULL REFERENCES parties(id),
    broker_party_id BIGINT REFERENCES parties(id),
    carrier_party_id BIGINT REFERENCES parties(id), -- Assigned carrier
    origin_location_id BIGINT NOT NULL REFERENCES locations(id),
    destination_location_id BIGINT NOT NULL REFERENCES locations(id),
    pickup_earliest TIMESTAMPTZ, pickup_latest TIMESTAMPTZ,
    delivery_earliest TIMESTAMPTZ, delivery_latest TIMESTAMPTZ,
    equipment_type_id INTEGER REFERENCES equipment_types(id),
    commodity_description VARCHAR(255), weight_kg DECIMAL(10,2),
    quoted_rate_amount DECIMAL(20,4), quoted_rate_currency CHAR(3) REFERENCES currency_codes(code),
    status VARCHAR(50) DEFAULT 'draft',
    created_by_party_id BIGINT REFERENCES parties(id),
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS load_offers (
    id BIGSERIAL PRIMARY KEY, load_id BIGINT NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    carrier_party_id BIGINT NOT NULL REFERENCES parties(id),
    offer_amount DECIMAL(20,4), offer_currency CHAR(3),
    offer_status VARCHAR(30) DEFAULT 'pending', carrier_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracking_events (
    id BIGSERIAL PRIMARY KEY, load_id BIGINT NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    event_type VARCHAR(50), event_code VARCHAR(50), event_timestamp TIMESTAMPTZ,
    location GEOGRAPHY(POINT, 4326), created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REVIEWS (Fixed Schema for App Compatibility)
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT REFERENCES loads(id), -- Refers to Load ID
    reviewer_party_id BIGINT NOT NULL REFERENCES parties(id),
    subject_party_id BIGINT NOT NULL REFERENCES parties(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INITIAL DATA SEED
INSERT INTO language_codes (code, name) VALUES ('en', 'English'), ('ru', 'Russian') ON CONFLICT DO NOTHING;
INSERT INTO country_codes (code, name, currency_code) VALUES ('US', 'United States', 'USD'), ('UZ', 'Uzbekistan', 'UZS') ON CONFLICT DO NOTHING;
INSERT INTO currency_codes (code, name, symbol) VALUES ('USD', 'US Dollar', '$'), ('UZS', 'Uzbekistan Som', 'лв') ON CONFLICT DO NOTHING;
INSERT INTO equipment_types (code, category) VALUES ('DRY_VAN_53', 'trailer'), ('REEFER_53', 'trailer') ON CONFLICT DO NOTHING;

-- Demo Users (Password: password123)
-- Insert happens via app logic usually, but here is a base set if needed can be added manually.

-- 9. CONFIGURATION (CRITICAL FOR BACKEND ACCESS)
-- =============================================================================
-- Ensure the backend connects and sees 'logistics_eco' by default
ALTER DATABASE postgres SET search_path TO logistics_eco, public;

-- Also set for specific Supabase roles found in connection poolers
DO $$
BEGIN
  EXECUTE 'ALTER ROLE postgres SET search_path = logistics_eco, public';
EXCEPTION WHEN OTHERS THEN
  -- Ignore if role doesn't exist (e.g. self-hosted)
  NULL;
END
$$;

DO $$
BEGIN
  EXECUTE 'ALTER ROLE service_role SET search_path = logistics_eco, public';
EXCEPTION WHEN OTHERS THEN
  NULL;
END
$$;

-- Grant usage to public just in case (REST API access via Supabase client, if used later)
GRANT USAGE ON SCHEMA logistics_eco TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA logistics_eco TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA logistics_eco TO postgres, service_role;
