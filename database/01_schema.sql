-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - DATABASE SCHEMA v0.1
-- SCOPE: CORE IDENTITIES, ASSETS, LOCATIONS, COMPLIANCE (NO TRANSACTIONS)
-- DIALECT: PostgreSQL 16+ with PostGIS
-- =============================================================================

-- 1. EXTENSIONS & SCHEMA
-- =============================================================================
CREATE SCHEMA IF NOT EXISTS logistics_eco;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public; -- PostGIS is usually installed in public

SET search_path TO logistics_eco, public;

-- 2. DOMAINS & COMMON TYPES
-- =============================================================================
-- Standard timestamp with time zone (defaulting to now)
DROP DOMAIN IF EXISTS "timestamptz_now" CASCADE;
CREATE DOMAIN "timestamptz_now" AS TIMESTAMPTZ DEFAULT NOW();

-- Currency Code (ISO 4217)
DROP DOMAIN IF EXISTS "currency_code" CASCADE;
CREATE DOMAIN "currency_code" AS CHAR(3);

-- 3. INTERNATIONALIZATION (I18N)
-- =============================================================================

CREATE TABLE language_codes (
    code CHAR(2) PRIMARY KEY, -- ISO 639-1
    name VARCHAR(50) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    direction VARCHAR(3) DEFAULT 'ltr' CHECK (direction IN ('ltr', 'rtl')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE country_codes (
    code CHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2
    code_alpha3 CHAR(3),
    numeric_code CHAR(3),
    name VARCHAR(100) NOT NULL,
    official_name VARCHAR(200),
    capital VARCHAR(100),
    currency_code CHAR(3), -- Default currency
    phone_prefix VARCHAR(10),
    region VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE currency_codes (
    code CHAR(3) PRIMARY KEY, -- ISO 4217
    numeric_code CHAR(3),
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    decimals INTEGER DEFAULT 2,
    is_crypto BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE translation_keys (
    key VARCHAR(255) PRIMARY KEY,
    domain VARCHAR(50) DEFAULT 'system', -- ui, email, error, reference
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE translations (
    key VARCHAR(255) REFERENCES translation_keys(key) ON DELETE CASCADE,
    language_code CHAR(2) REFERENCES language_codes(code) ON DELETE CASCADE,
    translation TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (key, language_code)
);

-- 4. IDENTITY & PARTIES
-- =============================================================================

-- Base Party Table (Abstract Root)
CREATE TABLE parties (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('carrier', 'shipper', 'broker', 'forwarder', 'warehouse_operator')),
    legal_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    tax_id VARCHAR(50),
    tax_country_code CHAR(2) REFERENCES country_codes(code),
    business_registration_number VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'suspended')),
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed', 'under_review')),
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ, -- Soft delete
    
    CONSTRAINT uq_party_tax UNIQUE (tax_id, tax_country_code)
);

CREATE INDEX idx_parties_type ON parties(type);
CREATE INDEX idx_parties_name ON parties(legal_name);

-- Carrier Profile
CREATE TABLE carrier_profiles (
    party_id BIGINT PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
    operating_scac VARCHAR(10), -- Standard Carrier Alpha Code
    fmcsa_number VARCHAR(50), -- US DOT
    eu_license_number VARCHAR(50),
    local_license_number VARCHAR(50), -- Generic field for UZ/KZ/CN
    tir_carnet_holder BOOLEAN DEFAULT FALSE,
    safety_rating VARCHAR(50),
    insurance_verified BOOLEAN DEFAULT FALSE,
    insurance_expiry DATE,
    fleet_size INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipper Profile
CREATE TABLE shipper_profiles (
    party_id BIGINT PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
    industry_sector VARCHAR(100),
    annual_volume_estimated_teu INTEGER,
    credit_limit_amount DECIMAL(20,4),
    credit_limit_currency CHAR(3) REFERENCES currency_codes(code),
    requires_temperature_controlled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Broker Profile
CREATE TABLE broker_profiles (
    party_id BIGINT PRIMARY KEY REFERENCES parties(id) ON DELETE CASCADE,
    bond_amount DECIMAL(20,4),
    bond_currency CHAR(3) REFERENCES currency_codes(code),
    bond_expiry DATE,
    is_freight_forwarder BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LOCATIONS & ADDRESSES
-- =============================================================================

CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    owner_party_id BIGINT REFERENCES parties(id), -- Who owns/operates this location
    location_name VARCHAR(255),
    location_type VARCHAR(50) CHECK (location_type IN ('warehouse', 'port', 'terminal', 'office', 'depot', 'yard')),
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Address Fields
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country_code CHAR(2) REFERENCES country_codes(code),
    
    -- Geospatial
    geolocation GEOGRAPHY(POINT, 4326) NOT NULL,
    geohash VARCHAR(20),
    
    -- Operational
    operating_hours JSONB, -- { "mon": "09:00-17:00", ... }
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_geo ON locations USING GIST (geolocation);
CREATE INDEX idx_locations_owner ON locations(owner_party_id);
CREATE INDEX idx_locations_country ON locations(country_code);

-- 6. ASSETS (EQUIPMENT)
-- =============================================================================

CREATE TABLE equipment_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- DRY_VAN, REEFER_40
    name_key VARCHAR(255) REFERENCES translation_keys(key), -- i18n key
    category VARCHAR(50) CHECK (category IN ('truck', 'trailer', 'container', 'railcar')),
    standard_length_cm DECIMAL(10,2),
    max_weight_kg DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE equipment_assets (
    id BIGSERIAL PRIMARY KEY,
    owner_party_id BIGINT NOT NULL REFERENCES parties(id),
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
    
    unit_identifier VARCHAR(100) NOT NULL, -- License Plate / VIN / Container ID
    registration_country CHAR(2) REFERENCES country_codes(code),
    
    make VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    
    -- Status
    current_status VARCHAR(50) DEFAULT 'available' CHECK (current_status IN ('available', 'en_route', 'maintenance', 'out_of_service')),
    last_known_location GEOGRAPHY(POINT, 4326),
    last_location_at TIMESTAMPTZ,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_asset_id_country UNIQUE (unit_identifier, registration_country)
);

CREATE INDEX idx_equipment_owner ON equipment_assets(owner_party_id);
CREATE INDEX idx_equipment_type ON equipment_assets(equipment_type_id);
CREATE INDEX idx_equipment_status ON equipment_assets(current_status);

-- 7. PEOPLE (DRIVERS)
-- =============================================================================

CREATE TABLE drivers (
    id BIGSERIAL PRIMARY KEY,
    carrier_party_id BIGINT NOT NULL REFERENCES parties(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100),
    license_country CHAR(2) REFERENCES country_codes(code),
    license_expiry DATE,
    
    contact_phone VARCHAR(50),
    current_status VARCHAR(50) DEFAULT 'off_duty',
    current_location GEOGRAPHY(POINT, 4326),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drivers_carrier ON drivers(carrier_party_id);

-- 8. COMPLIANCE (DOCUMENTS)
-- =============================================================================

CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    owner_party_id BIGINT REFERENCES parties(id),
    document_type VARCHAR(50) NOT NULL, -- license, insurance, cert
    reference_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    expiry_date DATE,
    
    file_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_owner ON documents(owner_party_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- 9. AUDIT TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parties_modtime BEFORE UPDATE ON parties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_locations_modtime BEFORE UPDATE ON locations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_equipment_assets_modtime BEFORE UPDATE ON equipment_assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drivers_modtime BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- End of Schema v0.1
