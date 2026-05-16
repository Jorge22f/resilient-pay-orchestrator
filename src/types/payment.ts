export interface ChargeRequest {
  amount: number; // in cents
  currency: "USD" | "EUR" | "GBP";
  idempotencyKey: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: number;
  currency: string;
  provider: string;
}
