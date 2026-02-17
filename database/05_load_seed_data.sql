-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - TRANSACTION LAYER SEED DATA v0.2
-- SCOPE: SAMPLE LOADS, BIDS, TRACKING, REVIEWS (ALMATY CASE)
-- =============================================================================

SET search_path TO logistics_eco, public;

-- 1. ADD ALMATY FACILITY
-- =============================================================================
INSERT INTO locations (
    location_name, location_type, is_public,
    address_line1, city, country_code,
    geolocation, operating_hours
) VALUES (
    'Almaty Distribution Center',
    'warehouse',
    true,
    'Industrial Zone B, 15',
    'Almaty',
    'KZ',
    ST_GeographyFromText('POINT(76.9285 43.2220)'),
    '{"mon":"09:00-18:00","tue":"09:00-18:00","wed":"09:00-18:00","thu":"09:00-18:00","fri":"09:00-18:00"}'
) ON CONFLICT DO NOTHING;

-- 2. CREATE A LOAD: TASHKENT -> ALMATY
-- =============================================================================
WITH load_insert AS (
    INSERT INTO loads (
        load_number,
        shipper_party_id,
        origin_location_id,
        destination_location_id,
        pickup_earliest,
        pickup_latest,
        delivery_earliest,
        delivery_latest,
        equipment_type_id,
        commodity_description,
        weight_kg,
        pieces,
        pallet_count,
        quoted_rate_amount,
        quoted_rate_currency,
        status,
        published_at,
        created_by_party_id
    )
    SELECT
        'ATLAS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-0001',
        (SELECT id FROM parties WHERE legal_name = 'Global Textiles Inc'),
        (SELECT id FROM locations WHERE location_name = 'Tashkent Cotton Terminal'),
        (SELECT id FROM locations WHERE location_name = 'Almaty Distribution Center'),
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '3 days 4 hours',
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '5 days 4 hours',
        (SELECT id FROM equipment_types WHERE code = 'DRY_VAN_53'),
        'Cotton textiles, finished goods',
        15000.00,
        24,
        24,
        2500.00,
        'USD',
        'posted',
        NOW(),
        (SELECT id FROM parties WHERE legal_name = 'Global Textiles Inc')
    RETURNING id
)
-- Carrier offers on the load
INSERT INTO load_offers (
    load_id,
    carrier_party_id,
    equipment_asset_id,
    driver_id,
    offer_amount,
    offer_currency,
    offer_type,
    offer_status,
    carrier_notes,
    valid_until
)
SELECT
    (SELECT id FROM load_insert),
    (SELECT id FROM parties WHERE legal_name = 'Silk Road Express LLC'),
    (SELECT id FROM equipment_assets WHERE unit_identifier = '10-A777AA'),
    (SELECT id FROM drivers WHERE first_name = 'Alisher'),
    2450.00,
    'USD',
    'bid',
    'pending',
    'Can depart immediately, experienced on this route',
    NOW() + INTERVAL '2 days';

-- 3. SIMULATE TRACKING EVENTS
-- =============================================================================
WITH target_load AS (
    SELECT id FROM loads WHERE load_number LIKE 'ATLAS-%' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO tracking_events (
    load_id, equipment_asset_id, driver_id, event_type, event_code, 
    event_timestamp, location, speed_kph, event_source, event_description
)
SELECT
    (SELECT id FROM target_load),
    (SELECT id FROM equipment_assets WHERE unit_identifier = '10-A777AA'),
    (SELECT id FROM drivers WHERE first_name = 'Alisher'),
    'location_update',
    'EN_ROUTE',
    NOW() - INTERVAL '2 hours',
    ST_GeographyFromText('POINT(69.2850 41.3150)'),
    65.5,
    'mobile_app',
    'Departing Tashkent, heading north';

WITH target_load AS (
    SELECT id FROM loads WHERE load_number LIKE 'ATLAS-%' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO tracking_events (
    load_id, equipment_asset_id, driver_id, event_type, event_code, 
    event_timestamp, location, event_source, event_description
)
SELECT
    (SELECT id FROM target_load),
    (SELECT id FROM equipment_assets WHERE unit_identifier = '10-A777AA'),
    (SELECT id FROM drivers WHERE first_name = 'Alisher'),
    'geofence_entry',
    'BORDER_CROSSING',
    NOW() - INTERVAL '30 minutes',
    ST_GeographyFromText('POINT(70.8400 41.1550)'),
    'telematics',
    'Entered Kazakh border checkpoint';

-- 4. SHIPPER REVIEWS CARRIER (Simulating completed Trip)
-- =============================================================================
WITH target_load AS (
    SELECT id FROM loads WHERE load_number LIKE 'ATLAS-%' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO reviews (
    load_id, reviewer_party_id, reviewer_type, subject_party_id, subject_type,
    rating_score, review_title, review_text, criteria_communication, criteria_on_time,
    criteria_equipment_quality, criteria_cargo_care, recommend, would_work_again
)
SELECT
    (SELECT id FROM target_load),
    (SELECT id FROM parties WHERE legal_name = 'Global Textiles Inc'),
    'shipper',
    (SELECT id FROM parties WHERE legal_name = 'Silk Road Express LLC'),
    'carrier',
    5,
    'Excellent service on Tashkent-Almaty route',
    'Driver Alisher was professional, equipment clean, arrived early. Highly recommend.',
    5, 5, 5, 5,
    true,
    true;
