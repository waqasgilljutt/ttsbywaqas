import nodemailer from 'nodemailer';
import { OWNER_EMAIL } from './user-store';

export interface OTPRecord {
  email: string;
  code: string;
  expiresAt: number;
  purpose: 'signup' | 'reset-password';
  name?: string;
  password?: string;
  createdAt: string;
}

// In-memory active OTP store
const activeOTPs: Map<string, OTPRecord> = new Map();

// Helper to get all active OTPs for the Admin Panel
export function getActiveOTPs(): OTPRecord[] {
  const now = Date.now();
  // Filter out expired ones older than 30 minutes
  const list: OTPRecord[] = [];
  activeOTPs.forEach((record, key) => {
    if (now - record.expiresAt < 1800000) {
      list.push(record);
    } else {
      activeOTPs.delete(key);
    }
  });
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateOTPCode(): string {
  // Generate random 6-digit number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOTPRecord(record: OTPRecord): void {
  activeOTPs.set(record.email.toLowerCase(), record);
}

export function getOTPRecord(email: string): OTPRecord | undefined {
  const record = activeOTPs.get(email.toLowerCase());
  if (!record) return undefined;
  if (Date.now() > record.expiresAt) {
    activeOTPs.delete(email.toLowerCase());
    return undefined;
  }
  return record;
}

export function deleteOTPRecord(email: string): void {
  activeOTPs.delete(email.toLowerCase());
}

const DEFAULT_SMTP_EMAIL = 'oc8750714@gmail.com';
const DEFAULT_SMTP_PASSWORD = 'vrleilglacauujwj';

// Nodemailer transport setup
function getEmailTransporter() {
  const smtpEmail = (process.env.SMTP_EMAIL || process.env.GMAIL_USER || DEFAULT_SMTP_EMAIL).trim();
  const smtpPass = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD || DEFAULT_SMTP_PASSWORD).trim().replace(/\s+/g, '');

  if (!smtpPass) {
    return null;
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: smtpEmail,
        pass: smtpPass,
      },
    });
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpEmail,
      pass: smtpPass,
    },
  });
}

export async function sendOTPEmail(
  recipientEmail: string,
  code: string,
  purpose: 'signup' | 'reset-password',
  name?: string
): Promise<{ success: boolean; deliveredViaSMTP: boolean; error?: string }> {
  const title =
    purpose === 'signup'
      ? 'Verify Your Account - TTS bY Waqas Gill'
      : 'Reset Your Password - TTS bY Waqas Gill';

  const actionText =
    purpose === 'signup'
      ? 'Welcome to TTS bY Waqas Gill by EmpireNexs! Use the verification code below to verify your Gmail and activate your free account.'
      : 'We received a request to reset the password for your TTS bY Waqas Gill account. Use the code below to set a new password.';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { text-align: center; margin-bottom: 28px; }
          .badge { display: inline-block; padding: 4px 12px; background-color: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11px; font-weight: 700; border-radius: 999px; margin-bottom: 12px; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 6px; }
          .code-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; text-align: center; margin: 28px 0; }
          .code { font-family: 'Courier New', monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #2563eb; margin: 0; }
          .expiry { font-size: 11px; color: #94a3b8; margin-top: 8px; font-weight: 600; }
          .content { font-size: 13px; line-height: 1.6; color: #475569; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; }
          .footer a { color: #2563eb; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">EmpireNexs Neural Speech</div>
            <h1 class="title">TTS bY Waqas Gill</h1>
            <p class="subtitle">${title}</p>
          </div>

          <div class="content">
            <p>Hello${name ? ` <strong>${name}</strong>` : ''},</p>
            <p>${actionText}</p>
          </div>

          <div class="code-box">
            <div class="code">${code}</div>
            <div class="expiry">Valid for 10 minutes only</div>
          </div>

          <div class="content">
            <p style="font-size: 11px; color: #64748b;">
              If you did not request this verification code, please disregard this email. Your account remains secure.
            </p>
          </div>

          <div class="footer">
            <p>
              Developed with precision by <a href="https://www.facebook.com/mwaqasgillcs/" target="_blank">Waqas Gill</a><br>
              An EmpireNexs Innovation • Free Studio Grade Text-to-Speech Platform
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const transporter = getEmailTransporter();

  if (!transporter) {
    console.warn(
      `[Email Service] Google App Password (SMTP_PASSWORD) is not configured in environment. Cannot deliver email to ${recipientEmail}`
    );
    return {
      success: false,
      deliveredViaSMTP: false,
      error:
        'Email delivery is not yet configured. Please set SMTP_PASSWORD (Google App Password) in your .env.local or Vercel Environment Variables.',
    };
  }

  try {
    const fromEmail = (process.env.SMTP_EMAIL || process.env.GMAIL_USER || DEFAULT_SMTP_EMAIL).trim();
    await transporter.sendMail({
      from: `"TTS bY Waqas Gill" <${fromEmail}>`,
      to: recipientEmail,
      subject: `${code} is your verification code - TTS bY Waqas Gill`,
      html: htmlContent,
    });
    console.log(`[Email Service] Verification email successfully delivered via Gmail SMTP to ${recipientEmail}`);
    return { success: true, deliveredViaSMTP: true };
  } catch (err: unknown) {
    console.error('[Email Service] SMTP dispatch error:', err);
    const errorMsg = err instanceof Error ? err.message : 'SMTP delivery failed';
    return {
      success: false,
      deliveredViaSMTP: false,
      error: `Could not send verification email to Gmail: ${errorMsg}`,
    };
  }
}
