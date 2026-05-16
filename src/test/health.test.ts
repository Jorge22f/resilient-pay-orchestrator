import { expect } from 'chai';
import knex from 'knex';
import Redis from 'ioredis';
import knexConfig from '../../knexfile.js';

describe('Resilient Pay Orchestrator Base Integration Suite', () => {
  let db: any;
  let redis: Redis;

  before(async () => {
    const isDockerNetwork = process.env.GITHUB_ACTIONS === 'true' || process.env.IS_DOCKER === 'true';

    const dbHost = isDockerNetwork ? (process.env.DB_HOST || 'localhost') : '127.0.0.1';
    const redisHost = isDockerNetwork ? (process.env.REDIS_HOST || 'localhost') : '127.0.0.1';

    const localKnexConfig = {
      ...knexConfig.development,
      connection: {
        host: dbHost,
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || 'your_secure_password',
        database: process.env.DB_NAME || 'payment_orchestrator',
        port: 5432
      }
    };

    db = knex(localKnexConfig);

    redis = new Redis({
      host: redisHost,
      port: 6379,
      maxRetriesPerRequest: 1
    });
  });

  after(async () => {
    if (db) await db.destroy();
    if (redis) await redis.quit();
  });

  it('should successfully establish a valid connection to the PostgreSQL database engine', async () => {
    const result = await db.raw('SELECT 1 + 1 AS result');
    expect(result.rows[0].result).to.equal(2);
  });

  it('should successfully execute write/read commands against the Redis idempotency cache layer', async () => {
    await redis.set('ci_pipeline_tripwire', 'healthy', 'EX', 10);
    const value = await redis.get('ci_pipeline_tripwire');
    expect(value).to.equal('healthy');
  });
});