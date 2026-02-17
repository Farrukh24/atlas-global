
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/atlas'
});

async function seed() {
    const shipperResult = await pool.query("SELECT party_id FROM shipper_profiles LIMIT 1");
    if (shipperResult.rows.length === 0) {
        console.log("No shipper found to seed documents for.");
        return;
    }
    const partyId = shipperResult.rows[0].party_id;

    // Seed Documents
    await pool.query(`
    INSERT INTO documents (owner_party_id, document_type, reference_number, issuing_authority, file_url, mime_type, is_verified)
    VALUES 
    ($1, 'Invoice', 'INV-2024-001', 'Atlas Global', 'https://example.com/inv1.pdf', 'application/pdf', true),
    ($1, 'BOL', 'BOL-9922', 'Uzbek Customs', 'https://example.com/bol1.pdf', 'application/pdf', false),
    ($1, 'Insurance', 'INS-77', 'Safety First', 'https://example.com/ins1.pdf', 'application/pdf', true)
  `, [partyId]);

    // Seed some historical loads for better charts
    for (let i = 1; i <= 5; i++) {
        await pool.query(`
      INSERT INTO loads (load_number, shipper_party_id, status, booked_rate_amount, created_at, origin_location_id, destination_location_id)
      VALUES 
      ('HIST-${i}', $1, 'delivered', 1200 + ${i * 100}, NOW() - INTERVAL '${i} months', 1, 2)
    `, [partyId]);
    }

    console.log("Seeding completed.");
    await pool.end();
}

seed().catch(console.error);
