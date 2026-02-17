-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - v0.3 FINANCIAL VERIFICATION
-- SCOPE: AR AGING, PAYMENTS & RECONCILIATION
-- =============================================================================

SET search_path TO logistics_eco, public;

\echo '----------------------------------------------------------------------'
\echo '1. FINANCIAL TABLE COUNTS'
SELECT 'invoices' as table, COUNT(*) FROM invoices
UNION ALL
SELECT 'invoice_line_items', COUNT(*) FROM invoice_line_items
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'disputes', COUNT(*) FROM disputes;

\echo '----------------------------------------------------------------------'
\echo '2. OUTSTANDING INVOICES (AGED RECEIVABLES)'
SELECT 
    i.invoice_number,
    p.legal_name as payer,
    i.invoice_date,
    i.due_date,
    CASE 
        WHEN CURRENT_DATE > i.due_date THEN (CURRENT_DATE - i.due_date)
        ELSE 0 
    END as days_overdue,
    i.total_amount,
    i.total_currency,
    i.amount_remaining,
    i.status
FROM invoices i
JOIN parties p ON i.recipient_party_id = p.id
WHERE i.status NOT IN ('draft', 'paid', 'cancelled')
AND i.deleted_at IS NULL
ORDER BY i.due_date;

\echo '----------------------------------------------------------------------'
\echo '3. INVOICE DETAIL WITH LINE ITEMS (Sample)'
SELECT 
    i.invoice_number,
    il.line_item_type,
    il.description,
    il.quantity,
    il.unit_price,
    il.unit_price_currency,
    il.line_total,
    il.line_total_currency
FROM invoices i
JOIN invoice_line_items il ON i.id = il.invoice_id
WHERE i.deleted_at IS NULL
LIMIT 10;

\echo '----------------------------------------------------------------------'
\echo '4. PAYMENT RECONCILIATION STATUS'
SELECT 
    payment_number,
    amount,
    currency,
    status,
    payment_date,
    settlement_date,
    reconciled
FROM payments
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

\echo '----------------------------------------------------------------------'
\echo '5. LOAD TO INVOICE TO PAYMENT COMPLETENESS'
SELECT 
    l.load_number,
    i.invoice_number,
    i.status as invoice_status,
    p.payment_number,
    p.status as payment_status,
    CASE 
        WHEN p.id IS NOT NULL AND i.amount_paid >= i.total_amount THEN 'FULLY SETTLED'
        WHEN p.id IS NOT NULL AND i.amount_paid < i.total_amount THEN 'PARTIALLY SETTLED'
        WHEN i.id IS NOT NULL AND p.id IS NULL THEN 'INVOICED NOT PAID'
        ELSE 'LOAD NOT INVOICED'
    END as settlement_status
FROM loads l
LEFT JOIN invoices i ON l.id = i.load_id
LEFT JOIN payments p ON i.id = p.invoice_id
WHERE l.deleted_at IS NULL
ORDER BY l.created_at DESC;

\echo '----------------------------------------------------------------------'
\echo 'ATLAS GLOBAL LOGISTICS - v0.3 FINANCIAL VERIFICATION COMPLETE'
\echo '----------------------------------------------------------------------'
