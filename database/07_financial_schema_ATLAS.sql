-- =============================================================================
-- ATLAS GLOBAL LOGISTICS - FINANCIAL LAYER SCHEMA v0.3
-- SCOPE: INVOICES, PAYMENTS, DISPUTES
-- DIALECT: PostgreSQL 16+
-- =============================================================================

SET search_path TO logistics_eco, public;

-- 1. INVOICES TABLE
-- =============================================================================
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- ATLAS-INV-YYYYMMDD-XXXX
    
    -- PARTIES
    issuer_party_id BIGINT NOT NULL REFERENCES parties(id),
    recipient_party_id BIGINT NOT NULL REFERENCES parties(id),
    
    -- REFERENCE
    load_id BIGINT REFERENCES loads(id), -- NULL for consolidated invoices
    related_load_ids BIGINT[], -- Array for consolidated billing (v0.3.1+)
    
    -- DATES
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_date TIMESTAMPTZ,
    cancelled_date TIMESTAMPTZ,
    
    -- FINANCIAL
    subtotal_amount DECIMAL(20,4) NOT NULL,
    subtotal_currency CHAR(3) NOT NULL REFERENCES currency_codes(code),
    
    tax_amount DECIMAL(20,4) DEFAULT 0,
    tax_currency CHAR(3) REFERENCES currency_codes(code),
    tax_rate_percent DECIMAL(5,2),
    tax_jurisdiction VARCHAR(100),
    
    total_amount DECIMAL(20,4) NOT NULL,
    total_currency CHAR(3) NOT NULL REFERENCES currency_codes(code),
    
    amount_paid DECIMAL(20,4) DEFAULT 0,
    amount_paid_currency CHAR(3) REFERENCES currency_codes(code),
    amount_remaining DECIMAL(20,4) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
    
    -- STATUS
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'issued', 'sent', 'viewed', 
        'partially_paid', 'paid', 'overdue', 'disputed', 'cancelled'
    )),
    
    -- PAYMENT DETAILS
    payment_method VARCHAR(50), -- ach, wire, credit_card, stablecoin, mobile_money
    payment_rail VARCHAR(50), -- swift, sepa, ach, erc20, trc20, uzcard, humo
    payment_reference VARCHAR(255),
    
    -- SETTLEMENT (Instant Payment)
    instant_settlement_eligible BOOLEAN DEFAULT FALSE,
    instant_settlement_requested BOOLEAN DEFAULT FALSE,
    instant_settlement_fee_percent DECIMAL(5,2),
    instant_settlement_fee_amount DECIMAL(20,4),
    instant_settlement_fee_currency CHAR(3),
    instant_settlement_processed_at TIMESTAMPTZ,
    
    -- DISPUTE_ID will be added via ALTER after disputes table created
    dispute_id BIGINT,
    
    -- NOTES
    notes TEXT,
    terms_conditions TEXT,
    
    -- AUDIT
    created_by_party_id BIGINT NOT NULL REFERENCES parties(id),
    created_by_user_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- INDEXES
CREATE INDEX idx_invoices_issuer ON invoices(issuer_party_id);
CREATE INDEX idx_invoices_recipient ON invoices(recipient_party_id);
CREATE INDEX idx_invoices_load ON invoices(load_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- 2. INVOICE LINE ITEMS
-- =============================================================================
CREATE TABLE invoice_line_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    line_item_type VARCHAR(50) NOT NULL CHECK (line_item_type IN (
        'linehaul', 'fuel_surcharge', 'accessorial', 'detention', 
        'layover', 'tlc', 'pallet', 'loading', 'unloading', 
        'customs_brokerage', 'insurance', 'other'
    )),
    
    description TEXT NOT NULL,
    
    -- Quantity & Rate
    quantity DECIMAL(10,2),
    unit_of_measure VARCHAR(20), -- km, mile, hour, pallet, kg, cbm, flat
    
    unit_price DECIMAL(20,4) NOT NULL,
    unit_price_currency CHAR(3) NOT NULL REFERENCES currency_codes(code),
    
    line_total DECIMAL(20,4) NOT NULL,
    line_total_currency CHAR(3) NOT NULL REFERENCES currency_codes(code),
    
    -- Tax
    tax_rate_percent DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(20,4) DEFAULT 0,
    tax_currency CHAR(3) REFERENCES currency_codes(code),
    
    -- Reference
    load_id BIGINT REFERENCES loads(id), -- NULL if not load-specific
    reference_number VARCHAR(100), -- POD number, customs ref, etc.
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT uq_invoice_line_item UNIQUE (invoice_id, line_item_type, sort_order, description)
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_line_items_load ON invoice_line_items(load_id);

-- 3. PAYMENTS
-- =============================================================================
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL, -- ATLAS-PAY-YYYYMMDD-XXXX
    
    -- PARTIES
    payer_party_id BIGINT NOT NULL REFERENCES parties(id),
    payee_party_id BIGINT NOT NULL REFERENCES parties(id),
    
    -- INVOICE(S)
    invoice_id BIGINT REFERENCES invoices(id), -- NULL for consolidated
    related_invoice_ids BIGINT[], -- For batch payments
    
    -- AMOUNT
    amount DECIMAL(20,4) NOT NULL,
    currency CHAR(3) NOT NULL REFERENCES currency_codes(code),
    
    -- PAYMENT METHOD
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN (
        'ach', 'wire', 'credit_card', 'debit_card', 
        'stablecoin_usdt', 'stablecoin_usdc', 'crypto', 
        'mobile_money', 'cash', 'bank_transfer'
    )),
    
    payment_rail VARCHAR(50) CHECK (payment_rail IN (
        'swift', 'sepa', 'ach', 'fedwire', 'erc20', 'trc20', 
        'bep20', 'uzcard', 'humo', 'click', 'payme'
    )),
    
    -- STATUS
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    )),
    
    -- TIMING
    payment_date TIMESTAMPTZ,
    settlement_date TIMESTAMPTZ,
    
    -- REFERENCE
    transaction_id VARCHAR(255), -- External payment processor ID
    reference_number VARCHAR(100), -- Check number, wire confirmation
    
    -- CURRENCY CONVERSION
    original_currency CHAR(3),
    original_amount DECIMAL(20,4),
    conversion_rate DECIMAL(10,4),
    conversion_fee DECIMAL(20,4),
    conversion_fee_currency CHAR(3),
    
    -- FEE
    processing_fee_amount DECIMAL(20,4),
    processing_fee_currency CHAR(3),
    processing_fee_payer VARCHAR(20) CHECK (processing_fee_payer IN ('payer', 'payee', 'split')),
    
    -- RECONCILIATION
    reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMPTZ,
    reconciled_by VARCHAR(100),
    
    -- NOTES
    notes TEXT,
    
    -- AUDIT
    created_by_party_id BIGINT NOT NULL REFERENCES parties(id),
    created_by_user_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- INDEXES
