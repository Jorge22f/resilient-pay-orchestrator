import { RedisClientType } from 'redis';

declare global {
  namespace Express {
    interface Request {
      redisClient: RedisClientType;
      idempotencyKey: string;
    }
  }
}

export {};