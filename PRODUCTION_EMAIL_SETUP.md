# Production Email Service Setup Guide

## 🚀 Quick Setup (Gmail - Recommended for Development/Small Scale)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click "2-Step Verification"
3. Follow the steps to enable 2FA

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **"Mail"** and **"Other (Custom name)"**
3. Enter a name like "DeepGuard App"
4. Click **Generate**
5. **Copy the 16-character password** (shown without spaces)

### Step 3: Update .env File
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=abcdefghijklmnop  # Your 16-character App Password (no spaces)
EMAIL_FROM_NAME=DeepGuard
```

### Step 4: Restart Server
```bash
cd server
npm start
```

You should see:
```
✅ Email service initialized successfully
   Provider: gmail
   From: DeepGuard <your_email@gmail.com>
   Rate limit: 100 emails/hour per recipient
```

---

## 🏢 Production Setup Options

### Option 1: SendGrid (Recommended for Production)

**Advantages:**
- ✅ High deliverability rates
- ✅ 100 free emails/day
- ✅ Detailed analytics
- ✅ Professional infrastructure
- ✅ Scalable to millions

**Setup:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Update `.env`:
```bash
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
EMAIL_USER=noreply@yourdomain.com  # Any email
EMAIL_FROM_NAME=DeepGuard
```

### Option 2: AWS SES (Best for High Volume)

**Advantages:**
- ✅ $0.10 per 1,000 emails
- ✅ Extremely scalable
- ✅ High deliverability
- ✅ Integration with AWS ecosystem

**Setup:**
1. Sign up for [AWS SES](https://aws.amazon.com/ses/)
2. Verify your domain/email
3. Get SMTP credentials
4. Update `.env`:
```bash
EMAIL_SERVICE=smtp
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your_aws_smtp_username
EMAIL_PASS=your_aws_smtp_password
EMAIL_FROM_NAME=DeepGuard
```

### Option 3: Mailgun (Developer-Friendly)

**Setup:**
```bash
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=postmaster@yourdomain.mailgun.org
EMAIL_PASS=your_mailgun_password
EMAIL_FROM_NAME=DeepGuard
```

---

## 🔒 Security Best Practices

### 1. Never Commit Credentials
```bash
# .gitignore should include:
.env
.env.local
.env.production
```

### 2. Use Environment Variables
```bash
# Production server
export EMAIL_PASS="your_secure_password"
```

### 3. Rotate Credentials Regularly
- Change App Passwords every 90 days
- Revoke unused credentials immediately

### 4. Monitor Email Activity
- Check for suspicious activity
- Monitor bounce rates
- Track failed authentication attempts

### 5. Use HTTPS Only
```javascript
// In production
process.env.NODE_ENV = 'production'
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "services": {
    "api": "operational",
    "database": "connected",
    "email": "configured"
  },
  "emailStats": {
    "sent": 245,
    "failed": 3,
    "successRate": "98.79%"
  }
}
```

### Email Service Status
The system automatically tracks:
- ✅ Emails sent successfully
- ❌ Failed attempts
- 📈 Success rate percentage
- ⏰ Last error timestamp
- 🚦 Rate limit violations

---

## 🚨 Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Cause:** Using regular Gmail password instead of App Password

**Solution:**
1. Generate a new App Password (see Quick Setup above)
2. Copy it **without spaces**: `abcd efgh ijkl mnop` → `abcdefghijklmnop`
3. Update `.env` with the 16-character password
4. Restart the server

### Error: "Email service not configured properly"

**Cause:** Missing or invalid environment variables

**Solution:**
Check that all required variables are set:
```bash
# For Gmail:
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com  # Real email, not placeholder
EMAIL_PASS=your_app_password      # Real App Password, not placeholder

# For SendGrid:
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxx       # Real API key
```

### Error: "Rate limit exceeded"

**Cause:** Sent more than 100 emails/hour to same recipient

**Solution:**
- Rate limit auto-resets after 1 hour
- Increase limit in `emailService.js`:
```javascript
rateLimiter.maxAttemptsPerHour = 500; // Increase if needed
```

### Low Deliverability (Emails going to spam)

**Solutions:**
1. **Verify your domain** with SPF, DKIM, and DMARC records
2. **Use a professional email service** (SendGrid, AWS SES)
3. **Warm up your domain** (gradually increase volume)
4. **Monitor bounce rates** and remove invalid emails

---

## 📈 Production Features

### Automatic Retry Logic
Critical emails (password resets, OTP) automatically retry 3 times with exponential backoff:
- 1st retry: 2 seconds
- 2nd retry: 4 seconds  
- 3rd retry: 8 seconds

### Rate Limiting
- **100 emails/hour per recipient** (configurable)
- Automatic cleanup every 10 minutes
- Prevents spam and abuse

### Connection Pooling
- Reuses SMTP connections for better performance
- Max 5 concurrent connections
- Max 100 emails per connection

### Graceful Shutdown
Server properly closes email connections on shutdown:
```bash
# On SIGTERM/SIGINT:
✅ HTTP server closed
✅ Email service shut down gracefully
✅ MongoDB connection closed
```

---

## 🎯 Performance Optimization

### For High Volume (1000+ emails/day)

1. **Use a Queue System** (Bull/BullMQ):
```javascript
// Install: npm install bull redis
const Queue = require('bull');
const emailQueue = new Queue('emails', 'redis://localhost:6379');

// Add to queue instead of sending immediately
await emailQueue.add({ to, subject, html });
```

2. **Enable Email Batching**:
```javascript
// Send multiple emails in one request
await transporter.sendMail([...mailOptions]);
```

3. **Use a Dedicated Email Service**:
- SendGrid: Up to 100,000 emails/day
- AWS SES: Unlimited (pay per email)
- Mailgun: Up to 10,000 emails/month free

---

## ✅ Pre-Deployment Checklist

- [ ] Email service configured with valid credentials
- [ ] 2FA enabled on email account
- [ ] App Password generated (for Gmail)
- [ ] Environment variables set in production
- [ ] `.env` file not committed to Git
- [ ] Health check endpoint working
- [ ] Test email sent successfully
- [ ] Rate limits configured appropriately
- [ ] Domain verified (for production email service)
- [ ] SPF/DKIM/DMARC records configured
- [ ] Error monitoring/logging enabled
- [ ] Backup email service configured (optional)

---

## 📞 Support

If you encounter issues:

1. **Check server logs** for detailed error messages
2. **Visit health endpoint**: `GET /api/health`
3. **Test email manually**:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@gmail.com"}'
```

4. **Common errors** are documented above with solutions

---

## 📚 Additional Resources

- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Deliverability Best Practices](https://postmarkapp.com/guides/email-deliverability)

---

**🛡️ DeepGuard** - Protecting the world from deepfakes
