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

export interface ApplicationStatusProps {
  memberName: string;
  status: 'approved' | 'rejected';
  orgName: string;
  memberNumber?: string;
  rejectionReason?: string;
  supportEmail: string;
}

export const ApplicationStatusEmail = ({
  memberName = 'Applicant',
  status = 'approved',
  orgName = 'CommunityHub',
  memberNumber,
  rejectionReason,
  supportEmail = 'support@communityhub.org',
}: ApplicationStatusProps) => {
  const isApproved = status === 'approved';

  return (
    <Html>
      <Head />
      <Preview>
        {isApproved
          ? `Your ${orgName} membership has been approved!`
          : `Update on your ${orgName} application`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.headerOrgName}>{orgName}</Text>
          </Section>

          <Section style={styles.content}>
            {/* Status Badge */}
            <Section style={styles.badgeContainer}>
              <Text style={isApproved ? styles.badgeApproved : styles.badgeRejected}>
                {isApproved ? 'Application Approved' : 'Application Not Approved'}
              </Text>
            </Section>

            <Heading as="h1" style={styles.title}>
              {isApproved ? 'Welcome Aboard!' : 'Application Update'}
            </Heading>

            <Text style={styles.greeting}>Hi {memberName},</Text>

            {isApproved ? (
              <>
                <Text style={styles.paragraph}>
                  We are pleased to inform you that your membership application to {orgName} has been
                  approved. Welcome to the community!
                </Text>

                {memberNumber && (
                  <Section style={styles.detailsCard}>
                    <Row style={styles.detailRow}>
                      <Column style={styles.detailLabel}>Member Number</Column>
                      <Column style={styles.detailValue}>{memberNumber}</Column>
                    </Row>
                    <Row style={styles.detailRow}>
                      <Column style={styles.detailLabel}>Status</Column>
                      <Column style={styles.detailValueActive}>Active</Column>
                    </Row>
                  </Section>
                )}

                <Text style={styles.paragraph}>
                  You can now log in to your dashboard, browse events, and start connecting with
                  other members.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.paragraph}>
                  Thank you for your interest in joining {orgName}. After careful review, we are
                  unable to approve your application at this time.
                </Text>

                {rejectionReason && (
                  <Section style={styles.reasonCard}>
                    <Text style={styles.reasonLabel}>Reason</Text>
                    <Text style={styles.reasonText}>{rejectionReason}</Text>
                  </Section>
                )}

                <Text style={styles.paragraph}>
                  If you believe this decision was made in error or would like more information,
                  please do not hesitate to reach out to our support team.
                </Text>
              </>
            )}

            <Hr style={styles.hr} />

            <Text style={styles.paragraph}>
              If you have any questions, contact us at{' '}
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
};

ApplicationStatusEmail.PreviewProps = {
  memberName: 'Jane Doe',
  status: 'approved',
  orgName: 'Singapore Community Club',
  memberNumber: 'SCC-2026-0042',
  supportEmail: 'help@sgcc.org',
} satisfies ApplicationStatusProps;

export default ApplicationStatusEmail;

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
  red: '#dc2626',
  redBg: '#fee2e2',
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

  badgeContainer: {
    textAlign: 'center' as const,
    margin: '0 0 16px 0',
  } as React.CSSProperties,

  badgeApproved: {
    display: 'inline-block',
    backgroundColor: colors.greenBg,
    color: colors.green,
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 16px',
    borderRadius: '9999px',
    margin: '0',
  } as React.CSSProperties,

  badgeRejected: {
    display: 'inline-block',
    backgroundColor: colors.redBg,
    color: colors.red,
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 16px',
    borderRadius: '9999px',
    margin: '0',
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

  detailsCard: {
    backgroundColor: colors.bg,
    borderRadius: '8px',
    padding: '20px 24px',
    border: `1px solid ${colors.border}`,
    marginBottom: '24px',
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

  reasonCard: {
    backgroundColor: colors.redBg,
    borderRadius: '8px',
    padding: '16px 20px',
    border: `1px solid #fecaca`,
    marginBottom: '24px',
  } as React.CSSProperties,

  reasonLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.red,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 6px 0',
  } as React.CSSProperties,

  reasonText: {
    fontSize: '14px',
    color: '#991b1b',
    lineHeight: '22px',
    margin: '0',
  } as React.CSSProperties,

  hr: {
    borderColor: colors.border,
    margin: '24px 0',
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
