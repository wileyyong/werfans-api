import app from 'app';
import { EmailBuilder, EmailType, EmailVerificationPayload } from '../../domains/email';

const { config: { app: { title } } } = app;

const email: EmailBuilder<EmailVerificationPayload> = {
  name: EmailType.EmailVerification,
  templateName: 'email-verification',
  buildData(payload: EmailVerificationPayload) {
    return {
      email: payload.email,
      appTitle: title,
      url: `${payload.baseUrl}?token=${payload.token}`,
    };
  },
  buildSubject() {
    return `Welcome to ${title} - User account activation`;
  },
};

export default email;
