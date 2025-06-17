import nodemailer from 'nodemailer';
import config from '../config';

// Email configuration
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Admission Management System <noreply@admissionmanagement.com>';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, // Use App Password for Gmail
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (
  email: string, 
  otp: string, 
  userType: 'superadmin' | 'center',
  centerName?: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const subject = 'Password Reset OTP - Admission Management System';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Admission Management System</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userType === 'superadmin' ? 'Super Admin' : centerName || 'Admin'}!</h2>
            
            <p>We received a request to reset your password. Use the OTP below to proceed with password reset:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 16px; color: #666;">Your OTP Code:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Valid for 10 minutes</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>This OTP is valid for 10 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>For security, this OTP can only be used once</li>
              </ul>
            </div>
            
            <p><strong>Account Details:</strong></p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Account Type:</strong> ${userType === 'superadmin' ? 'Super Administrator' : 'Center Admin'}</li>
              ${centerName ? `<li><strong>Center:</strong> ${centerName}</li>` : ''}
              <li><strong>Request Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            
            <p>If you're having trouble, please contact the system administrator.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from Admission Management System.</p>
            <p>Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Admission Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Password Reset OTP - Admission Management System

Hello ${userType === 'superadmin' ? 'Super Admin' : centerName || 'Admin'}!

We received a request to reset your password.

Your OTP Code: ${otp}
Valid for: 10 minutes

Security Notice:
- This OTP is valid for 10 minutes only
- Do not share this code with anyone
- If you didn't request this, please ignore this email
- For security, this OTP can only be used once

Account Details:
- Email: ${email}
- Account Type: ${userType === 'superadmin' ? 'Super Administrator' : 'Center Admin'}
${centerName ? `- Center: ${centerName}` : ''}
- Request Time: ${new Date().toLocaleString()}

If you're having trouble, please contact the system administrator.

This is an automated message from Admission Management System.
Please do not reply to this email.

© ${new Date().getFullYear()} Admission Management System. All rights reserved.
    `;

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmationEmail = async (
  email: string,
  userType: 'superadmin' | 'center',
  centerName?: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const subject = 'Password Reset Successful - Admission Management System';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
            <p>Admission Management System</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userType === 'superadmin' ? 'Super Admin' : centerName || 'Admin'}!</h2>
            
            <div class="success-box">
              <h3 style="color: #155724; margin: 0;">🎉 Password Updated Successfully!</h3>
              <p style="margin: 10px 0 0 0; color: #155724;">Your password has been reset and updated in our system.</p>
            </div>
            
            <p>Your password has been successfully reset. You can now log in with your new password.</p>
            
            <p><strong>Account Details:</strong></p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Account Type:</strong> ${userType === 'superadmin' ? 'Super Administrator' : 'Center Admin'}</li>
              ${centerName ? `<li><strong>Center:</strong> ${centerName}</li>` : ''}
              <li><strong>Reset Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            
            <p><strong>Security Reminder:</strong></p>
            <ul>
              <li>Keep your password secure and don't share it with anyone</li>
              <li>Use a strong, unique password</li>
              <li>If you notice any suspicious activity, contact support immediately</li>
            </ul>
            
            <p>If you didn't make this change, please contact the system administrator immediately.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from Admission Management System.</p>
            <p>Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Admission Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    return false;
  }
}; 