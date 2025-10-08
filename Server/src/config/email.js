import nodemailer from 'nodemailer';

// Gmail-friendly transporter with dynamic security based on port
const resolvedHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const resolvedPort = Number(process.env.EMAIL_PORT) || 587;
const useSecure = resolvedPort === 465; // Gmail SSL uses 465

// If EMAIL_SERVICE is set to 'gmail', prefer nodemailer's service shortcut
const baseOptions =
  process.env.EMAIL_SERVICE === 'gmail'
    ? {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // App Password required
        },
      }
    : {
        host: resolvedHost,
        port: resolvedPort,
        secure: useSecure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // App Password required
        },
        requireTLS: !useSecure, // STARTTLS on 587
        tls: {
          minVersion: 'TLSv1.2',
          ciphers: 'TLSv1.2',
        },
      };

export const transporter = nodemailer.createTransport({
  ...baseOptions,
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

// Verify connection configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error(
      '❌ Email server connection failed:',
      error?.message || error
    );
    console.error(
      '   Using host:',
      resolvedHost,
      'port:',
      resolvedPort,
      'secure:',
      useSecure,
      'service:',
      process.env.EMAIL_SERVICE || 'smtp'
    );
    return false;
  }
}

export default transporter;
