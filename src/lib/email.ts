import { Resend } from "resend";
import type { ReactElement } from "react";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '');
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "noreply@communityhub.app";

// ---------------------------------------------------------------------------
// Generic send
// ---------------------------------------------------------------------------

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement;
}

/**
 * Send a transactional email via Resend.
 */
export async function sendEmail({ to, subject, react }: SendEmailParams) {
  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Payment receipt
// ---------------------------------------------------------------------------

interface ReceiptLineItem {
  description: string;
  amount: number;
}

interface PaymentReceiptParams {
  to: string;
  memberName: string;
  itemName: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  transactionRef: string;
  date: string;
  items: ReceiptLineItem[];
}

/**
 * Send a formatted payment receipt email.
 * Uses a plain-HTML email body so it works without a dedicated React Email
 * template during early development.
 */
export async function sendPaymentReceipt({
  to,
  memberName,
  itemName,
  amount,
  currency = "SGD",
  paymentMethod,
  transactionRef,
  date,
  items,
}: PaymentReceiptParams) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">${item.description}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${currency} ${item.amount.toFixed(2)}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#6366F1;margin-bottom:4px">Payment Receipt</h2>
      <p style="color:#6b7280;margin-top:0">Thank you for your payment, ${memberName}.</p>

      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tbody>
          <tr><td style="color:#6b7280;padding:4px 0">Item</td><td style="padding:4px 0">${itemName}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Date</td><td style="padding:4px 0">${date}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Payment Method</td><td style="padding:4px 0">${paymentMethod}</td></tr>
          <tr><td style="color:#6b7280;padding:4px 0">Transaction Ref</td><td style="padding:4px 0">${transactionRef}</td></tr>
        </tbody>
      </table>

      <h3 style="margin-bottom:8px">Breakdown</h3>
      <table style="width:100%;border-collapse:collapse">
        <tbody>
          ${itemsHtml}
          <tr>
            <td style="padding:12px 0;font-weight:bold">Total</td>
            <td style="padding:12px 0;font-weight:bold;text-align:right">${currency} ${amount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="color:#9ca3af;font-size:12px">
        This is an automated receipt from CommunityHub. If you have questions, please contact your community administrator.
      </p>
    </div>
  `;

  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `Payment Receipt — ${itemName}`,
    html,
  });

  if (error) {
    throw new Error(`Receipt email failed: ${error.message}`);
  }

  return data;
}
