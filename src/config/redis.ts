import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

export const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
