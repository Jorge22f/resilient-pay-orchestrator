import { Router, Request, Response } from 'express';
import { redisClient } from '../config/redis.js';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware.js';
import { gatewayBreaker } from '../services/gatewayService.js';
import { saveInitialTransaction, updateTransactionStatus } from '../services/transactionService.js';

const router = Router();

router.post('/charge', idempotencyMiddleware, async (req: Request, res: Response) => {
  const { amount, currency } = req.body;

  let transactionRecord: any;

  try {
    // 1. Record Intent (Status: PENDING) in Postgres
    const [transaction] = await saveInitialTransaction({
      amount,
      currency,
      idempotencyKey: req.idempotencyKey
    }, 'EXTERNAL_GATEWAY');

    transactionRecord = transaction;
    console.log(`[Database] Created PENDING transaction: ${transaction.id}`);

    // 2. Execute Action via Circuit Breaker
    // This wraps the external call and handles timeouts/failures
    const gatewayResult = await gatewayBreaker.fire({ amount, currency });
    
    // 3. Record SUCCESS Result
    await updateTransactionStatus(transactionRecord.id, 'SUCCESS', gatewayResult.id);

    const successResponse = { 
      transactionId: gatewayResult.id, 
      status: 'SUCCESS', 
      amount, 
      currency 
    };
    
    // 4. Cache final result in Redis for Idempotency
    await redisClient.set(req.idempotencyKey, JSON.stringify(successResponse), { EX: 86400 });

    return res.json(successResponse);

  } catch (error: any) {
    console.error('Payment Processing Error:', error.message);

    // If we have a DB record, mark it as FAILED in the ledger
    if (transactionRecord) {
      await updateTransactionStatus(transactionRecord.id, 'FAILED', null as any);
    }

    // Custom response if the Circuit is Open
    if (error.message === 'OpenCircuitError' || error.type === 'open') {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable. Please try again later.' 
      });
    }

    return res.status(500).json({ error: 'Payment processing failed' });
  }
});

export default router;