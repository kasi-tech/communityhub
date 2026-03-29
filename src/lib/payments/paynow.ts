// ---------------------------------------------------------------------------
// CommunityHub — PayNow Payment Provider (SGQR Format)
// ---------------------------------------------------------------------------

import type {
  PaymentProvider,
  CreateOrderResult,
  CaptureResult,
  RefundResult,
} from "./types";

/**
 * Generate a PayNow QR code string in SGQR / EMVCo format.
 *
 * PayNow is a real-time payment system in Singapore. QR codes encode a
 * UEN (Unique Entity Number) so the payer's banking app can initiate a
 * transfer. There is no programmatic capture — an admin must verify the
 * payment manually.
 */
function generatePayNowQrString(
  uen: string,
  amount: number,
  reference: string,
): string {
  // EMVCo QR format fields
  // 00 - Payload Format Indicator
  // 01 - Point of Initiation (12 = dynamic)
  // 26 - Merchant Account Info (PayNow)
  //   00 - Reverse domain (SG.PAYNOW)
  //   01 - Proxy type (2 = UEN)
  //   02 - Proxy value (UEN)
  //   03 - Editable (1 = no)
  //   04 - Expiry (unused)
  // 52 - Merchant Category Code
  // 53 - Transaction Currency (702 = SGD)
  // 54 - Transaction Amount
  // 58 - Country Code (SG)
  // 59 - Merchant Name
  // 60 - Merchant City
  // 62 - Additional Data
  //   05 - Reference number

  const tlv = (tag: string, value: string) =>
    `${tag}${value.length.toString().padStart(2, "0")}${value}`;

  const merchantAccountInfo = [
    tlv("00", "SG.PAYNOW"),
    tlv("01", "2"), // UEN type
    tlv("02", uen),
    tlv("03", "1"), // Amount not editable
  ].join("");

  const additionalData = tlv("05", reference);

  const qrWithoutCrc = [
    tlv("00", "01"), // Payload format indicator
    tlv("01", "12"), // Dynamic QR
    tlv("26", merchantAccountInfo),
    tlv("52", "0000"), // Merchant category (not applicable)
    tlv("53", "702"), // SGD
    tlv("54", amount.toFixed(2)),
    tlv("58", "SG"),
    tlv("59", "CommunityHub"),
    tlv("60", "Singapore"),
    tlv("62", additionalData),
    "6304", // CRC tag + length placeholder
  ].join("");

  // CRC-16/CCITT-FALSE calculation
  const crc = crc16CcittFalse(qrWithoutCrc);
  return qrWithoutCrc + crc.toString(16).toUpperCase().padStart(4, "0");
}

function crc16CcittFalse(input: string): number {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc;
}

export class PayNowProvider implements PaymentProvider {
  async createOrder(
    amount: number,
    currency: string,
    description: string,
    metadata?: Record<string, string>,
  ): Promise<CreateOrderResult> {
    const uen = process.env.PAYNOW_UEN;
    if (!uen) {
      throw new Error("Missing PAYNOW_UEN environment variable");
    }

    // Generate a short reference for the QR code
    const reference =
      metadata?.registrationId?.slice(0, 8) ??
      metadata?.applicationId?.slice(0, 8) ??
      metadata?.donationId?.slice(0, 8) ??
      `CH${Date.now().toString(36).toUpperCase()}`;

    const orderId = `PN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const qrCodeData = generatePayNowQrString(uen, amount, reference);

    // Suppress unused variable lint — currency/description are part of the
    // interface contract but PayNow QR is always SGD with no description field.
    void currency;
    void description;

    return {
      orderId,
      qrCodeData,
    };
  }

  async capturePayment(orderId: string): Promise<CaptureResult> {
    // PayNow has no programmatic capture — payments are verified manually
    // by an admin checking the bank statement against the reference.
    return {
      success: true,
      transactionId: orderId,
      amount: 0, // Amount is set when admin verifies
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    // PayNow refunds are manual bank transfers processed by the admin.
    // We create the record; the admin handles the actual transfer.
    return {
      success: true,
      refundId: `PNREF-${transactionId}-${Date.now()}`,
      amount,
    };
  }
}
