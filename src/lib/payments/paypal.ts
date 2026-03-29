// ---------------------------------------------------------------------------
// CommunityHub — PayPal Payment Provider (REST API v2)
// ---------------------------------------------------------------------------

import type {
  PaymentProvider,
  CreateOrderResult,
  CaptureResult,
  RefundResult,
} from "./types";

const SANDBOX_BASE = "https://api-m.sandbox.paypal.com";
const PRODUCTION_BASE = "https://api-m.paypal.com";

function getBaseUrl(): string {
  return process.env.PAYPAL_MODE === "production"
    ? PRODUCTION_BASE
    : SANDBOX_BASE;
}

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET environment variables",
    );
  }

  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal auth failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

export class PayPalProvider implements PaymentProvider {
  async createOrder(
    amount: number,
    currency: string,
    description: string,
    metadata?: Record<string, string>,
  ): Promise<CreateOrderResult> {
    const accessToken = await getAccessToken();
    const baseUrl = getBaseUrl();

    const body = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description,
          custom_id: metadata?.registrationId ?? metadata?.applicationId ?? metadata?.donationId ?? undefined,
        },
      ],
      application_context: {
        return_url: metadata?.returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/payments/success`,
        cancel_url: metadata?.cancelUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/payments/cancel`,
      },
    };

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PayPal create order failed (${response.status}): ${text}`);
    }

    const data = await response.json();

    const approvalLink = data.links?.find(
      (link: { rel: string; href: string }) => link.rel === "approve",
    );

    return {
      orderId: data.id,
      approvalUrl: approvalLink?.href,
    };
  }

  async capturePayment(orderId: string): Promise<CaptureResult> {
    const accessToken = await getAccessToken();
    const baseUrl = getBaseUrl();

    const response = await fetch(
      `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PayPal capture failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

    return {
      success: data.status === "COMPLETED",
      transactionId: capture?.id ?? data.id,
      amount: parseFloat(capture?.amount?.value ?? "0"),
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const accessToken = await getAccessToken();
    const baseUrl = getBaseUrl();

    const response = await fetch(
      `${baseUrl}/v2/payments/captures/${transactionId}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: {
            value: amount.toFixed(2),
            currency_code: "SGD",
          },
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`PayPal refund failed (${response.status}): ${text}`);
    }

    const data = await response.json();

    return {
      success: data.status === "COMPLETED",
      refundId: data.id,
      amount: parseFloat(data.amount?.value ?? "0"),
    };
  }
}
