import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS, CLIENT_URL } from './index';

// Gmail transporter — uses EMAIL_USER and EMAIL_PASS from .env
// EMAIL_PASS must be a Gmail App Password, not your regular Gmail password.
// Generate one at: Google Account → Security → 2-Step Verification → App Passwords
export const transporter = nodemailer.createTransport({
    service: 'gmail', // uses Gmail's SMTP settings automatically (no host/port needed)
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export const sendPasswordResetEmail = async (
    toEmail: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
        from:    EMAIL_USER,
        to:      toEmail,
        subject: 'Fitness Tracker — Password Reset Request',
        html: `
            <h2>Password Reset</h2>
            <p>Click the link below to set a new password. It expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}" style="
                display:inline-block; padding:12px 24px;
                background:#4F46E5; color:white;
                text-decoration:none; border-radius:6px;
            ">Reset Password</a>
            <p>If you did not request this, you can safely ignore this email.</p>
            <small>Or copy this link: ${resetUrl}</small>
        `,
    });
};