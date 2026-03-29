// ---------------------------------------------------------------------------
// CommunityHub — Payment Provider Interface
// ---------------------------------------------------------------------------

export interface CreateOrderResult {
  orderId: string;
  approvalUrl?: string;
  qrCodeData?: string;
}

export interface CaptureResult {
  success: boolean;
  transactionId: string;
  amount: number;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
}

/**
 * Pluggable payment provider interface.
 * Each payment method (PayPal, PayNow, Stripe, etc.) implements this contract.
 */
export interface PaymentProvider {
  createOrder(
    amount: number,
    currency: string,
    description: string,
    metadata?: Record<string, string>,
  ): Promise<CreateOrderResult>;

  capturePayment(orderId: string): Promise<CaptureResult>;

  refund(transactionId: string, amount: number): Promise<RefundResult>;
}
