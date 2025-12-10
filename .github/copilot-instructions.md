# DeepFake Detection Web Application

## Project Overview
MERN Stack web application for detecting deepfake images using a Python-based deep learning model.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **ML Model**: TensorFlow/Keras (Python)

## Project Structure
```
deepfake-web-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── controllers/        # Request handlers
│   ├── models/             # MongoDB models
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── server.js
├── python/                 # Python detection scripts
│   └── detect.py
└── uploads/                # Uploaded images (temp)
```

## Setup Instructions
1. Install dependencies: `npm run install-all`
2. Set up environment variables in `.env`
3. Start MongoDB
4. Run development: `npm run dev`

## API Endpoints
- `POST /api/detect` - Upload image and get detection result
- `GET /api/history` - Get detection history
- `GET /api/history/:id` - Get specific detection result

## Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `PYTHON_PATH` - Path to Python executable
- `MODEL_PATH` - Path to trained model
