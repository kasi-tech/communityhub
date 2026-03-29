import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Preview,
  Heading,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

export interface WelcomeEmailProps {
  memberName: string;
  orgName: string;
  memberNumber: string;
  tierName: string;
  dashboardUrl: string;
}

export const WelcomeEmail = ({
  memberName = 'Member',
  orgName = 'CommunityHub',
  memberNumber = 'M-000000',
  tierName = 'Standard',
  dashboardUrl = 'https://app.communityhub.org/dashboard',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Welcome to {orgName}, {memberName}!
    </Preview>
    <Body style={styles.body}>
      <Container style={styles.container}>
        {/* Header */}
        <Section style={styles.header}>
          <Text style={styles.headerOrgName}>{orgName}</Text>
        </Section>

        <Section style={styles.content}>
          <Heading as="h1" style={styles.title}>
            Welcome to {orgName}!
          </Heading>

          <Text style={styles.greeting}>Hi {memberName},</Text>
          <Text style={styles.paragraph}>
            Congratulations! Your membership application has been approved. We are thrilled to have
            you as part of our community. Below are your membership details.
          </Text>

          {/* Membership Details Card */}
          <Section style={styles.detailsCard}>
            <Heading as="h2" style={styles.cardTitle}>
              Membership Details
            </Heading>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Member Number</Column>
              <Column style={styles.detailValue}>{memberNumber}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Membership Tier</Column>
              <Column style={styles.detailValue}>{tierName}</Column>
            </Row>
            <Row style={styles.detailRow}>
              <Column style={styles.detailLabel}>Status</Column>
              <Column style={styles.detailValueActive}>Active</Column>
            </Row>
          </Section>

          <Hr style={styles.hr} />

          <Text style={styles.paragraph}>
            You can now browse upcoming events, connect with other members, and take advantage of
            all the benefits your membership offers.
          </Text>

          {/* CTA Button */}
          <Section style={styles.ctaContainer}>
            <Link href={dashboardUrl} style={styles.ctaButton}>
              Go to Dashboard
            </Link>
          </Section>

          <Text style={styles.paragraphSmall}>
            Or copy and paste this link into your browser:{' '}
            <Link href={dashboardUrl} style={styles.link}>
              {dashboardUrl}
            </Link>
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

WelcomeEmail.PreviewProps = {
  memberName: 'Jane Doe',
  orgName: 'Singapore Community Club',
  memberNumber: 'SCC-2026-0042',
  tierName: 'Family Premium',
  dashboardUrl: 'https://sgcc.communityhub.org/dashboard',
} satisfies WelcomeEmailProps;

export default WelcomeEmail;

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

  paragraphSmall: {
    fontSize: '12px',
    lineHeight: '20px',
    color: colors.muted,
    margin: '16px 0 0 0',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  detailsCard: {
    backgroundColor: colors.bg,
    borderRadius: '8px',
    padding: '20px 24px',
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 16px 0',
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

  detailValueActive: {
    fontSize: '14px',
    color: colors.green,
    fontWeight: '600',
    verticalAlign: 'top' as const,
    paddingBottom: '8px',
  } as React.CSSProperties,

  hr: {
    borderColor: colors.border,
    margin: '24px 0',
  } as React.CSSProperties,

  ctaContainer: {
    textAlign: 'center' as const,
    margin: '8px 0',
  } as React.CSSProperties,

  ctaButton: {
    display: 'inline-block',
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: '14px',
    fontWeight: '600',
    padding: '12px 32px',
    borderRadius: '6px',
    textDecoration: 'none',
  } as React.CSSProperties,

  link: {
    color: colors.link,
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
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
