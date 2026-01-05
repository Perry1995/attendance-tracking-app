import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      if (!process.env.SMTP_USER) {
        logger.warn('SMTP not configured, skipping email send');
        return;
      }

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Attendance System" <noreply@attendance.com>',
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  },

  async sendAttendanceAlert(to: string, studentName: string, date: string, status: string) {
    const subject = `Attendance Alert: ${studentName} marked as ${status}`;
    const html = `
      <h1>Attendance Alert</h1>
      <p>Dear Guardian,</p>
      <p>This is to inform you that <strong>${studentName}</strong> has been marked as <strong>${status}</strong> on ${date}.</p>
      <p>Thank you,</p>
      <p>Attendance System</p>
    `;
    await this.sendEmail(to, subject, html);
  }
};
