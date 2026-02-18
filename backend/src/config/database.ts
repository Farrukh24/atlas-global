import pg from 'pg';
import { env } from './env.js';
import winston from 'winston';

const { Pool } = pg;

// Create a logger for database queries
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

import dns from 'dns';
import util from 'util';

const resolve4 = util.promisify(dns.resolve4);

let poolConfig: pg.PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false
  }
};

const initPool = async () => {
  try {
    // FORCE IPv4: Render prefers IPv6 which fails with Supabase
    if (env.DB_HOST && !env.DB_HOST.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      logger.info(`Resolving IPv4 for ${env.DB_HOST}...`);
      const addresses = await resolve4(env.DB_HOST);
      if (addresses && addresses.length > 0) {
        poolConfig.host = addresses[0];
        logger.info(`Resolved DB Host to IPv4: ${poolConfig.host}`);
      }
    }
  } catch (err) {
    logger.warn('Failed to resolve IPv4, using original host', err);
  }
  return new Pool(poolConfig);
};

// Initialize pool lazily
let pool: pg.Pool;
// We need a synchronous export for the app structure, so we use a getter or wrapper
// But since the current exports assume 'pool' is available immediately, 
// we will stick to the original approach but modify the getClient/query wrappers
// to ensure initialization. 
// However, 'pg' Pool constructor is synchronous. 
// workaround: We will just rely on the fact that if we pass the hostname, pg might default to ipv6.
// BETTER FIX: Do the resolution at the top level (async) which might block module loading - NOT GOOD.
// ALTERNATIVE: Just use the 'lookup' option in pg? No, pg doesn't support custom lookup easily.
// Let's use a simpler approach: 
// We will create the pool immediately but using the original host. 
// BUT we will also try to use the direct IP if we can hack it? No.
// 
// RE-STRATEGY: We will keep the original pool export but add the DNS lookup in the 'startServer' script 
// OR we just use valid IPv4-only Supabase connection string if available.
//
// LET'S TRY: 'dns.setDefaultResultOrder("ipv4first")' if node version supports it (Node 17+)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('query error', { text, error });
    throw error;
  }
};

export const getClient = () => pool.connect();

export default pool;
