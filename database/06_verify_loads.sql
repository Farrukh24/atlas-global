-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - v0.2 VERIFICATION (REFINED)
-- SCOPE: LOAD BOARD, BIDDING & TRACKING ANALYSIS
-- =============================================================================

SET search_path TO logistics_eco, public;

\echo '----------------------------------------------------------------------'
\echo '1. NEW TABLE COUNTS'
SELECT 'loads' as table, COUNT(*) FROM loads
UNION ALL
SELECT 'load_offers', COUNT(*) FROM load_offers
UNION ALL
SELECT 'tracking_events', COUNT(*) FROM tracking_events
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews;

\echo '----------------------------------------------------------------------'
\echo '2. ACTIVE LOADS AVAILABLE FOR CARRIERS'
SELECT 
    l.load_number,
    sh.legal_name as shipper,
    orig.location_name as origin,
    dest.location_name as destination,
    l.pickup_earliest,
    l.quoted_rate_amount,
    l.quoted_rate_currency,
    l.status
FROM loads l
JOIN parties sh ON l.shipper_party_id = sh.id
JOIN locations orig ON l.origin_location_id = orig.id
JOIN locations dest ON l.destination_location_id = dest.id
WHERE l.status IN ('posted', 'pending_offer')
AND l.deleted_at IS NULL
ORDER BY l.created_at DESC;

\echo '----------------------------------------------------------------------'
\echo '3. PENDING OFFERS BY LOAD'
SELECT 
    l.load_number,
    c.legal_name as carrier,
    lo.offer_amount,
    lo.offer_currency,
    lo.valid_until,
    lo.carrier_notes
FROM load_offers lo
JOIN loads l ON lo.load_id = l.id
JOIN parties c ON lo.carrier_party_id = c.id
WHERE lo.offer_status = 'pending'
ORDER BY lo.created_at DESC;

\echo '----------------------------------------------------------------------'
\echo '4. RECENT TRACKING EVENTS'
SELECT 
    l.load_number,
    te.event_type,
    te.event_code,
    te.event_timestamp,
    te.location_name,
    ST_AsText(te.location::geometry) as location_coords,
    te.speed_kph,
    te.temperature_celsius,
    te.event_description
FROM tracking_events te
JOIN loads l ON te.load_id = l.id
WHERE te.event_timestamp > NOW() - INTERVAL '1 day'
ORDER BY te.event_timestamp DESC
LIMIT 10;

\echo '----------------------------------------------------------------------'
\echo '5. CARRIER RATING - Silk Road Express LLC'
SELECT 
    p.legal_name,
    AVG(r.rating_score)::DECIMAL(3,2) as average_rating,
    COUNT(r.id) as review_count,
    AVG(r.criteria_on_time)::DECIMAL(3,2) as avg_on_time,
    AVG(r.criteria_communication)::DECIMAL(3,2) as avg_communication,
    AVG(r.criteria_equipment_quality)::DECIMAL(3,2) as avg_equipment
FROM reviews r
JOIN parties p ON r.subject_party_id = p.id
WHERE p.legal_name = 'Silk Road Express LLC'
AND r.subject_type = 'carrier'
GROUP BY p.legal_name;

\echo '----------------------------------------------------------------------'
\echo '6. GEOGRAPHIC SEARCH - Loads near Tashkent (100km radius)'
SELECT 
    l.load_number,
    orig.location_name,
    dest.location_name,
    ST_Distance(
        orig.geolocation, 
        ST_GeographyFromText('POINT(69.2401 41.2995)')
    ) as distance_from_tashkent_meters
FROM loads l
JOIN locations orig ON l.origin_location_id = orig.id
WHERE ST_DWithin(
    orig.geolocation, 
    ST_GeographyFromText('POINT(69.2401 41.2995)'), 
    100000
)
AND l.status IN ('posted', 'pending_offer')
ORDER BY distance_from_tashkent_meters;

\echo '----------------------------------------------------------------------'
\echo 'ATLAS GLOBAL LOGISTICS - v0.2 VERIFICATION COMPLETE'
\echo '----------------------------------------------------------------------'
