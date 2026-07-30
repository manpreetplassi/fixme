import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ReminderDigest = {
  userEmail: string;
  items: Array<{ title: string; time_block: string | null; priority: string }>;
};

@Injectable()
export class TodayRemindersService {
  constructor(private readonly config: ConfigService) {}

  getDeliveryStatus() {
    const host = this.config.get<string>('SMTP_HOST');
    const to = this.config.get<string>('REMINDER_EMAIL_TO');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('REMINDER_EMAIL_FROM') ?? user;

    return {
      configured: Boolean(host && user && pass && from),
      missing: [
        !host ? 'SMTP_HOST' : null,
        !user ? 'SMTP_USER' : null,
        !pass ? 'SMTP_PASS' : null,
        !from ? 'REMINDER_EMAIL_FROM' : null,
      ].filter(Boolean),
      override_recipient_configured: Boolean(to),
    };
  }

  async sendDigest(digest: ReminderDigest) {
    if (digest.items.length === 0) return { sent: false, skipped: true, reason: 'no_overdue_items' };

    const host = this.config.get<string>('SMTP_HOST');
    const to = this.config.get<string>('REMINDER_EMAIL_TO') ?? digest.userEmail;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('REMINDER_EMAIL_FROM') ?? user;

    if (!host || !to || !user || !pass || !from) {
      return { sent: false, skipped: true, reason: 'email_not_configured' };
    }

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
      secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      subject: `FixMe: ${digest.items.length} routine nudge${digest.items.length === 1 ? '' : 's'}`,
      text: digest.items.map((item) => `${item.time_block ?? 'Anytime'} - ${item.title} (${item.priority})`).join('\n'),
    });

    return { sent: true, skipped: false, count: digest.items.length };
  }
}
