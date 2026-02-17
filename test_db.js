const { Pool } = require('pg');
const pool = new Pool({
    host: 'postgres',
    port: 5432,
    user: 'atlas',
    password: 'atlas123',
    database: 'logistics_eco'
});

const queryText = `
  SELECT p.id, p.type, p.verification_status, p.account_status, u.password_hash, p.legal_name 
  FROM parties p 
  JOIN users u ON u.party_id = p.id 
  WHERE u.email = $1 AND p.deleted_at IS NULL
`;

pool.query(queryText, ['silkroad@atlas.global'])
    .then(res => {
        console.log('Query successful!');
        console.log('Rows found:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('User ID:', res.rows[0].id);
            console.log('Legal Name:', res.rows[0].legal_name);
        }
    })
    .catch(err => {
        console.error('Query failed!');
        console.error('Error:', err.message);
    })
    .finally(() => {
        pool.end();
    });