CREATE INDEX idx_payments_payer ON payments(payer_party_id);
CREATE INDEX idx_payments_payee ON payments(payee_party_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- 4. PAYMENT TRANSACTIONS
-- =============================================================================
CREATE TABLE payment_transactions (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
        'authorization', 'capture', 'settlement', 'refund', 
        'chargeback', 'fee_deduction', 'conversion'
    )),
    
    status VARCHAR(30) NOT NULL,
    amount DECIMAL(20,4) NOT NULL,
    currency CHAR(3) NOT NULL REFERENCES currency_codes(code),
    
    provider_reference VARCHAR(255),
    provider_response JSONB, -- Raw provider response (audit only)
    
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    error_code VARCHAR(100),
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_tx_payment ON payment_transactions(payment_id);
CREATE INDEX idx_payment_tx_status ON payment_transactions(status);

-- 5. DISPUTES
-- =============================================================================
CREATE TABLE disputes (
    id BIGSERIAL PRIMARY KEY,
    dispute_number VARCHAR(50) UNIQUE NOT NULL, -- ATLAS-DSP-YYYYMMDD-XXXX
    
    -- REFERENCE
    invoice_id BIGINT REFERENCES invoices(id),
    payment_id BIGINT REFERENCES payments(id),
    load_id BIGINT REFERENCES loads(id),
    
    -- PARTIES
    complainant_party_id BIGINT NOT NULL REFERENCES parties(id),
    respondent_party_id BIGINT NOT NULL REFERENCES parties(id),
    
    -- DISPUTE DETAILS
    dispute_reason VARCHAR(100) NOT NULL CHECK (dispute_reason IN (
        'rate_disagreement', 'accessorial_charges', 'damage', 
        'shortage', 'delay', 'non_payment', 'double_billing',
        'incorrect_invoice', 'service_quality', 'other'
    )),
    
    description TEXT NOT NULL,
    amount_in_dispute DECIMAL(20,4),
    amount_currency CHAR(3) REFERENCES currency_codes(code),
    
    -- EVIDENCE
    supporting_document_ids BIGINT[], -- Array of document_ids
    
    -- STATUS
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'under_review', 'pending_evidence', 
        'resolved_carrier', 'resolved_shipper', 'resolved_split',
        'escalated', 'closed'
    )),
    
    -- RESOLUTION
    resolution_notes TEXT,
    resolution_amount DECIMAL(20,4),
    resolution_currency CHAR(3),
    resolved_at TIMESTAMPTZ,
    resolved_by_party_id BIGINT REFERENCES parties(id),
    
    -- ESCALATION
    escalated_to VARCHAR(100), -- 'arbitration', 'legal', 'regulatory'
    escalated_at TIMESTAMPTZ,
    
    -- AUDIT
    created_by_party_id BIGINT NOT NULL REFERENCES parties(id),
    created_by_user_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_disputes_invoice ON disputes(invoice_id);
CREATE INDEX idx_disputes_payment ON disputes(payment_id);
CREATE INDEX idx_disputes_complainant ON disputes(complainant_party_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- 6. AUDIT TRIGGERS & FINAL ALTERATIONS
-- =============================================================================

-- Link invoices to disputes (Circular Reference handling)
ALTER TABLE invoices ADD CONSTRAINT fk_invoice_dispute FOREIGN KEY (dispute_id) REFERENCES disputes(id);

CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_line_items_modtime BEFORE UPDATE ON invoice_line_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_disputes_modtime BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
