
-- 10. MARKETPLACE (OFFERS/BIDS)
-- =============================================================================

CREATE TABLE offers (
    id BIGSERIAL PRIMARY KEY,
    load_id BIGINT NOT NULL, -- References loads(id) - To be linked after loads table confirmed
    carrier_party_id BIGINT NOT NULL REFERENCES parties(id),
    
    amount DECIMAL(20,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    
    pickup_date TIMESTAMPTZ,
    delivery_date TIMESTAMPTZ,
    
    notebook TEXT, -- Notes from carrier
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offers_load ON offers(load_id);
CREATE INDEX idx_offers_carrier ON offers(carrier_party_id);
CREATE INDEX idx_offers_status ON offers(status);

-- 11. OPERATIONS (SHIPMENTS/HAULS)
-- =============================================================================
-- Represents the execution of a Load after an Offer is accepted

CREATE TABLE shipments (
    id BIGSERIAL PRIMARY KEY,
    load_id BIGINT NOT NULL UNIQUE, -- 1-to-1 with Load
    carrier_party_id BIGINT NOT NULL REFERENCES parties(id),
    driver_id BIGINT REFERENCES drivers(id),
    equipment_asset_id BIGINT REFERENCES equipment_assets(id),
    
    current_status VARCHAR(50) DEFAULT 'dispatched' CHECK (current_status IN ('dispatched', 'at_pickup', 'in_transit', 'at_delivery', 'delivered', 'completed', 'cancelled')),
    
    pickup_actual_at TIMESTAMPTZ,
    delivery_actual_at TIMESTAMPTZ,
    
    tracking_url VARCHAR(500),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipments_carrier ON shipments(carrier_party_id);
CREATE INDEX idx_shipments_status ON shipments(current_status);

-- 12. FINANCIALS (EARNINGS/PAYMENTS)
-- =============================================================================

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT REFERENCES shipments(id),
    payee_party_id BIGINT NOT NULL REFERENCES parties(id), -- Carrier
    payer_party_id BIGINT NOT NULL REFERENCES parties(id), -- Broker/Shipper
    
    amount DECIMAL(20,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
    method VARCHAR(50), -- ACH, WIRE, FACTORING
    
    due_date DATE,
    paid_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_payee ON payments(payee_party_id);

-- 13. REPUTATION (REVIEWS)
-- =============================================================================

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT REFERENCES shipments(id),
    reviewer_party_id BIGINT NOT NULL REFERENCES parties(id),
    subject_party_id BIGINT NOT NULL REFERENCES parties(id), -- Who is being reviewed
    
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_subject ON reviews(subject_party_id);

-- TRIGGERS
CREATE TRIGGER update_offers_modtime BEFORE UPDATE ON offers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_shipments_modtime BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
