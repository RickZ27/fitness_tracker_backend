import nodemailer from "nodemailer";

class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: `"GinChat" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();