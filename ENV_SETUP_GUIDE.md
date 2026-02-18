# Environment Variables Configuration Guide

## Required Environment Variables

Create a `.env` file in the `server` directory with the following variables:

### 🔐 Email Configuration (REQUIRED for OTP & Password Reset)

```env
# Option 1: Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=DeepGuard

# Option 2: Custom SMTP
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@yourprovider.com
EMAIL_PASS=your-password
EMAIL_FROM_NAME=DeepGuard

# Option 3: SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_USER=noreply@yourdomain.com
EMAIL_FROM_NAME=DeepGuard
```

### 🌐 Application URLs

```env
# Frontend URL (used in email links)
FRONTEND_URL=http://localhost:5173

# In production:
# FRONTEND_URL=https://your-domain.com
```

### 🤖 Model Configuration

```env
# Path to detection project
DETECTION_PROJECT_PATH=D:/path/to/DeepFake-Detection-for-Image

# Model path (will use model name from request)
MODEL_PATH=models/deepfake_detector.h5

# Python executable path
PYTHON_PATH=python

# In some systems you might need:
# PYTHON_PATH=python3
# PYTHON_PATH=C:/Python39/python.exe
```

### 🔑 JWT Configuration

```env
JWT_SECRET=your-very-secure-random-string
JWT_EXPIRE=7d
```

### 💾 Database Configuration

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/deepfake-detector

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/deepfake-detector
```

### 🚀 Server Configuration

```env
PORT=5000
NODE_ENV=development

# In production:
# NODE_ENV=production
```

---

## Gmail App Password Setup

If using Gmail, you need an App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Select Security
3. Under "Signing in to Google," select 2-Step Verification
4. At the bottom, select App passwords
5. Select "Mail" and "Other" (enter "DeepGuard")
6. Click Generate
7. Use the generated 16-character password in EMAIL_PASS

---

## Testing Email in Development

For development/testing, you can use:

1. **Mailtrap** (recommended for testing)
   ```env
   EMAIL_SERVICE=smtp
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   EMAIL_USER=your-mailtrap-username
   EMAIL_PASS=your-mailtrap-password
   ```

2. **Ethereal Email** (temporary test accounts)
   - Visit: https://ethereal.email/
   - Create a test account
   - Use credentials in .env

---

## Client Environment Variables

Create a `.env` file in the `client` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# In production:
# VITE_API_URL=https://your-api-domain.com/api

# Google OAuth (optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Production Checklist

Before deploying to production:

- [ ] Set NODE_ENV=production
- [ ] Use production email service (SendGrid, AWS SES, etc.)
- [ ] Set secure FRONTEND_URL (https)
- [ ] Use strong JWT_SECRET
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS certificates
- [ ] Test all email functionalities
- [ ] Verify model files are accessible
- [ ] Set up error monitoring (Sentry, etc.)

---

## Troubleshooting

### Email Not Sending

1. Check EMAIL_SERVICE matches your provider
2. Verify EMAIL_USER and EMAIL_PASS are correct
3. For Gmail, ensure App Password is used (not regular password)
4. Check 2-Step Verification is enabled for Gmail
5. Test with Mailtrap or Ethereal first
6. Check server logs for detailed error messages

### Model Not Found

1. Verify DETECTION_PROJECT_PATH is correct
2. Ensure model files exist in models directory
3. Check file permissions
4. Verify PYTHON_PATH points to correct Python installation
5. Test Python script independently

### OTP Not Working

1. Verify email configuration is correct
2. Check OTP hasn't expired (10-minute limit)
3. Ensure user email is correct
4. Check spam folder
5. In development, check console logs for OTP

### Database Connection Issues

1. Verify MongoDB is running
2. Check MONGODB_URI format
3. Test connection with MongoDB Compass
4. Check firewall settings
5. For Atlas, verify IP whitelist

---

## Example Complete .env File

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/deepfake-detector

# JWT
JWT_SECRET=super-secret-key-change-in-production
JWT_EXPIRE=7d

# Email (Gmail Example)
EMAIL_SERVICE=gmail
EMAIL_USER=deepguard@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM_NAME=DeepGuard

# URLs
FRONTEND_URL=http://localhost:5173

# Python & Models
DETECTION_PROJECT_PATH=D:/Coding/img/DeepFake-Detection-for-Image
MODEL_PATH=models/deepfake_detector.h5
PYTHON_PATH=python

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` files to version control
- Use different secrets for development and production
- Rotate secrets regularly
- Use environment variables in deployment platforms
- Keep backup of production environment variables securely

---

## Need Help?

If you encounter issues:
1. Check server console logs
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Test individual components separately
5. Check the IMPLEMENTATION_SUMMARY.md for detailed feature documentation
