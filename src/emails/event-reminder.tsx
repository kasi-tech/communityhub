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

export interface EventReminderProps {
  memberName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  reminderType: '48h' | '2h';
  orgName: string;
}

export const EventReminderEmail = ({
  memberName = 'Member',
  eventName = 'Community Event',
  eventDate = '29 Mar 2026',
  eventTime = '10:00 AM',
  venue = 'Community Hall',
  reminderType = '48h',
  orgName = 'CommunityHub',
}: EventReminderProps) => {
  const isUrgent = reminderType === '2h';
  const reminderLabel = isUrgent ? 'Starting in 2 hours' : 'Coming up in 2 days';
  const previewText = isUrgent
    ? `Happening soon: ${eventName} starts in 2 hours!`
    : `Reminder: ${eventName} is in 2 days`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.headerOrgName}>{orgName}</Text>
          </Section>

          <Section style={styles.content}>
            {/* Urgency Badge */}
            <Section style={styles.badgeContainer}>
              <Text style={isUrgent ? styles.badgeUrgent : styles.badge}>{reminderLabel}</Text>
            </Section>

            <Heading as="h1" style={styles.title}>
              {eventName}
            </Heading>

            <Text style={styles.greeting}>Hi {memberName},</Text>
            <Text style={styles.paragraph}>
              {isUrgent
                ? 'Just a quick heads-up — your event is starting very soon. Make sure you are on your way!'
                : 'This is a friendly reminder about your upcoming event. Mark your calendar and we will see you there!'}
            </Text>

            {/* Event Details Card */}
            <Section style={styles.detailsCard}>
              <Row style={styles.detailRow}>
                <Column style={styles.detailIcon}>
                  <Text style={styles.iconText}>&#x1F4C5;</Text>
                </Column>
                <Column style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{eventDate}</Text>
                </Column>
              </Row>
              <Row style={styles.detailRow}>
                <Column style={styles.detailIcon}>
                  <Text style={styles.iconText}>&#x1F552;</Text>
                </Column>
                <Column style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{eventTime}</Text>
                </Column>
              </Row>
              <Row style={styles.detailRow}>
                <Column style={styles.detailIcon}>
                  <Text style={styles.iconText}>&#x1F4CD;</Text>
                </Column>
                <Column style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Venue</Text>
                  <Text style={styles.detailValue}>{venue}</Text>
                </Column>
              </Row>
            </Section>

            {/* Map Link */}
            <Section style={styles.ctaContainer}>
              <Link href={googleMapsUrl} style={styles.ctaButton}>
                View on Map
              </Link>
            </Section>
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

EventReminderEmail.PreviewProps = {
  memberName: 'Jane Doe',
  eventName: 'Annual Community Gala 2026',
  eventDate: 'Saturday, 15 Apr 2026',
  eventTime: '6:00 PM',
  venue: 'Grand Ballroom, Marina Bay Sands, Singapore',
  reminderType: '48h',
  orgName: 'Singapore Community Club',
} satisfies EventReminderProps;

export default EventReminderEmail;

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
  amber: '#d97706',
  amberBg: '#fef3c7',
  red: '#dc2626',
  redBg: '#fee2e2',
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
    backgroundColor: colors.amberBg,
    color: colors.amber,
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 16px',
    borderRadius: '9999px',
    margin: '0',
  } as React.CSSProperties,

  badgeUrgent: {
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

  detailRow: {
    marginBottom: '12px',
  } as React.CSSProperties,

  detailIcon: {
    width: '36px',
    verticalAlign: 'top' as const,
    paddingTop: '2px',
  } as React.CSSProperties,

  iconText: {
    fontSize: '18px',
    margin: '0',
  } as React.CSSProperties,

  detailContent: {
    verticalAlign: 'top' as const,
  } as React.CSSProperties,

  detailLabel: {
    fontSize: '12px',
    color: colors.muted,
    margin: '0',
    lineHeight: '16px',
  } as React.CSSProperties,

  detailValue: {
    fontSize: '15px',
    color: colors.primary,
    fontWeight: '500',
    margin: '2px 0 0 0',
    lineHeight: '22px',
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
