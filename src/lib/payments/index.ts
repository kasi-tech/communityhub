// ---------------------------------------------------------------------------
// CommunityHub — Payment Provider Factory
// ---------------------------------------------------------------------------

import type { PaymentProvider } from "./types";
import { PayPalProvider } from "./paypal";
import { PayNowProvider } from "./paynow";

export type { PaymentProvider, CreateOrderResult, CaptureResult, RefundResult } from "./types";

/**
 * Returns the appropriate payment provider instance.
 */
export function getPaymentProvider(
  provider: "paypal" | "paynow",
): PaymentProvider {
  switch (provider) {
    case "paypal":
      return new PayPalProvider();
    case "paynow":
      return new PayNowProvider();
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}
