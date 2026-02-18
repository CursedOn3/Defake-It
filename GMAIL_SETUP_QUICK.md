# 📧 Gmail App Password Setup - Quick Reference

## 🚀 5-Minute Setup

### 1️⃣ Enable 2FA (if not already enabled)
🔗 https://myaccount.google.com/security

### 2️⃣ Generate App Password
🔗 https://myaccount.google.com/apppasswords
- Select: **Mail** + **Other (Custom name)**
- Name: DeepGuard
- **Copy the 16-character password**

### 3️⃣ Update .env File
```env
EMAIL_SERVICE=gmail
EMAIL_USER=rishavchaudhary111199@gmail.com
EMAIL_PASS=your_16_char_password  # ← Paste here (remove spaces)
EMAIL_FROM_NAME=DeepGuard
```

### 4️⃣ Restart Server
```bash
# Stop server: Ctrl+C
# Start server:
cd server
npm start
```

### 5️⃣ Verify Success
Look for this message:
```
✅ Email service initialized successfully
   Provider: gmail
   From: DeepGuard <rishavchaudhary111199@gmail.com>
```

### 6️⃣ Test Password Reset
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"rishavchaudhary111199@gmail.com"}'
```

---

## ⚠️ Common Mistakes

❌ Using regular Gmail password → Use App Password
❌ Including spaces in App Password → Remove all spaces
❌ Not enabling 2FA → Required for App Passwords
❌ Using placeholder values → Must use real credentials

---

## ✅ Production-Ready Features

✨ **Automatic Retry** - Critical emails retry 3x with backoff
🛡️ **Rate Limiting** - Max 100 emails/hour per recipient
📊 **Health Monitoring** - GET /api/health for stats
🔒 **Secure** - No credentials in logs
⚡ **Fast** - Connection pooling enabled
🎯 **Smart Errors** - Helpful troubleshooting messages

---

## 📱 Test Email Features

After setup, test these features:

1. **Password Reset**
   - Go to login page
   - Click "Forgot Password"
   - Enter your email
   - Check inbox for reset link

2. **OTP Verification**
   - Sign up with new account
   - Check inbox for 6-digit code
   - Enter code to verify

3. **Welcome Email**
   - Complete signup
   - Check inbox for welcome message

---

## 🆘 Still Not Working?

Check server console for error messages:

```
❌ Email service verification failed: Invalid login

⚠️  Gmail App Password Setup Required:
   1. Go to: https://myaccount.google.com/apppasswords
   2. Select "Mail" and "Other (Custom name)"
   3. Generate a 16-character App Password
   4. Update EMAIL_PASS in .env with this password
   5. Restart the server
```

The system will guide you with specific instructions!

---

**Need more help?** See [PRODUCTION_EMAIL_SETUP.md](PRODUCTION_EMAIL_SETUP.md)
