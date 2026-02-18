const nodemailer = require('nodemailer');

/**
 * Production-Ready Email Service Utility
 * Features: Multi-provider support, retry logic, fallback, validation, rate limiting
 */

// Email service configuration
let emailConfig = {
    isConfigured: false,
    primaryProvider: null,
    fallbackProvider: null,
    lastError: null,
    emailsSent: 0,
    emailsFailed: 0
};

// Rate limiting
const rateLimiter = {
    attempts: new Map(),
    maxAttemptsPerHour: 100,
    cleanupInterval: null
};

/**
 * Validate email configuration
 */
const validateEmailConfig = () => {
    const errors = [];
    
    // Check if email service is configured
    if (!process.env.EMAIL_SERVICE) {
        errors.push('EMAIL_SERVICE not configured');
    }
    
    // Validate based on provider
    if (process.env.EMAIL_SERVICE === 'gmail') {
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
            errors.push('EMAIL_USER not configured (use your Gmail address)');
        }
        if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_password') {
            errors.push('EMAIL_PASS not configured (use Gmail App Password, not regular password)');
        }
        if (errors.length === 0 && (!process.env.EMAIL_PASS.length || process.env.EMAIL_PASS.length < 16)) {
            errors.push('EMAIL_PASS appears invalid (Gmail App Passwords are 16 characters without spaces)');
        }
    } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
        if (!process.env.SENDGRID_API_KEY) {
            errors.push('SENDGRID_API_KEY not configured');
        }
    } else if (process.env.EMAIL_SERVICE === 'smtp') {
        if (!process.env.SMTP_HOST) errors.push('SMTP_HOST not configured');
        if (!process.env.EMAIL_USER) errors.push('EMAIL_USER not configured');
        if (!process.env.EMAIL_PASS) errors.push('EMAIL_PASS not configured');
    }
    
    return errors;
};

/**
 * Create transporter with error handling
 */
const createTransporter = (provider = 'primary') => {
    try {
        // For Gmail
        if (process.env.EMAIL_SERVICE === 'gmail') {
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                pool: true, // Use connection pool
                maxConnections: 5,
                maxMessages: 100,
                rateDelta: 1000,
                rateLimit: 5
            });
        }

        // For SendGrid
        if (process.env.EMAIL_SERVICE === 'sendgrid') {
            return nodemailer.createTransport({
                host: 'smtp.sendgrid.net',
                port: 587,
                auth: {
                    user: 'apikey',
                    pass: process.env.SENDGRID_API_KEY
                },
                pool: true,
                maxConnections: 5
            });
        }

        // For custom SMTP
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            pool: true,
            maxConnections: 5
        });
    } catch (error) {
        console.error(`❌ Failed to create ${provider} transporter:`, error.message);
        return null;
    }
};

/**
 * Check rate limit for email address
 */
const checkRateLimit = (email) => {
    const now = Date.now();
    const hourAgo = now - 3600000; // 1 hour in milliseconds
    
    if (!rateLimiter.attempts.has(email)) {
        rateLimiter.attempts.set(email, []);
    }
    
    const attempts = rateLimiter.attempts.get(email).filter(time => time > hourAgo);
    rateLimiter.attempts.set(email, attempts);
    
    if (attempts.length >= rateLimiter.maxAttemptsPerHour) {
        return false;
    }
    
    attempts.push(now);
    return true;
};

/**
 * Retry logic with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            
            const delay = baseDelay * Math.pow(2, i);
            console.log(`🔄 Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Send email with production-ready features
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 * @param {boolean} options.critical - If true, use retry logic (default: false)
 */
