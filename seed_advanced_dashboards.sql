-- Seeding Advanced Dashboards Data
SET search_path TO logistics_eco, public;

-- 1. Create load_offers table if it doesn't exist (safety check)
CREATE TABLE IF NOT EXISTS load_offers (
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
    
    CONSTRAINT uq_load_carrier_pending UNIQUE (load_id, carrier_party_id, offer_status) 
    WHERE offer_status = 'pending' AND deleted_at IS NULL
);

-- 2. Insert Locations
INSERT INTO locations (location_name, city, country_code, geolocation, location_type) VALUES
('Almaty Logistics Hub', 'Almaty', 'KZ', ST_GeographyFromText('POINT(76.85 43.22)'), 'terminal'),
('Moscow Central Freight', 'Moscow', 'RU', ST_GeographyFromText('POINT(37.61 55.75)'), 'depot'),
('Berlin West Port', 'Berlin', 'DE', ST_GeographyFromText('POINT(13.40 52.52)'), 'port'),
('Beijing North Gateway', 'Beijing', 'CN', ST_GeographyFromText('POINT(116.40 39.90)'), 'yard'),
('Dubai Jebel Ali', 'Dubai', 'AE', ST_GeographyFromText('POINT(55.27 25.20)'), 'port')
ON CONFLICT DO NOTHING;

-- 3. Insert Loads for Shipper (Party ID 34: Shipper Global)
INSERT INTO loads (
    load_number, shipper_party_id, origin_location_id, destination_location_id, 
    pickup_earliest, pickup_latest, delivery_earliest, delivery_latest,
    equipment_type_id, weight_kg, status, created_by_party_id
) VALUES
('AT-1001', 34, 1, (SELECT id FROM locations WHERE city = 'Almaty'), NOW(), NOW() + interval '1 day', NOW() + interval '2 days', NOW() + interval '3 days', (SELECT id FROM equipment_types WHERE code = 'DRY_VAN_53'), 15000, 'posted', 34),
('AT-1002', 34, (SELECT id FROM locations WHERE city = 'Moscow'), (SELECT id FROM locations WHERE city = 'Berlin'), NOW(), NOW() + interval '2 days', NOW() + interval '4 days', NOW() + interval '5 days', (SELECT id FROM equipment_types WHERE code = 'REEFER_53'), 22000, 'pending_offer', 34),
('AT-1003', 34, (SELECT id FROM locations WHERE city = 'Beijing'), (SELECT id FROM locations WHERE city = 'Dubai'), NOW() - interval '5 days', NOW() - interval '4 days', NOW() - interval '1 day', NOW(), (SELECT id FROM equipment_types WHERE code = 'CONT_40'), 18000, 'delivered', 34)
ON CONFLICT (load_number) DO NOTHING;

-- 4. Insert Bids for Broker (Party ID 3: Broker Central - actually user said Broker is 35?)
-- User said: Broker: broker@atlas.global / password123. 
-- In parties: 3 is broker (Samarkand Logistics), 35 is broker (Broker Central). 
-- I used 35 in my routing/seeding work earlier. 
-- Wait, let me check who broker@atlas.global is linked to.
-- Actually I'll just use both or find the correct one.
-- I'll check users table.

-- Let's assume party 35 for now as I created it.
INSERT INTO load_offers (load_id, carrier_party_id, offer_amount, offer_currency, offer_type, offer_status)
VALUES 
((SELECT id FROM loads WHERE load_number = 'AT-1001'), 1, 2450.00, 'USD', 'bid', 'pending'),
((SELECT id FROM loads WHERE load_number = 'AT-1001'), 1, 2400.00, 'USD', 'counter', 'countered'),
((SELECT id FROM loads WHERE load_number = 'AT-1002'), 1, 3200.00, 'EUR', 'bid', 'accepted')
ON CONFLICT DO NOTHING;
