import { Resend } from 'resend';
import EventRegistrationEmail from '@/emails/EventRegistrationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEventRegistrationEmail({
  email,
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
}: {
  email: string;
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
}) {
  try {
    console.log('Attempting to send email to:', email);
    console.log('Using Resend API key:', process.env.RESEND_API_KEY ? 'API key exists' : 'No API key found');

    const data = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: email,
      subject: `Registration Confirmed: ${eventName}`,
      react: EventRegistrationEmail({
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
      }),
    });

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    return { success: false, error };
  }
} 