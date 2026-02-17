-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - TRANSACTION LAYER SCHEMA v0.2
-- SCOPE: LOADS, OFFERS, TRACKING, REVIEWS
-- DIALECT: PostgreSQL 16+ with PostGIS
-- =============================================================================

SET search_path TO logistics_eco, public;

-- 1. LOADS TABLE (The Core Transaction)
-- =============================================================================
CREATE TABLE loads (
    id BIGSERIAL PRIMARY KEY,
    load_number VARCHAR(50) UNIQUE NOT NULL, -- Human readable, e.g., "ATLAS-2026-00001"
    
    -- PARTIES
    shipper_party_id BIGINT NOT NULL REFERENCES parties(id),
    broker_party_id BIGINT REFERENCES parties(id), -- NULL if direct shipper->carrier
    carrier_party_id BIGINT REFERENCES parties(id), -- NULL until booked
    consignee_party_id BIGINT REFERENCES parties(id), -- Receiver of goods
    
    -- ROUTE
    origin_location_id BIGINT NOT NULL REFERENCES locations(id),
    destination_location_id BIGINT NOT NULL REFERENCES locations(id),
    pickup_earliest TIMESTAMPTZ NOT NULL,
    pickup_latest TIMESTAMPTZ NOT NULL,
    delivery_earliest TIMESTAMPTZ NOT NULL,
    delivery_latest TIMESTAMPTZ NOT NULL,
    estimated_distance_km DECIMAL(10,2),
    
    -- CARGO
    equipment_type_id INTEGER NOT NULL REFERENCES equipment_types(id),
    commodity_description VARCHAR(255),
    weight_kg DECIMAL(10,2),
    volume_cbm DECIMAL(10,2),
    pieces INTEGER,
    pallet_count INTEGER,
    hazmat BOOLEAN DEFAULT FALSE,
    hazmat_class VARCHAR(10),
    hazmat_un_number VARCHAR(10),
    temperature_min_c DECIMAL(5,2), -- For reefers
    temperature_max_c DECIMAL(5,2), -- For reefers
    stackable BOOLEAN DEFAULT TRUE,
    
    -- FINANCIAL (QUOTE/BOOKED)
    quoted_rate_amount DECIMAL(20,4),
    quoted_rate_currency CHAR(3) REFERENCES currency_codes(code),
    booked_rate_amount DECIMAL(20,4),
    booked_rate_currency CHAR(3) REFERENCES currency_codes(code),
    rate_type VARCHAR(20) CHECK (rate_type IN ('flat', 'per_km', 'per_mile', 'per_hour')),
    
    -- STATUS
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'posted', 'pending_offer', 'booked', 
        'at_pickup', 'loaded', 'en_route', 'at_delivery', 
        'delivered', 'cancelled', 'disputed', 'expired'
    )),
    status_notes TEXT,
    published_at TIMESTAMPTZ,
    booked_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- ASSIGNMENT (when booked)
    assigned_equipment_id BIGINT REFERENCES equipment_assets(id),
    assigned_driver_id BIGINT REFERENCES drivers(id),
    
    -- TRACKING
    public_tracking_code VARCHAR(50), -- For shipper/broker to track without login
    pod_required BOOLEAN DEFAULT TRUE,
    pod_received BOOLEAN DEFAULT FALSE,
    pod_document_id BIGINT REFERENCES documents(id),
    pod_signature_name VARCHAR(255),
    pod_received_at TIMESTAMPTZ,
    
    -- AUDIT
    created_by_party_id BIGINT NOT NULL REFERENCES parties(id),
    created_by_user_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- INDEXES
CREATE INDEX idx_loads_shipper ON loads(shipper_party_id);
CREATE INDEX idx_loads_carrier ON loads(carrier_party_id);
CREATE INDEX idx_loads_broker ON loads(broker_party_id);
CREATE INDEX idx_loads_origin ON loads(origin_location_id);
CREATE INDEX idx_loads_destination ON loads(destination_location_id);
CREATE INDEX idx_loads_status ON loads(status);
CREATE INDEX idx_loads_pickup ON loads(pickup_earliest);
CREATE INDEX idx_loads_load_number ON loads(load_number);
CREATE INDEX idx_loads_public_tracking ON loads(public_tracking_code);

