-- 1. Update parties type constraint to allow 'admin'
SET search_path TO logistics_eco, public;

ALTER TABLE parties DROP CONSTRAINT IF EXISTS parties_type_check;
ALTER TABLE parties ADD CONSTRAINT parties_type_check 
    CHECK (type IN ('carrier', 'shipper', 'broker', 'forwarder', 'warehouse_operator', 'admin'));

-- 2. Create Parties and Users with Hashed Passwords
-- Password: password123
-- Hash: $2b$12$fb0YyzdsEF27cHBlYBhH9emysPuHTqfq6npR9GUUveJEPuINUmSP2

DO $$
DECLARE
    shipper_party_id BIGINT;
    broker_party_id BIGINT;
    admin_party_id BIGINT;
BEGIN
    -- SHIPPER
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'shipper@atlas.global') THEN
        INSERT INTO parties (type, legal_name, verification_status, account_status)
        VALUES ('shipper', 'Global Textiles Inc', 'verified', 'active')
        RETURNING id INTO shipper_party_id;

        INSERT INTO users (party_id, email, password_hash)
        VALUES (shipper_party_id, 'shipper@atlas.global', '$2b$12$fb0YyzdsEF27cHBlYBhH9emysPuHTqfq6npR9GUUveJEPuINUmSP2');
    END IF;

    -- BROKER
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'broker@atlas.global') THEN
        INSERT INTO parties (type, legal_name, verification_status, account_status)
        VALUES ('broker', 'Samarkand Logistics Ltd', 'verified', 'active')
        RETURNING id INTO broker_party_id;

        INSERT INTO users (party_id, email, password_hash)
        VALUES (broker_party_id, 'broker@atlas.global', '$2b$12$fb0YyzdsEF27cHBlYBhH9emysPuHTqfq6npR9GUUveJEPuINUmSP2');
    END IF;

    -- ADMIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@atlas.global') THEN
        INSERT INTO parties (type, legal_name, verification_status, account_status)
        VALUES ('admin', 'Atlas System Admin', 'verified', 'active')
        RETURNING id INTO admin_party_id;

        INSERT INTO users (party_id, email, password_hash)
        VALUES (admin_party_id, 'admin@atlas.global', '$2b$12$fb0YyzdsEF27cHBlYBhH9emysPuHTqfq6npR9GUUveJEPuINUmSP2');
    END IF;
END $$;
