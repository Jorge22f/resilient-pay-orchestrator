import { Router, Request, Response } from 'express';
import { redisClient } from '../config/redis.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const redisStatus = redisClient.isOpen ? 'Healthy' : 'Unhealthy';
  res.json({
    status: 'Server is up',
    redis: redisStatus,
    timestamp: new Date().toISOString()
  });
});

export default router;