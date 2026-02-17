-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - VERIFICATION SCRIPT v0.1
-- SCOPE: SCHEMA INTEGRITY & DATA VALIDATION
-- =============================================================================

SET search_path TO logistics_eco, public;

\echo '----------------------------------------------------------------------'
\echo '1. CHECKING EXTENSIONS & VERSIONS'
\echo '----------------------------------------------------------------------'
SELECT postgis_full_version();

\echo '----------------------------------------------------------------------'
\echo '2. CHECKING TABLE COUNTS (EXPECTED > 0)'
\echo '----------------------------------------------------------------------'
SELECT 'Languages' as table, count(*) FROM language_codes
UNION ALL
SELECT 'Countries', count(*) FROM country_codes
UNION ALL
SELECT 'Currencies', count(*) FROM currency_codes
UNION ALL
SELECT 'Equipment Types', count(*) FROM equipment_types
UNION ALL
SELECT 'Parties', count(*) FROM parties
UNION ALL
SELECT 'Locations', count(*) FROM locations;

\echo '----------------------------------------------------------------------'
\echo '3. GEOSPATIAL QUERY TEST: Find Facilities within 50km of Tashkent Center'
\echo '   Center: 41.2995 N, 69.2401 E'
\echo '----------------------------------------------------------------------'

SELECT 
    id, 
    location_name, 
    location_type, 
    ST_StartPoint(geolocation::geometry)::geography <-> ST_GeographyFromText('POINT(69.2401 41.2995)') as distance_meters
FROM locations
WHERE ST_DWithin(
    geolocation, 
    ST_GeographyFromText('POINT(69.2401 41.2995)'), 
    50000 -- 50km radius
);

\echo '----------------------------------------------------------------------'
\echo '4. DATA INTEGRITY CHECK: Party Profiles'
\echo '----------------------------------------------------------------------'
SELECT 
    p.legal_name, 
    p.type,
    COALESCE(cp.fleet_size::text, 'N/A') as fleet_size,
    COALESCE(sp.industry_sector, 'N/A') as sector,
    COALESCE(bp.bond_amount::text, 'N/A') as bond
FROM parties p
LEFT JOIN carrier_profiles cp ON p.id = cp.party_id
LEFT JOIN shipper_profiles sp ON p.id = sp.party_id
LEFT JOIN broker_profiles bp ON p.id = bp.party_id;

\echo 'Verification Complete.'
