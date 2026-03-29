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

export interface EventConfirmationProps {
  memberName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  attendeeAdults: number;
  attendeeChildren: number;
  totalAmount: number;
  qrCodeUrl?: string;
  calendarLink?: string;
  orgName: string;
}

const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

export const EventConfirmationEmail = ({
  memberName = 'Member',
  eventName = 'Community Event',
  eventDate = '29 Mar 2026',
  eventTime = '10:00 AM - 2:00 PM',
  venue = 'Community Hall',
  attendeeAdults = 1,
  attendeeChildren = 0,
  totalAmount = 0,
  qrCodeUrl,
  calendarLink,
  orgName = 'CommunityHub',
}: EventConfirmationProps) => {
  const totalAttendees = attendeeAdults + attendeeChildren;

  return (
    <Html>
      <Head />
      <Preview>
        Registration Confirmed: {eventName} on {eventDate}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.headerOrgName}>{orgName}</Text>
          </Section>

          <Section style={styles.content}>
            <Section style={styles.badgeContainer}>
              <Text style={styles.badge}>Registration Confirmed</Text>
            </Section>

            <Heading as="h1" style={styles.title}>
              {eventName}
            </Heading>

            <Text style={styles.greeting}>Hi {memberName},</Text>
            <Text style={styles.paragraph}>
              Your registration has been confirmed. We look forward to seeing you there!
            </Text>

            {/* Event Details Card */}
            <Section style={styles.detailsCard}>
              <Heading as="h2" style={styles.cardTitle}>
                Event Details
              </Heading>
              <Row style={styles.detailRow}>
                <Column style={styles.detailLabel}>Date</Column>
                <Column style={styles.detailValue}>{eventDate}</Column>
              </Row>
              <Row style={styles.detailRow}>
                <Column style={styles.detailLabel}>Time</Column>
                <Column style={styles.detailValue}>{eventTime}</Column>
              </Row>
              <Row style={styles.detailRow}>
                <Column style={styles.detailLabel}>Venue</Column>
                <Column style={styles.detailValue}>{venue}</Column>
              </Row>
            </Section>

            <Hr style={styles.hr} />

            {/* Attendee Summary */}
            <Heading as="h2" style={styles.sectionTitle}>
              Attendee Summary
            </Heading>
            <Section style={styles.summaryCard}>
              <Row style={styles.summaryRow}>
                <Column style={styles.summaryLabel}>Adults</Column>
                <Column style={styles.summaryValue}>{attendeeAdults}</Column>
              </Row>
              {attendeeChildren > 0 && (
                <Row style={styles.summaryRow}>
                  <Column style={styles.summaryLabel}>Children</Column>
                  <Column style={styles.summaryValue}>{attendeeChildren}</Column>
                </Row>
              )}
              <Row style={styles.summaryRow}>
                <Column style={styles.summaryLabel}>Total Attendees</Column>
                <Column style={styles.summaryValue}>{totalAttendees}</Column>
              </Row>
              <Hr style={styles.hrThin} />
              <Row style={styles.summaryRow}>
                <Column style={styles.totalLabel}>Amount Paid</Column>
                <Column style={styles.totalValue}>{formatCurrency(totalAmount)}</Column>
              </Row>
            </Section>

            {/* QR Code */}
            {qrCodeUrl && (
              <>
                <Hr style={styles.hr} />
                <Section style={styles.qrSection}>
                  <Text style={styles.qrText}>Show this QR code at check-in:</Text>
                  <Img
                    src={qrCodeUrl}
                    width="160"
                    height="160"
                    alt="Check-in QR Code"
                    style={styles.qrImage}
                  />
                </Section>
              </>
            )}

            {/* Add to Calendar */}
            {calendarLink && (
              <Section style={styles.ctaContainer}>
                <Link href={calendarLink} style={styles.ctaButton}>
                  Add to Calendar
                </Link>
              </Section>
            )}
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
};

EventConfirmationEmail.PreviewProps = {
  memberName: 'Jane Doe',
  eventName: 'Annual Community Gala 2026',
  eventDate: 'Saturday, 15 Apr 2026',
  eventTime: '6:00 PM - 10:00 PM',
  venue: 'Grand Ballroom, Marina Bay Sands',
  attendeeAdults: 2,
  attendeeChildren: 1,
  totalAmount: 39.5,
  qrCodeUrl: 'https://via.placeholder.com/160x160.png?text=QR',
  calendarLink: 'https://calendar.google.com/calendar/render?action=TEMPLATE',
  orgName: 'Singapore Community Club',
} satisfies EventConfirmationProps;

export default EventConfirmationEmail;

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

  badgeContainer: {
    textAlign: 'center' as const,
    margin: '0 0 16px 0',
  } as React.CSSProperties,

  badge: {
    display: 'inline-block',
    backgroundColor: colors.greenBg,
    color: colors.green,
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 16px',
    borderRadius: '9999px',
    margin: '0',
  } as React.CSSProperties,

  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: colors.primary,
    margin: '0 0 20px 0',
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
    width: '100px',
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
    margin: '0 0 12px 0',
  } as React.CSSProperties,

  summaryCard: {
    backgroundColor: colors.bg,
    borderRadius: '8px',
    padding: '16px 24px',
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  summaryRow: {
    marginBottom: '4px',
  } as React.CSSProperties,

  summaryLabel: {
    fontSize: '14px',
    color: colors.secondary,
    paddingBottom: '8px',
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  summaryValue: {
    fontSize: '14px',
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'right' as const,
    paddingBottom: '8px',
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  totalLabel: {
    fontSize: '15px',
    fontWeight: '700',
    color: colors.primary,
    paddingTop: '4px',
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  totalValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'right' as const,
    paddingTop: '4px',
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  qrSection: {
    textAlign: 'center' as const,
  } as React.CSSProperties,

  qrText: {
    fontSize: '13px',
    color: colors.muted,
    margin: '0 0 12px 0',
  } as React.CSSProperties,

  qrImage: {
    margin: '0 auto',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  ctaContainer: {
    textAlign: 'center' as const,
    margin: '24px 0 0 0',
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
