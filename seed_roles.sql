-- 1. Update parties type constraint to allow 'admin'
SET search_path TO logistics_eco, public;

ALTER TABLE parties DROP CONSTRAINT parties_type_check;
ALTER TABLE parties ADD CONSTRAINT parties_type_check 
    CHECK (type IN ('carrier', 'shipper', 'broker', 'forwarder', 'warehouse_operator', 'admin'));

-- 2. Create Admin Party if not exists
INSERT INTO parties (type, legal_name, tax_id, tax_country_code, verification_status, account_status)
SELECT 'admin', 'Atlas Platform Administration', 'ADMIN-SYS-001', 'US', 'verified', 'active'
WHERE NOT EXISTS (SELECT 1 FROM parties WHERE type = 'admin');

-- 3. Seed Users
-- Passwords are all 'password123'
-- Hash: $2b$12$fb0YyzdsEF27cHBlYBhH9emysPuHTqfq6npR9GUUveJEPuINUmSP2

-- Shipper (Global Trade and Logistics Ltd - ID 2)
INSERT INTO users (party_id, email, password_hash)
SELECT id, 'shipper@atlas.global', '$2b$12$fb0YyzdsEF27cHBlYBhH9emysPuHTqfq6npR9GUUveJEPuINUmSP2'
FROM parties WHERE type = 'shipper' AND legal_name = 'Global Trade and Logistics Ltd'
ON CONFLICT (email) DO UPDATE SET party_id = EXCLUDED.party_id;

-- Broker (Samarkand Logistics Ltd - ID 3)
INSERT INTO users (party_id, email, password_hash)
SELECT id, 'broker@atlas.global', '$2b$12$fb0YyzdsEF27cHBlYBhH9emysPuHTqfq6npR9GUUveJEPuINUmSP2'
FROM parties WHERE type = 'broker' AND legal_name = 'Samarkand Logistics Ltd'
ON CONFLICT (email) DO UPDATE SET party_id = EXCLUDED.party_id;

-- Admin
INSERT INTO users (party_id, email, password_hash)
SELECT id, 'admin@atlas.global', '$2b$12$fb0YyzdsEF27cHBlYBhH9emysPuHTqfq6npR9GUUveJEPuINUmSP2'
FROM parties WHERE type = 'admin'
ON CONFLICT (email) DO UPDATE SET party_id = EXCLUDED.party_id;
