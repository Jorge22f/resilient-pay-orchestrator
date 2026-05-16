import db from "../config/database.js";
import { dbResponseTimeHistogram } from "../config/metrics.js";
import { ChargeRequest } from "../types/payment.js";

export const saveInitialTransaction = async (
  request: ChargeRequest,
  provider: string,
) => {
  const endTimer = dbResponseTimeHistogram.startTimer({
    operation: "saveInitialTransaction",
  });

  try {
    const result = await db("transactions")
      .insert({
        idempotency_key: request.idempotencyKey,
        amount_cents: request.amount,
        currency: request.currency,
        status: "PENDING",
        provider: provider,
      })
      .returning("*");

    return result;
  } finally {
    endTimer();
  }
};

export const updateTransactionStatus = async (
  id: string,
  status: "SUCCESS" | "FAILED",
  providerTxId: string,
) => {
  const endTimer = dbResponseTimeHistogram.startTimer({
    operation: "updateTransactionStatus",
  });

  try {
    return await db("transactions").where({ id }).update({
      status,
      provider_transaction_id: providerTxId,
      updated_at: db.fn.now(),
    });
  } finally {
    endTimer();
  }
};