-- 2. LOAD OFFERS (Bidding / Quoting)
-- =============================================================================
CREATE TABLE load_offers (
    id BIGSERIAL PRIMARY KEY,
    load_id BIGINT NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    carrier_party_id BIGINT NOT NULL REFERENCES parties(id),
    equipment_asset_id BIGINT REFERENCES equipment_assets(id),
    driver_id BIGINT REFERENCES drivers(id),
    
    offer_amount DECIMAL(20,4) NOT NULL,
    offer_currency CHAR(3) NOT NULL REFERENCES currency_codes(code),
    offer_type VARCHAR(20) CHECK (offer_type IN ('bid', 'quote', 'counter')),
    offer_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (offer_status IN (
        'pending', 'accepted', 'rejected', 'withdrawn', 'expired', 'countered'
    )),
    
    carrier_notes TEXT,
    valid_until TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    response_notes TEXT,
    counter_offer_amount DECIMAL(20,4),
    counter_offer_currency CHAR(3) REFERENCES currency_codes(code),
    counter_offer_by_party_id BIGINT REFERENCES parties(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Ensure only one pending offer per carrier per load
    CONSTRAINT uq_load_carrier_pending UNIQUE (load_id, carrier_party_id, offer_status) 
    WHERE offer_status = 'pending' AND deleted_at IS NULL
);

CREATE INDEX idx_offers_load ON load_offers(load_id);
CREATE INDEX idx_offers_carrier ON load_offers(carrier_party_id);
CREATE INDEX idx_offers_status ON load_offers(offer_status);

-- 3. TRACKING EVENTS (Real-time Visibility)
-- =============================================================================
CREATE TABLE tracking_events (
    id BIGSERIAL PRIMARY KEY,
    load_id BIGINT NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    equipment_asset_id BIGINT REFERENCES equipment_assets(id),
    driver_id BIGINT REFERENCES drivers(id),
    
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'status_change', 'location_update', 'geofence_entry', 
        'geofence_exit', 'document_uploaded', 'exception',
        'temperature_alert', 'door_event', 'shock_event'
    )),
    event_code VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMPTZ NOT NULL,
    recorded_timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    location GEOGRAPHY(POINT, 4326),
    location_name VARCHAR(255),
    geofence_id VARCHAR(100), -- Future geofences table
    
    -- Telematics/Sensor Data
    speed_kph DECIMAL(6,2),
    heading_degrees INTEGER CHECK (heading_degrees >= 0 AND heading_degrees <= 359),
    odometer_km DECIMAL(10,2),
    fuel_level_percent DECIMAL(5,2),
    engine_hours DECIMAL(10,2),
    temperature_celsius DECIMAL(5,2), -- For reefers
    door_open BOOLEAN,
    shock_detected BOOLEAN,
    shock_magnitude_g DECIMAL(5,2),
    
    event_description TEXT,
    event_source VARCHAR(50) CHECK (event_source IN ('mobile_app', 'telematics', 'api', 'manual', 'atlas_tracker')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- CRITICAL INDEXES FOR TIME-SERIES
CREATE INDEX idx_tracking_load_time ON tracking_events(load_id, event_timestamp DESC);
CREATE INDEX idx_tracking_location ON tracking_events USING GIST (location);
CREATE INDEX idx_tracking_type_time ON tracking_events(event_type, event_timestamp DESC);
CREATE INDEX idx_tracking_timestamp ON tracking_events(event_timestamp DESC);

-- 4. REVIEWS (Bidirectional Ratings)
-- =============================================================================
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    load_id BIGINT NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
    
    reviewer_party_id BIGINT NOT NULL REFERENCES parties(id),
    reviewer_type VARCHAR(20) CHECK (reviewer_type IN ('carrier', 'shipper', 'broker')),
    subject_party_id BIGINT NOT NULL REFERENCES parties(id),
    subject_type VARCHAR(20) CHECK (subject_type IN ('carrier', 'shipper', 'broker')),
    
    rating_score INTEGER NOT NULL CHECK (rating_score >= 1 AND rating_score <= 5),
    review_title VARCHAR(255),
    review_text TEXT,
    
    -- Detailed criteria scores (1-5) - NULL if not applicable
    criteria_communication INTEGER CHECK (criteria_communication >= 1 AND criteria_communication <= 5),
    criteria_on_time INTEGER CHECK (criteria_on_time >= 1 AND criteria_on_time <= 5),
    criteria_equipment_quality INTEGER CHECK (criteria_equipment_quality >= 1 AND criteria_equipment_quality <= 5),
    criteria_cargo_care INTEGER CHECK (criteria_cargo_care >= 1 AND criteria_cargo_care <= 5),
    criteria_payment_speed INTEGER CHECK (criteria_payment_speed >= 1 AND criteria_payment_speed <= 5),
    criteria_load_accuracy INTEGER CHECK (criteria_load_accuracy >= 1 AND criteria_load_accuracy <= 5),
    criteria_facility_wait_time INTEGER CHECK (criteria_facility_wait_time >= 1 AND criteria_facility_wait_time <= 5),
    
    recommend BOOLEAN,
    would_work_again BOOLEAN,
    
    review_status VARCHAR(20) DEFAULT 'published' CHECK (review_status IN ('pending', 'published', 'flagged', 'hidden', 'removed')),
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    
    reviewer_anonymous BOOLEAN DEFAULT FALSE,
    reviewer_company_display VARCHAR(255),
    
    response_text TEXT,
    responded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT uq_review_per_load UNIQUE (load_id, reviewer_party_id, subject_party_id)
);

CREATE INDEX idx_reviews_subject ON reviews(subject_party_id);
CREATE INDEX idx_reviews_score ON reviews(rating_score);
CREATE INDEX idx_reviews_load ON reviews(load_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_party_id);

-- 5. AUDIT TRIGGERS
-- =============================================================================
CREATE TRIGGER update_loads_modtime BEFORE UPDATE ON loads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_load_offers_modtime BEFORE UPDATE ON load_offers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tracking_events_modtime BEFORE UPDATE ON tracking_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- 10. USERS (Identity & Auth)
-- =============================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    party_id BIGINT NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Ensure enough space for bcrypt
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_party ON users(party_id);

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
