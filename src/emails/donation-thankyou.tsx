import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
  Heading,
} from '@react-email/components';
import * as React from 'react';

export interface DonationThankYouProps {
  donorName: string;
  amount: number;
  orgName: string;
  message?: string;
}

const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

export const DonationThankYouEmail = ({
  donorName = 'Donor',
  amount = 0,
  orgName = 'CommunityHub',
  message,
}: DonationThankYouProps) => (
  <Html>
    <Head />
    <Preview>
      Thank you for your {formatCurrency(amount)} donation to {orgName}!
    </Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        {/* Header */}
        <Section style={styles.header}>
          <Text style={styles.headerOrgName}>{orgName}</Text>
        </Section>

        <Section style={styles.content}>
          <Heading as="h1" style={styles.title}>
            Thank You for Your Generosity!
          </Heading>

          <Text style={styles.greeting}>Hi {donorName},</Text>
          <Text style={styles.paragraph}>
            We sincerely appreciate your generous donation to {orgName}. Your contribution makes a
            real difference in our community.
          </Text>

          {/* Donation Amount Card */}
          <Section style={styles.amountCard}>
            <Text style={styles.amountLabel}>Donation Amount</Text>
            <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
          </Section>

          {/* Personal Message */}
          {message && (
            <>
              <Hr style={styles.hr} />
              <Section style={styles.messageCard}>
                <Text style={styles.messageLabel}>Your Message</Text>
                <Text style={styles.messageText}>{message}</Text>
              </Section>
            </>
          )}

          <Hr style={styles.hr} />

          <Text style={styles.paragraph}>
            Your support helps us organize community events, maintain our facilities, and provide
            services to our members. Every contribution counts, and we are grateful for yours.
          </Text>

          <Text style={styles.paragraphSmall}>
            This email serves as a confirmation of your donation. Please retain it for your records.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={styles.footer}>
          <Text style={styles.footerOrgName}>{orgName}</Text>
          <Text style={styles.footerPowered}>Powered by CommunityHub</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

DonationThankYouEmail.PreviewProps = {
  donorName: 'Jane Doe',
  amount: 50.0,
  orgName: 'Singapore Community Club',
  message: 'Keep up the wonderful work! Looking forward to the next community gala.',
} satisfies DonationThankYouProps;

export default DonationThankYouEmail;

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
    textAlign: 'center' as const,
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

  paragraphSmall: {
    fontSize: '12px',
    lineHeight: '20px',
    color: colors.muted,
    margin: '0',
  } as React.CSSProperties,

  amountCard: {
    backgroundColor: colors.greenBg,
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    border: `1px solid #bbf7d0`,
  } as React.CSSProperties,

  amountLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: colors.green,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 8px 0',
  } as React.CSSProperties,

  amountValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: colors.green,
    margin: '0',
    letterSpacing: '-0.025em',
  } as React.CSSProperties,

  hr: {
    borderColor: colors.border,
    margin: '24px 0',
  } as React.CSSProperties,

  messageCard: {
    backgroundColor: colors.bg,
    borderRadius: '8px',
    padding: '16px 20px',
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  messageLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 8px 0',
  } as React.CSSProperties,

  messageText: {
    fontSize: '14px',
    color: colors.secondary,
    lineHeight: '22px',
    margin: '0',
    fontStyle: 'italic' as const,
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

  footerPowered: {
    fontSize: '11px',
    color: colors.muted,
    margin: '0',
  } as React.CSSProperties,
};
