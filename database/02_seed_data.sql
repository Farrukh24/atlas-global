-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - SEED DATA v0.1
-- SCOPE: REFERENCE DATA & DEMO ENTITIES
-- =============================================================================

SET search_path TO logistics_eco, public;

-- 1. REFERENCE DATA: LANGUAGES
-- =============================================================================
INSERT INTO language_codes (code, name, native_name, direction) VALUES
('en', 'English', 'English', 'ltr'),
('ru', 'Russian', 'Русский', 'ltr'),
('uz', 'Uzbek', 'Oʻzbekcha', 'ltr'),
('zh', 'Chinese', '中文', 'ltr'),
('tr', 'Turkish', 'Türkçe', 'ltr'),
('kk', 'Kazakh', 'Қазақша', 'ltr'),
('de', 'German', 'Deutsch', 'ltr'),
('fr', 'French', 'Français', 'ltr'),
('es', 'Spanish', 'Español', 'ltr'),
('ar', 'Arabic', 'العربية', 'rtl')
ON CONFLICT (code) DO NOTHING;

-- 2. REFERENCE DATA: COUNTRIES (Key Logistics Nodes)
-- =============================================================================
INSERT INTO country_codes (code, name, currency_code) VALUES
('UZ', 'Uzbekistan', 'UZS'),
('KZ', 'Kazakhstan', 'KZT'),
('CN', 'China', 'CNY'),
('RU', 'Russia', 'RUB'),
('TR', 'Turkey', 'TRY'),
('DE', 'Germany', 'EUR'),
('AE', 'United Arab Emirates', 'AED'),
('LV', 'Latvia', 'EUR'),
('PL', 'Poland', 'EUR'),
('US', 'United States', 'USD')
ON CONFLICT (code) DO NOTHING;

-- 3. REFERENCE DATA: CURRENCIES
-- =============================================================================
INSERT INTO currency_codes (code, name, symbol, decimals) VALUES
('USD', 'US Dollar', '$', 2),
('EUR', 'Euro', '€', 2),
('UZS', 'Uzbekistan Som', 'so''m', 2),
('CNY', 'Chinese Yuan', '¥', 2),
('RUB', 'Russian Ruble', '₽', 2),
('KZT', 'Kazakhstani Tenge', '₸', 2),
('TRY', 'Turkish Lira', '₺', 2),
('GBP', 'British Pound', '£', 2),
('AED', 'UAE Dirham', 'dh', 2)
ON CONFLICT (code) DO NOTHING;

-- 4. REFERENCE DATA: TRANSLATION KEYS & EQUIPMENT TYPES
-- =============================================================================
-- Insert Keys
INSERT INTO translation_keys (key, domain, description) VALUES
('eq.type.dry_van', 'reference', 'Standard enclosed trailer'),
('eq.type.reefer', 'reference', 'Refrigerated trailer'),
('eq.type.flatbed', 'reference', 'Open deck trailer'),
('eq.type.tanker', 'reference', 'Liquids carrier'),
('eq.type.cont20', 'reference', '20ft Sea Container'),
('eq.type.cont40', 'reference', '40ft Sea Container'),
('eq.type.rail_hopper', 'reference', 'Railcar for bulk grain/ore');

-- Insert Equipment Types
INSERT INTO equipment_types (code, name_key, category) VALUES
('DRY_VAN_53', 'eq.type.dry_van', 'trailer'),
('REEFER_53', 'eq.type.reefer', 'trailer'),
('FLATBED', 'eq.type.flatbed', 'trailer'),
('TANKER', 'eq.type.tanker', 'trailer'),
('CONT_20', 'eq.type.cont20', 'container'),
('CONT_40', 'eq.type.cont40', 'container'),
('RAIL_HOPPER', 'eq.type.rail_hopper', 'railcar');

-- Insert Sample Translations (English)
INSERT INTO translations (key, language_code, translation) VALUES
('eq.type.dry_van', 'en', 'Dry Van 53'''),
('eq.type.reefer', 'en', 'Refrigerated Trailer'),
('eq.type.flatbed', 'en', 'Flatbed'),
('eq.type.tanker', 'en', 'Tanker'),
('eq.type.cont20', 'en', '20ft Container'),
('eq.type.cont40', 'en', '40ft Container'),
('eq.type.rail_hopper', 'en', 'Rail Hopper Car');

-- Insert Sample Translations (Russian)
INSERT INTO translations (key, language_code, translation) VALUES
('eq.type.dry_van', 'ru', 'Сухой фургон 53'''),
('eq.type.reefer', 'ru', 'Рефрижератор'),
('eq.type.flatbed', 'ru', 'Бортовая платформа'),
('eq.type.tanker', 'ru', 'Цистерна');

-- 5. DEMO ENTITIES
-- =============================================================================

-- DEMO CARRIER: "Silk Road Express LLC"
WITH new_party AS (
    INSERT INTO parties (type, legal_name, tax_id, tax_country_code, verification_status)
    VALUES ('carrier', 'Silk Road Express LLC', '998-123-456-789', 'UZ', 'verified')
    RETURNING id
)
INSERT INTO carrier_profiles (party_id, fleet_size, safety_rating, insurance_verified)
SELECT id, 50, 'satisfactory', true FROM new_party;

-- Add Truck for Carrier (Equipment Asset)
INSERT INTO equipment_assets (owner_party_id, equipment_type_id, unit_identifier, registration_country, make, current_status, last_known_location)
SELECT 
    p.id, 
    (SELECT id FROM equipment_types WHERE code = 'DRY_VAN_53'),
    '10-A777AA', 
    'UZ', 
    'MAN', 
    'available',
    ST_GeographyFromText('POINT(69.2401 41.2995)') -- Tashkent
FROM parties p WHERE p.legal_name = 'Silk Road Express LLC';

-- Add Driver for Carrier
INSERT INTO drivers (carrier_party_id, first_name, last_name, license_number, license_country, current_status)
SELECT 
    p.id,
    'Alisher',
    'Navoi',
    'UZ-DR-998877',
    'UZ',
    'available'
FROM parties p WHERE p.legal_name = 'Silk Road Express LLC';

-- DEMO SHIPPER: "Global Textiles Inc"
WITH new_party AS (
    INSERT INTO parties (type, legal_name, tax_id, tax_country_code, verification_status)
    VALUES ('shipper', 'Global Textiles Inc', 'DE-888-777-666', 'DE', 'verified')
    RETURNING id
)
INSERT INTO shipper_profiles (party_id, industry_sector, credit_limit_amount, credit_limit_currency)
SELECT id, 'Textiles', 50000.00, 'EUR' FROM new_party;

-- Add Warehouse for Shipper (Location)
INSERT INTO locations (owner_party_id, location_name, location_type, address_line1, city, country_code, geolocation)
SELECT 
    p.id,
    'Tashkent Cotton Terminal',
    'warehouse',
    'Industrial Zone 1',
    'Tashkent',
    'UZ',
    ST_GeographyFromText('POINT(69.2150 41.2800)') -- Near Tashkent
FROM parties p WHERE p.legal_name = 'Global Textiles Inc';

-- DEMO BROKER: "Samarkand Logistics Ltd"
WITH new_party AS (
    INSERT INTO parties (type, legal_name, tax_id, tax_country_code, verification_status)
    VALUES ('broker', 'Samarkand Logistics Ltd', 'UK-555-444-333', 'US', 'verified')
    RETURNING id
)
INSERT INTO broker_profiles (party_id, bond_amount, bond_currency)
SELECT id, 75000.00, 'USD' FROM new_party;
