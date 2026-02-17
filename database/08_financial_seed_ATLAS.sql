-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - FINANCIAL LAYER SEED DATA v0.3
-- SCOPE: SAMPLE INVOICES & PAYMENTS
-- =============================================================================

SET search_path TO logistics_eco, public;

-- 1. DEMO INVOICE for Load ATLAS-YYYYMMDD-0001
-- =============================================================================
WITH target_load AS (
    SELECT id, load_number FROM loads WHERE load_number LIKE 'ATLAS-%' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO invoices (
    invoice_number,
    issuer_party_id,
    recipient_party_id,
    load_id,
    due_date,
    subtotal_amount,
    subtotal_currency,
    total_amount,
    total_currency,
    status,
    created_by_party_id
)
SELECT
    'ATLAS-INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-0001',
    (SELECT id FROM parties WHERE legal_name = 'Silk Road Express LLC'),
    (SELECT id FROM parties WHERE legal_name = 'Global Textiles Inc'),
    (SELECT id FROM target_load),
    CURRENT_DATE + INTERVAL '30 days',
    2450.00,
    'USD',
    2450.00,
    'USD',
    'issued',
    (SELECT id FROM parties WHERE legal_name = 'Silk Road Express LLC')
FROM target_load;

-- 2. ADD INVOICE LINE ITEMS
-- =============================================================================
WITH target_invoice AS (
    SELECT id FROM invoices WHERE invoice_number LIKE 'ATLAS-INV-%' ORDER BY created_at DESC LIMIT 1
),
target_load AS (
    SELECT id FROM loads WHERE load_number LIKE 'ATLAS-%' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO invoice_line_items (
    invoice_id,
    line_item_type,
    description,
    quantity,
    unit_of_measure,
    unit_price,
    unit_price_currency,
    line_total,
    line_total_currency,
    load_id
)
SELECT
    (SELECT id FROM target_invoice),
    'linehaul',
    'Tashkent → Almaty, Dry Van 53'', 15000kg textiles',
    1.00,
    'flat',
    2450.00,
    'USD',
    2450.00,
    'USD',
    (SELECT id FROM target_load);

-- 3. RECORD SAMPLE PAYMENT
-- =============================================================================
WITH target_invoice AS (
    SELECT id FROM invoices WHERE invoice_number LIKE 'ATLAS-INV-%' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO payments (
    payment_number,
    payer_party_id,
    payee_party_id,
    invoice_id,
    amount,
    currency,
    payment_method,
    payment_rail,
    status,
    payment_date,
    transaction_id,
    created_by_party_id
)
SELECT
    'ATLAS-PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-0001',
    (SELECT id FROM parties WHERE legal_name = 'Global Textiles Inc'),
    (SELECT id FROM parties WHERE legal_name = 'Silk Road Express LLC'),
    (SELECT id FROM target_invoice),
    2450.00,
    'USD',
    'wire',
    'swift',
    'completed',
    NOW(),
    'SWIFT-REF-' || FLOOR(RANDOM() * 1000000)::TEXT,
    (SELECT id FROM parties WHERE legal_name = 'Global Textiles Inc');

-- 4. UPDATE INVOICE STATUS
-- =============================================================================
UPDATE invoices 
SET 
    amount_paid = 2450.00,
    amount_paid_currency = 'USD',
    status = 'paid',
    paid_date = NOW()
WHERE invoice_number LIKE 'ATLAS-INV-%'
  AND id = (SELECT id FROM invoices WHERE invoice_number LIKE 'ATLAS-INV-%' ORDER BY created_at DESC LIMIT 1);
