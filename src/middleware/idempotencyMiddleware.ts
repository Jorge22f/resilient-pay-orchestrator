import { Request, Response, NextFunction } from "express";
import { redisClient } from "../config/redis.js";

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const key = req.header("x-idempotency-key");

  if (!key) {
    return res
      .status(400)
      .json({ error: "x-idempotency-key header is required" });
  }

  try {
    const cachedResponse = await redisClient.get(key);

    if (cachedResponse) {
      console.log(`[Idempotency] Duplicate request detected for key: ${key}`);

      if (cachedResponse === "PROCESSING") {
        return res
          .status(425)
          .json({ error: "Request is already being processed" });
      }

      return res.json(JSON.parse(cachedResponse));
    }

    // Lock the key as 'PROCESSING' for 24 hours
    await redisClient.set(key, "PROCESSING", { EX: 86400 });

    req.idempotencyKey = key;

    next();
  } catch (err) {
    console.error("Idempotency error:", err);
    next();
  }
};

export default idempotencyMiddleware;
