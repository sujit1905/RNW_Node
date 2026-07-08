import nodemailer from 'nodemailer';

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

let transporter;

const envValue = (key) => String(process.env[key] || '').trim();

export const isEmailConfigured = () =>
  Boolean(envValue('EMAIL_FROM') && envValue('SMTP_HOST') && envValue('SMTP_USER') && envValue('SMTP_PASS'));

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!isEmailConfigured()) {
    const requiredKeys = ['EMAIL_FROM', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
    const missing = requiredKeys.filter((key) => !envValue(key));
    console.warn(`[email] SMTP not configured. Missing: ${missing.join(', ')}. Skipping email send.`);
    return { skipped: true };
  }

  if (!to) {
    console.warn('[email] Missing recipient email. Skipping email send.');
    return { skipped: true };
  }

  const mailOptions = {
    from: envValue('EMAIL_FROM'),
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    return { skipped: false, messageId: info.messageId };
  } catch (error) {
    console.error(`[email] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};
