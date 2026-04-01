const nodemailer = require('nodemailer');

/**
 * Creates a reusable nodemailer transporter using Gmail SMTP.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       // smtp.gmail.com
    port: Number(process.env.EMAIL_PORT), // 587
    secure: process.env.EMAIL_SECURE === 'true', // false for TLS
    auth: {
      user: process.env.EMAIL_USER,     // insurevault74@gmail.com
      pass: process.env.EMAIL_PASS      // insure@12345
    }
  });
};

/**
 * Sends a password reset email to the user.
 *
 * @param {string} toEmail   - Recipient email address
 * @param {string} toName    - Recipient name
 * @param {string} resetUrl  - Full reset URL containing the token
 */
const sendPasswordResetEmail = async (toEmail, toName, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,  // "Insure Vault <insurevault74@gmail.com>"
    to: toEmail,
    subject: 'Insure Vault – Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        
        <h2 style="color: #1a73e8; margin-bottom: 4px;">Insure Vault</h2>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin-bottom: 24px;" />

        <p style="font-size: 16px; color: #333;">Hello <strong>${toName}</strong>,</p>

        <p style="font-size: 15px; color: #555;">
          We received a request to reset your password. Click the button below to set a new password.
          This link is valid for <strong>15 minutes</strong>.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
            style="background-color: #1a73e8; color: #ffffff; padding: 14px 28px;
                   text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: bold;">
            Reset My Password
          </a>
        </div>

        <p style="font-size: 13px; color: #888;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 13px; word-break: break-all;">
          <a href="${resetUrl}" style="color: #1a73e8;">${resetUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 32px;" />

        <p style="font-size: 13px; color: #aaa; text-align: center;">
          If you did not request a password reset, please ignore this email. Your password will not change.<br/><br/>
          &copy; ${new Date().getFullYear()} Insure Vault. All rights reserved.
        </p>

      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };