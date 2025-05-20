/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
  Link,
} from '@react-email/components';
import * as React from 'react';
import { format } from 'date-fns';

interface EventRegistrationEmailProps {
  firstName: string;
  lastName: string;
  eventName: string;
  eventLocation: string;
  startDateTime: string;
  endDateTime: string;
  price: string;
  isFree: boolean;
  description: string;
  tags?: string[];
  maxRegistrations?: number;
}

export const EventRegistrationEmail = ({
  firstName,
  lastName,
  eventName,
  eventLocation,
  startDateTime,
  endDateTime,
  price,
  isFree,
  description,
  tags,
  maxRegistrations,
}: EventRegistrationEmailProps) => {
  const formattedStartDate = format(new Date(startDateTime), "EEEE, MMMM d, yyyy 'at' h:mm a");
  const formattedEndDate = format(new Date(endDateTime), "EEEE, MMMM d, yyyy 'at' h:mm a");

  return (
    <Html>
      <Head />
      <Preview>Welcome to {eventName} - Your Registration is Confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>Carolinian Events</Text>
            <Text style={tagline}>University of San Carlos</Text>
          </Section>

          <Section style={contentSection}>
            <Heading style={h1}>Welcome, {firstName} {lastName}!</Heading>
            
            <Text style={text}>
              Thank you for registering for {eventName}. We're thrilled to have you join us for this exciting event!
            </Text>

            <Section style={highlightBox}>
              <Text style={highlightText}>
                Your registration has been successfully confirmed. Please keep this email for your records.
              </Text>
            </Section>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Event Details</Text>
              <Text style={detailsText}>
                <strong>Event Name:</strong> {eventName}<br />
                <strong>Start Date & Time:</strong> {formattedStartDate}<br />
                <strong>End Date & Time:</strong> {formattedEndDate}<br />
                <strong>Location:</strong> {eventLocation}<br />
                <strong>Price:</strong> {isFree ? "FREE" : `₱${price}`}<br />
                {maxRegistrations && (
                  <><strong>Maximum Registrations:</strong> {maxRegistrations}<br /></>
                )}
                {tags && tags.length > 0 && (
                  <><strong>Categories:</strong> {tags.join(", ")}<br /></>
                )}
              </Text>
            </Section>

            <Section style={descriptionBox}>
              <Text style={descriptionTitle}>Event Description</Text>
              <Text style={descriptionText}>
                {description}
              </Text>
            </Section>

            <Text style={text}>
              To ensure you have the best experience, please note the following:
            </Text>

            <Section style={infoBox}>
              <Text style={infoText}>
                • Please arrive 15 minutes before the event starts<br />
                • Bring a valid ID for check-in<br />
                • Check your email for any updates or changes<br />
                • Bring your own materials if required
              </Text>
            </Section>

            <Section style={contactBox}>
              <Text style={contactTitle}>Need Help?</Text>
              <Text style={contactText}>
                If you have any questions or need to make changes to your registration, please contact us at:<br />
                <Link href="mailto:events@usc.edu.ph" style={contactLink}>
                  events@usc.edu.ph
                </Link>
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button
                href="https://carolinian-events.vercel.app/events"
                style={button}
              >
                View All Events
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Best regards,<br />
              The Carolinian Events Team
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              © 2024 Carolinian Events. All rights reserved.<br />
              <Link href="https://carolinian-events.vercel.app" style={footerLink}>
                Visit our website
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const logoSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
  backgroundColor: '#1a1a1a',
  borderRadius: '8px 8px 0 0',
};

const logo = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
};

const tagline = {
  fontSize: '14px',
  color: '#ffffff',
  margin: '4px 0 0',
  opacity: 0.8,
};

const contentSection = {
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '0 0 8px 8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const highlightBox = {
  backgroundColor: '#e6f3ff',
  padding: '16px',
  borderRadius: '6px',
  margin: '24px 0',
  border: '1px solid #b3d7ff',
};

const highlightText = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
  fontWeight: '500',
};

const detailsBox = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '6px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
};

const detailsTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const detailsText = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const descriptionBox = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '6px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
};

const descriptionTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const descriptionText = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
};

const infoBox = {
  backgroundColor: '#f0f7ff',
  padding: '24px',
  borderRadius: '6px',
  margin: '24px 0',
  border: '1px solid #dbeafe',
};

const infoText = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const contactBox = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '6px',
  margin: '24px 0',
  border: '1px solid #e2e8f0',
};

const contactTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const contactText = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
};

const contactLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
};

const footerSection = {
  textAlign: 'center' as const,
  marginTop: '32px',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const footerLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '500',
};

export default EventRegistrationEmail; 