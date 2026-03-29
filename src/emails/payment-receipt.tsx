import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Img,
  Link,
  Preview,
  Heading,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

export interface PaymentReceiptLineItem {
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentReceiptProps {
  memberName: string;
  transactionId: string;
  date: string;
  paymentMethod: 'PayPal' | 'PayNow';
  description: string;
  lineItems: PaymentReceiptLineItem[];
  serviceCharge: number;
  totalAmount: number;
  orgName: string;
  supportEmail: string;
}

const formatCurrency = (amount: number): string =>
  `$${amount.toFixed(2)}`;

export const PaymentReceiptEmail = ({
  memberName = 'Member',
  transactionId = 'TXN-000000',
  date = '29 Mar 2026',
  paymentMethod = 'PayPal',
  description = 'Event Registration',
  lineItems = [],
  serviceCharge = 0,
  totalAmount = 0,
  orgName = 'CommunityHub',
  supportEmail = 'support@communityhub.org',
}: PaymentReceiptProps) => (
  <Html>
    <Head />
    <Preview>
      Payment Receipt {transactionId} - {formatCurrency(totalAmount)}
    </Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        {/* Header */}
        <Section style={styles.header}>
          <Text style={styles.headerOrgName}>{orgName}</Text>
        </Section>

        {/* Title */}
        <Section style={styles.content}>
          <Heading as="h1" style={styles.title}>
            Payment Receipt
          </Heading>

          <Text style={styles.greeting}>Hi {memberName},</Text>
          <Text style={styles.paragraph}>
            Thank you for your payment. Here is your receipt for your records.
          </Text>

          {/* Receipt Details */}
          <Section style={styles.detailsCard}>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Transaction ID</Column>
              <Column style={styles.detailValue}>{transactionId}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Date</Column>
              <Column style={styles.detailValue}>{date}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Payment Method</Column>
              <Column style={styles.detailValue}>{paymentMethod}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Description</Column>
              <Column style={styles.detailValue}>{description}</Column>
            </Row>
          </Section>

          <Hr style={styles.hr} />

          {/* Itemized Breakdown */}
          <Heading as="h2" style={styles.sectionTitle}>
            Itemized Breakdown
          </Heading>

          <Section style={styles.itemsTable}>
            {/* Table Header */}
            <Row style={styles.itemHeaderRow}>
              <Column style={styles.itemHeaderLabel}>Item</Column>
              <Column style={styles.itemHeaderQty}>Qty</Column>
              <Column style={styles.itemHeaderPrice}>Unit Price</Column>
              <Column style={styles.itemHeaderTotal}>Total</Column>
            </Row>

            {lineItems.map((item, index) => (
              <Row key={index} style={styles.itemRow}>
                <Column style={styles.itemLabel}>{item.label}</Column>
                <Column style={styles.itemQty}>{item.quantity}</Column>
                <Column style={styles.itemPrice}>
                  {formatCurrency(item.unitPrice)}
                </Column>
                <Column style={styles.itemTotal}>
                  {formatCurrency(item.total)}
                </Column>
              </Row>
            ))}

            {serviceCharge > 0 && (
              <Row style={styles.itemRow}>
                <Column style={styles.itemLabel}>Service Charge</Column>
                <Column style={styles.itemQty} />
                <Column style={styles.itemPrice} />
                <Column style={styles.itemTotal}>
                  {formatCurrency(serviceCharge)}
                </Column>
              </Row>
            )}

            <Hr style={styles.hrThin} />

            {/* Total */}
            <Row style={styles.totalRow}>
              <Column style={styles.totalLabel}>Total</Column>
              <Column style={styles.totalQty} />
              <Column style={styles.totalPrice} />
              <Column style={styles.totalValue}>
                {formatCurrency(totalAmount)}
              </Column>
            </Row>
          </Section>

          <Hr style={styles.hr} />

          {/* Payment Confirmed Badge */}
          <Section style={styles.badgeContainer}>
            <Text style={styles.badge}>Payment Confirmed</Text>
          </Section>

          <Text style={styles.paragraph}>
            If you have any questions about this payment, please contact us at{' '}
            <Link href={`mailto:${supportEmail}`} style={styles.link}>
              {supportEmail}
            </Link>
            .
          </Text>
        </Section>

        {/* Footer */}
        <Section style={styles.footer}>
          <Text style={styles.footerOrgName}>{orgName}</Text>
          <Text style={styles.footerText}>
            Support:{' '}
            <Link href={`mailto:${supportEmail}`} style={styles.footerLink}>
              {supportEmail}
            </Link>
          </Text>
          <Text style={styles.footerPowered}>Powered by CommunityHub</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

PaymentReceiptEmail.PreviewProps = {
  memberName: 'Jane Doe',
  transactionId: 'TXN-20260329-001',
  date: '29 Mar 2026',
  paymentMethod: 'PayPal',
  description: 'Annual Community Gala 2026',
  lineItems: [
    { label: 'Adult Ticket', quantity: 2, unitPrice: 15.0, total: 30.0 },
    { label: 'Child Ticket', quantity: 1, unitPrice: 8.0, total: 8.0 },
  ],
  serviceCharge: 1.5,
  totalAmount: 39.5,
  orgName: 'Singapore Community Club',
  supportEmail: 'help@sgcc.org',
} satisfies PaymentReceiptProps;

export default PaymentReceiptEmail;

// ---------------------------------------------------------------------------
// Inline Styles
// ---------------------------------------------------------------------------

const colors = {
  primary: '#0f172a',
  secondary: '#475569',
  muted: '#94a3b8',
  border: '#e2e8f0',
  bg: '#f8fafc',
  white: '#ffffff',
  green: '#16a34a',
  greenBg: '#dcfce7',
  link: '#2563eb',
};

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const styles = {
  body: {
    backgroundColor: colors.bg,
    fontFamily,
    margin: '0',
    padding: '0',
  } as React.CSSProperties,

  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: colors.white,
    borderRadius: '8px',
    overflow: 'hidden' as const,
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  header: {
    backgroundColor: colors.primary,
    padding: '24px 32px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  headerOrgName: {
    color: colors.white,
    fontSize: '20px',
    fontWeight: '700',
    margin: '0',
    letterSpacing: '-0.025em',
  } as React.CSSProperties,

  content: {
    padding: '32px',
  } as React.CSSProperties,

  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: colors.primary,
    margin: '0 0 24px 0',
  } as React.CSSProperties,

  greeting: {
    fontSize: '16px',
    color: colors.primary,
    margin: '0 0 8px 0',
  } as React.CSSProperties,

  paragraph: {
    fontSize: '14px',
    lineHeight: '24px',
    color: colors.secondary,
    margin: '0 0 24px 0',
  } as React.CSSProperties,

  detailsCard: {
    backgroundColor: colors.bg,
    borderRadius: '8px',
    padding: '20px 24px',
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  detailRow: {
    marginBottom: '8px',
  } as React.CSSProperties,

  detailLabel: {
    fontSize: '13px',
    color: colors.muted,
    width: '140px',
    verticalAlign: 'top' as const,
    paddingBottom: '8px',
  } as React.CSSProperties,

  detailValue: {
    fontSize: '14px',
    color: colors.primary,
    fontWeight: '500',
    verticalAlign: 'top' as const,
    paddingBottom: '8px',
  } as React.CSSProperties,

  hr: {
    borderColor: colors.border,
    margin: '24px 0',
  } as React.CSSProperties,

  hrThin: {
    borderColor: colors.border,
    margin: '12px 0',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 16px 0',
  } as React.CSSProperties,

  itemsTable: {
    width: '100%',
  } as React.CSSProperties,

  itemHeaderRow: {
    borderBottom: `2px solid ${colors.border}`,
    marginBottom: '8px',
  } as React.CSSProperties,

  itemHeaderLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    paddingBottom: '8px',
    width: '40%',
  } as React.CSSProperties,

  itemHeaderQty: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    paddingBottom: '8px',
    width: '15%',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  itemHeaderPrice: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    paddingBottom: '8px',
    width: '22%',
    textAlign: 'right' as const,
  } as React.CSSProperties,

