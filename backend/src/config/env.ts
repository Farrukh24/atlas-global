import { cleanEnv, str, port, num } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3000 }),

  DB_HOST: str({ default: 'postgres' }),
  DB_PORT: port({ default: 5432 }),
  DB_NAME: str({ default: 'logistics_eco' }),
  DB_USER: str({ default: 'atlas' }),
  DB_PASSWORD: str({ default: 'atlas123' }),

  JWT_SECRET: str({ default: 'ATLAS_GLOBAL_LOGISTICS_STRATEGIC_BACKBONE_2026' }),
  JWT_EXPIRES_IN: str({ default: '24h' }),
  JWT_REFRESH_SECRET: str({ default: 'ATLAS_REFRESH_TOKEN_SECURE_KEY_2026' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '30d' }),

  CORS_ORIGIN: str({ default: '*' }),
  API_VERSION: str({ default: 'v1' }),

  DB_POOL_MIN: num({ default: 2 }),
  DB_POOL_MAX: num({ default: 20 }),
  DB_IDLE_TIMEOUT: num({ default: 10000 }),
  DB_CONNECTION_TIMEOUT: num({ default: 10000 }),
});
