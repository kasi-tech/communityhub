import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@react-email/components';
import { PaymentReceiptEmail } from '@/emails/payment-receipt';
import type { PaymentReceiptProps } from '@/emails/payment-receipt';

// ---------------------------------------------------------------------------
// Mock the Resend client
// ---------------------------------------------------------------------------

const mockSend = vi.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null });

vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

// ---------------------------------------------------------------------------
// Helper: simulate what a sendPaymentReceipt function would do
// ---------------------------------------------------------------------------

async function sendPaymentReceipt(props: PaymentReceiptProps, to: string) {
  const { Resend } = await import('resend');
  const resend = new Resend('re_test_key');

  const html = await render(PaymentReceiptEmail(props));

  return resend.emails.send({
    from: 'noreply@communityhub.org',
    to,
    subject: `Payment Receipt ${props.transactionId}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('sendPaymentReceipt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a receipt email with 2 line items', async () => {
    const props: PaymentReceiptProps = {
      memberName: 'Alice Tan',
      memberId: 'MEM-00100',
      transactionId: 'TXN-20260329-001',
      date: '29 Mar 2026',
      paymentMethod: 'PayPal',
      description: 'Annual Community Gala 2026',
      lineItems: [
        { label: 'Adult Ticket', quantity: 2, unitPrice: 15.0, total: 30.0 },
        { label: 'Child Ticket', quantity: 1, unitPrice: 8.0, total: 8.0 },
      ],
      serviceCharge: 0,
      totalAmount: 38.0,
      orgName: 'Singapore Community Club',
      supportEmail: 'help@sgcc.org',
    };

    const result = await sendPaymentReceipt(props, 'alice@example.com');

    // Verify Resend was called
    expect(mockSend).toHaveBeenCalledTimes(1);

    const sendArgs = mockSend.mock.calls[0]![0] as {
      from: string;
      to: string;
      subject: string;
      html: string;
    };

    // Verify email metadata
    expect(sendArgs.from).toBe('noreply@communityhub.org');
    expect(sendArgs.to).toBe('alice@example.com');
    expect(sendArgs.subject).toBe('Payment Receipt TXN-20260329-001');

    // Verify rendered HTML contains key content
    expect(sendArgs.html).toContain('Alice Tan');
    expect(sendArgs.html).toContain('MEM-00100');
    expect(sendArgs.html).toContain('TXN-20260329-001');
    expect(sendArgs.html).toContain('PayPal');
    expect(sendArgs.html).toContain('Annual Community Gala 2026');
    expect(sendArgs.html).toContain('Adult Ticket');
    expect(sendArgs.html).toContain('Child Ticket');
    expect(sendArgs.html).toContain('$30.00');
    expect(sendArgs.html).toContain('$8.00');
    expect(sendArgs.html).toContain('$38.00');
    expect(sendArgs.html).toContain('Payment Confirmed');
    expect(sendArgs.html).toContain('Singapore Community Club');

    // Verify result
    expect(result.data).toEqual({ id: 'mock-email-id' });
  });

  it('should include service charge when provided', async () => {
    const props: PaymentReceiptProps = {
      memberName: 'Bob Lee',
      memberId: 'MEM-00200',
      transactionId: 'TXN-20260330-002',
      date: '30 Mar 2026',
      paymentMethod: 'PayNow',
      description: 'Family Membership Renewal',
      lineItems: [
        { label: 'Family Premium (12 months)', quantity: 1, unitPrice: 120.0, total: 120.0 },
      ],
      serviceCharge: 3.5,
      totalAmount: 123.5,
      orgName: 'Singapore Community Club',
      supportEmail: 'help@sgcc.org',
    };

    await sendPaymentReceipt(props, 'bob@example.com');

    const sendArgs = mockSend.mock.calls[0]![0] as { html: string };

    // Service charge should be visible
    expect(sendArgs.html).toContain('Service Charge');
    expect(sendArgs.html).toContain('$3.50');
    expect(sendArgs.html).toContain('$123.50');
    expect(sendArgs.html).toContain('PayNow');
  });

  it('should handle a free event with $0 total', async () => {
    const props: PaymentReceiptProps = {
      memberName: 'Carol Wong',
      memberId: 'MEM-00300',
      transactionId: 'TXN-20260401-003',
      date: '1 Apr 2026',
      paymentMethod: 'PayPal',
      description: 'Free Community Meetup',
      lineItems: [{ label: 'Free Admission', quantity: 1, unitPrice: 0.0, total: 0.0 }],
      serviceCharge: 0,
      totalAmount: 0.0,
      orgName: 'CommunityHub',
      supportEmail: 'support@communityhub.org',
    };

    await sendPaymentReceipt(props, 'carol@example.com');

    const sendArgs = mockSend.mock.calls[0]![0] as { html: string };

    // Verify $0 amounts render correctly
    expect(sendArgs.html).toContain('$0.00');
    expect(sendArgs.html).toContain('Free Admission');
    expect(sendArgs.html).toContain('Carol Wong');
    expect(sendArgs.html).toContain('Payment Confirmed');

    // Service charge should NOT appear (it is 0)
    expect(sendArgs.html).not.toContain('Service Charge');
  });
});