  itemHeaderTotal: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    paddingBottom: '8px',
    width: '23%',
    textAlign: 'right' as const,
  } as React.CSSProperties,

  itemRow: {
    marginBottom: '4px',
  } as React.CSSProperties,

  itemLabel: {
    fontSize: '14px',
    color: colors.primary,
    paddingTop: '8px',
    paddingBottom: '8px',
    width: '40%',
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  itemQty: {
    fontSize: '14px',
    color: colors.secondary,
    paddingTop: '8px',
    paddingBottom: '8px',
    width: '15%',
    textAlign: 'center' as const,
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  itemPrice: {
    fontSize: '14px',
    color: colors.secondary,
    paddingTop: '8px',
    paddingBottom: '8px',
    width: '22%',
    textAlign: 'right' as const,
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  itemTotal: {
    fontSize: '14px',
    color: colors.primary,
    fontWeight: '500',
    paddingTop: '8px',
    paddingBottom: '8px',
    width: '23%',
    textAlign: 'right' as const,
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  totalRow: {
    marginTop: '4px',
  } as React.CSSProperties,

  totalLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.primary,
    paddingTop: '8px',
    width: '40%',
  } as React.CSSProperties,

  totalQty: {
    width: '15%',
    paddingTop: '8px',
  } as React.CSSProperties,

  totalPrice: {
    width: '22%',
    paddingTop: '8px',
  } as React.CSSProperties,

  totalValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'right' as const,
    paddingTop: '8px',
    width: '23%',
  } as React.CSSProperties,

  badgeContainer: {
    textAlign: 'center' as const,
    margin: '0 0 24px 0',
  } as React.CSSProperties,

  badge: {
    display: 'inline-block',
    backgroundColor: colors.greenBg,
    color: colors.green,
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 24px',
    borderRadius: '9999px',
    margin: '0',
  } as React.CSSProperties,

  link: {
    color: colors.link,
    textDecoration: 'underline',
  } as React.CSSProperties,

  footer: {
    backgroundColor: colors.bg,
    padding: '24px 32px',
    textAlign: 'center' as const,
    borderTop: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  footerOrgName: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 4px 0',
  } as React.CSSProperties,

  footerText: {
    fontSize: '12px',
    color: colors.muted,
    margin: '0 0 8px 0',
  } as React.CSSProperties,

  footerLink: {
    color: colors.muted,
    textDecoration: 'underline',
  } as React.CSSProperties,

  footerPowered: {
    fontSize: '11px',
    color: colors.muted,
    margin: '0',
  } as React.CSSProperties,
};
