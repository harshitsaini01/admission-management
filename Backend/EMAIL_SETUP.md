# Email Setup Guide for Password Reset

## Overview
The password reset system uses OTP (One-Time Password) sent via email. This guide explains how to configure email functionality.

## Email Service Configuration

### 1. Gmail Setup (Recommended - Free)

1. **Create a Gmail account** or use an existing one
2. **Enable 2-Factor Authentication** on your Gmail account
3. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration for Password Reset
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=Admission Management System <noreply@admissionmanagement.com>
SUPERADMIN_EMAIL=superadmin@admissionmanagement.com
```

### 3. Alternative Email Services

You can also use other email services by modifying the transporter configuration in `src/utils/emailService.ts`:

#### Outlook/Hotmail
```javascript
service: 'hotmail'
```

#### Yahoo
```javascript
service: 'yahoo'
```

#### Custom SMTP
```javascript
host: 'smtp.yourdomain.com',
port: 587,
secure: false, // true for 465, false for other ports
```

## Features

### 1. Forgot Password Flow
1. User enters email address
2. System sends 6-digit OTP to email
3. User enters OTP for verification
4. User sets new password
5. Confirmation email sent

### 2. Security Features
- OTP expires in 10 minutes
- OTP can only be used once
- Automatic cleanup of expired tokens
- Password strength validation (minimum 6 characters)
- Email normalization (lowercase, trimmed)

### 3. Supported User Types
- **Superadmin**: Uses environment variable `SUPERADMIN_EMAIL`
- **Center Admin**: Uses email from center database record

## Testing

### 1. Test Email Sending
```bash
# Start the backend server
npm run dev

# Test forgot password endpoint
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Frontend Testing
1. Navigate to `/forgot-password`
2. Enter a valid email address
3. Check email for OTP
4. Complete the password reset flow

## Troubleshooting

### Common Issues

1. **"Failed to send OTP email"**
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Verify Gmail app password is correct
   - Ensure 2FA is enabled on Gmail

2. **"No account found with this email address"**
   - Verify email exists in center database
   - Check SUPERADMIN_EMAIL environment variable

3. **"Invalid or expired OTP"**
   - OTP expires in 10 minutes
   - Each OTP can only be used once
   - Check for typos in OTP entry

### Email Template Customization

Email templates can be customized in `src/utils/emailService.ts`:
- Modify HTML content in `htmlContent` variable
- Update styling in the `<style>` section
- Change email subject and sender information

## Production Considerations

1. **Use environment-specific email accounts**
2. **Set up proper DNS records** for custom domains
3. **Monitor email delivery rates**
4. **Implement rate limiting** for password reset requests
5. **Use professional email templates**
6. **Set up email logging** for audit trails

## Security Best Practices

1. **Never commit email credentials** to version control
2. **Use app passwords** instead of account passwords
3. **Implement rate limiting** to prevent abuse
4. **Log password reset attempts** for security monitoring
5. **Use HTTPS** in production for secure communication 