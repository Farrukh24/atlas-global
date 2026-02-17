
-- 13. REPUTATION (REVIEWS)
-- =============================================================================
SET search_path TO logistics_eco, public;

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    shipment_id BIGINT REFERENCES loads(id), -- Linked to loads for simplicity in this implementation
    reviewer_party_id BIGINT NOT NULL REFERENCES parties(id),
    subject_party_id BIGINT NOT NULL REFERENCES parties(id), -- Who is being reviewed (Carrier)
    
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_subject ON reviews(subject_party_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shipment ON reviews(shipment_id);
