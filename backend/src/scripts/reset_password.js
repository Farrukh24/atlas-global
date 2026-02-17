
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const client = new Client({
    user: 'atlas',
    host: 'atlas_db',
    database: 'logistics_eco',
    password: 'atlas123',
    port: 5432,
});

async function run() {
    try {
        await client.connect();
        // hash for 'password123'
        const hash = await bcrypt.hash('password123', 10);
        console.log('Generated hash:', hash);
        const res = await client.query("UPDATE users SET password_hash = $1 WHERE email = 'shipper@atlas.global' RETURNING id", [hash]);
        if (res.rowCount > 0) {
            console.log('Password updated successfully for shipper@atlas.global');
        } else {
            console.log('User not found!');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