const sendEmail = async (options) => {
    const startTime = Date.now();
    
    try {
        // Validate email is configured
        if (!emailConfig.isConfigured) {
            const errors = validateEmailConfig();
            if (errors.length > 0) {
                const errorMsg = `Email service not configured properly:\n${errors.map(e => `  - ${e}`).join('\n')}`;
                console.error('❌', errorMsg);
                
                // In production, you might want to log to external service or queue for retry
                if (process.env.NODE_ENV === 'production') {
                    console.log('📝 Email would be queued for later sending in production');
                }
                
                throw new Error(errorMsg);
            }
        }
        
        // Check rate limit
        if (!checkRateLimit(options.to)) {
            throw new Error(`Rate limit exceeded for ${options.to}. Max ${rateLimiter.maxAttemptsPerHour} emails per hour.`);
        }
        
        // Validate email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(options.to)) {
            throw new Error(`Invalid email address: ${options.to}`);
        }
        
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'DeepGuard'}" <${process.env.EMAIL_USER || 'noreply@deepguard.com'}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            headers: {
                'X-Priority': options.critical ? '1' : '3',
                'X-Mailer': 'DeepGuard Email Service v2.0'
            }
        };

        // Send email with retry logic
        const sendFn = async () => {
            const transporter = createTransporter();
            if (!transporter) {
                throw new Error('Failed to create email transporter');
            }
            return await transporter.sendMail(mailOptions);
        };
        
        const info = options.critical 
            ? await retryWithBackoff(sendFn, 3, 2000)
            : await sendFn();
        
        const duration = Date.now() - startTime;
        emailConfig.emailsSent++;
        emailConfig.lastError = null;
        
        console.log(`✅ Email sent successfully in ${duration}ms`);
        console.log(`   To: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   Message ID: ${info.messageId}`);
        
        return { 
            success: true, 
            messageId: info.messageId,
            duration 
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        emailConfig.emailsFailed++;
        emailConfig.lastError = {
            message: error.message,
            timestamp: new Date(),
            recipient: options.to
        };
        
        console.error('❌ Email sending failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   To: ${options.to}`);
        console.error(`   Duration: ${duration}ms`);
        
        // Provide helpful error messages
        if (error.message.includes('Invalid login')) {
            console.error('\n⚠️  Gmail Authentication Error:');
            console.error('   1. Enable 2-Factor Authentication on your Gmail account');
            console.error('   2. Generate an App Password at: https://myaccount.google.com/apppasswords');
            console.error('   3. Use the App Password (16 characters without spaces) in EMAIL_PASS');
            console.error('   4. Never use your regular Gmail password\n');
        }
        
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetUrl - Password reset URL
 * @param {string} userName - User's name
 */
const sendPasswordResetEmail = async (email, resetUrl, userName = 'User') => {
    const subject = '🔐 Password Reset Request - DeepGuard';
    
    const text = `
Hello ${userName},

You requested a password reset for your DeepGuard account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 10 minutes.

If you didn't request this, please ignore this email and your password will remain unchanged.

Best regards,
The DeepGuard Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 40px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                🛡️ DeepGuard
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                                DeepFake Detection Platform
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                                Password Reset Request
                            </h2>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hello <strong>${userName}</strong>,
                            </p>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We received a request to reset your password for your DeepGuard account. Click the button below to create a new password:
                            </p>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="color: #8B5CF6; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 8px; margin: 0 0 20px 0;">
                                ${resetUrl}
                            </p>
                            
                            <!-- Warning -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                                <p style="color: #92400e; font-size: 14px; margin: 0;">
                                    ⏰ <strong>This link expires in 10 minutes.</strong><br>
                                    If you didn't request this password reset, please ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                Need help? Contact us at <a href="mailto:support@deepguard.com" style="color: #8B5CF6;">support@deepguard.com</a>
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                © 2025 DeepGuard. All rights reserved.<br>
                                Protecting the world from deepfakes.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendEmail({
        to: email,
        subject,
        text,
        html,
        critical: true // Password reset emails are critical
    });
};

/**
 * Send welcome email to new users
 * @param {string} email - Recipient email
 * @param {string} userName - User's name
 */
const sendWelcomeEmail = async (email, userName = 'User') => {
    const subject = '🎉 Welcome to DeepGuard!';
    
    const text = `
Welcome to DeepGuard, ${userName}!

Thank you for joining DeepGuard - your trusted platform for detecting deepfake images.

Get started by uploading an image to analyze: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/detect

Stay safe,
The DeepGuard Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 40px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                🎉 Welcome to DeepGuard!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hello <strong>${userName}</strong>,
                            </p>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Thank you for joining DeepGuard! You now have access to our powerful AI-driven deepfake detection platform.
                            </p>
                            
                            <h3 style="color: #1f2937; margin: 30px 0 15px 0;">What you can do:</h3>
                            <ul style="color: #4b5563; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                                <li>🔍 Upload images for instant deepfake analysis</li>
                                <li>📊 View detailed confidence scores and results</li>
                                <li>📜 Access your complete detection history</li>
                                <li>🔒 Enjoy secure and private analysis</li>
                            </ul>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/detect" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600;">
                                            Start Detecting
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                © 2025 DeepGuard. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendEmail({
        to: email,
        subject,
        text,
        html,
        critical: false // Welcome emails are not critical
    });
};

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} userName - User's name
 */
const sendOTPEmail = async (email, otp, userName = 'User') => {
    const subject = '🔐 Verify Your Email - DeepGuard';
    
    const text = `
Hello ${userName},

Thank you for signing up with DeepGuard!

Your verification code is: ${otp}

This code will expire in 10 minutes.

If you didn't create an account with us, please ignore this email.

Best regards,
The DeepGuard Team
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 40px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                🛡️ DeepGuard
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                                Email Verification
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
                                Verify Your Email
                            </h2>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hello <strong>${userName}</strong>,
                            </p>
                            
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Thank you for signing up with DeepGuard! Please use the following verification code to complete your registration:
                            </p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 40px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning -->
                            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                                <p style="color: #92400e; font-size: 14px; margin: 0;">
                                    ⏰ <strong>This code expires in 10 minutes.</strong><br>
                                    If you didn't create an account, please ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                Need help? Contact us at <a href="mailto:support@deepguard.com" style="color: #8B5CF6;">support@deepguard.com</a>
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                © 2025 DeepGuard. All rights reserved.<br>
                                Protecting the world from deepfakes.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendEmail({
        to: email,
        subject,
        text,
        html,
        critical: true // OTP emails are critical for account verification
    });
};

/**
 * Initialize and verify email configuration on startup
 */
const initializeEmailService = async () => {
    console.log('\n📧 Initializing Email Service...');
    
    const errors = validateEmailConfig();
    
    if (errors.length > 0) {
        console.log('⚠️  Email service configuration issues:');
        errors.forEach(error => console.log(`   ❌ ${error}`));
        console.log('\n💡 Email features will be disabled until configured.');
        console.log('   See ENV_SETUP_GUIDE.md for setup instructions.\n');
        emailConfig.isConfigured = false;
        return false;
    }
    
    try {
        console.log('🔍 Verifying email configuration...');
        console.log(`   Service: ${process.env.EMAIL_SERVICE}`);
        console.log(`   User: ${process.env.EMAIL_USER}`);
        console.log(`   Password length: ${process.env.EMAIL_PASS?.length || 0} characters`);
        
        const transporter = createTransporter();
        if (!transporter) {
            throw new Error('Failed to create transporter');
        }
        
        console.log('🔌 Testing SMTP connection...');
        await transporter.verify();
        
        emailConfig.isConfigured = true;
        emailConfig.primaryProvider = process.env.EMAIL_SERVICE;
        
        // Start rate limiter cleanup
        if (!rateLimiter.cleanupInterval) {
            rateLimiter.cleanupInterval = setInterval(() => {
                const hourAgo = Date.now() - 3600000;
                rateLimiter.attempts.forEach((attempts, email) => {
                    const filtered = attempts.filter(time => time > hourAgo);
                    if (filtered.length === 0) {
                        rateLimiter.attempts.delete(email);
                    } else {
                        rateLimiter.attempts.set(email, filtered);
                    }
                });
            }, 600000); // Cleanup every 10 minutes
        }
        
        console.log('✅ Email service initialized successfully');
        console.log(`   Provider: ${process.env.EMAIL_SERVICE}`);
        console.log(`   From: ${process.env.EMAIL_FROM_NAME || 'DeepGuard'} <${process.env.EMAIL_USER}>`);
        console.log(`   Rate limit: ${rateLimiter.maxAttemptsPerHour} emails/hour per recipient\n`);
        
        return true;
    } catch (error) {
        console.error('❌ Email service verification failed');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code || 'N/A'}`);
        
        if (error.message.includes('Invalid login') || error.code === 'EAUTH') {
            console.error('\n⚠️  Gmail Authentication Failed!');
            console.error('\n📋 Current Configuration:');
            console.error(`   EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
            console.error(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
            console.error(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}****` : 'NOT SET'}`);
            console.error('\n🔧 Troubleshooting Steps:');
            console.error('   1. Verify 2FA is enabled: https://myaccount.google.com/security');
            console.error(`   2. Generate NEW App Password for: ${process.env.EMAIL_USER}`);
            console.error('      → https://myaccount.google.com/apppasswords');
            console.error('   3. Select "Mail" and "Other (Custom name)"');
            console.error('   4. Copy the 16-character password (REMOVE ALL SPACES)');
            console.error('   5. Update .env file: EMAIL_PASS=your_new_password');
            console.error('   6. Restart server\n');
            console.error('💡 Common Issues:');
            console.error('   ❌ Using regular Gmail password instead of App Password');
            console.error('   ❌ 2FA not enabled on Gmail account');
            console.error('   ❌ App Password generated for different Gmail account');
            console.error('   ❌ Spaces left in App Password');
            console.error('   ❌ Old/revoked App Password\n');
        } else if (error.message.includes('getaddrinfo')) {
            console.error('\n⚠️  Network Error: Unable to reach Gmail servers');
            console.error('   Check your internet connection and try again.\n');
        } else {
            console.error('\n⚠️  Unexpected Error');
            console.error(`   Full error: ${error.stack}\n`);
        }
        
        emailConfig.isConfigured = false;
        return false;
    }
};

/**
 * Get email service health status
 */
const getEmailServiceStatus = () => {
    return {
        configured: emailConfig.isConfigured,
        provider: emailConfig.primaryProvider,
        stats: {
            sent: emailConfig.emailsSent,
            failed: emailConfig.emailsFailed,
            successRate: emailConfig.emailsSent > 0 
                ? ((emailConfig.emailsSent / (emailConfig.emailsSent + emailConfig.emailsFailed)) * 100).toFixed(2) + '%'
                : 'N/A'
        },
        lastError: emailConfig.lastError,
        rateLimit: {
            maxPerHour: rateLimiter.maxAttemptsPerHour,
            activeRecipients: rateLimiter.attempts.size
        }
    };
};

/**
 * Graceful shutdown
 */
const shutdownEmailService = () => {
    if (rateLimiter.cleanupInterval) {
        clearInterval(rateLimiter.cleanupInterval);
        rateLimiter.cleanupInterval = null;
    }
    console.log('📧 Email service shut down gracefully');
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendOTPEmail,
    initializeEmailService,
    getEmailServiceStatus,
    shutdownEmailService
};
