const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: 'postgres',
    port: 5432,
    user: 'atlas',
    password: 'atlas123',
    database: 'logistics_eco'
});

async function fix() {
    try {
        const hash = await bcrypt.hash('password123', 12);
        console.log('Generated hash:', hash);
        const result = await pool.query(
            'UPDATE logistics_eco.users SET password_hash = $1 WHERE email = $2',
            [hash, 'silkroad@atlas.global']
        );
        console.log('Update result:', result.rowCount);

        const verify = await pool.query('SELECT password_hash FROM logistics_eco.users WHERE email = $1', ['silkroad@atlas.global']);
        console.log('Verified hash in DB:', verify.rows[0].password_hash);

        // Test comparison immediately
        const match = await bcrypt.compare('password123', verify.rows[0].password_hash);
        console.log('Comparison test result:', match);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

fix();
