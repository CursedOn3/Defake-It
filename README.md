# DeepFake Detection Web Application

A full-stack MERN (MongoDB, Express, React, Node.js) web application for detecting deepfake images using deep learning.

![DeepFake Detection](https://img.shields.io/badge/AI-DeepFake%20Detection-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

## 🌟 Features

- **Image Upload**: Drag-and-drop or click to upload images
- **AI Detection**: Advanced deep learning model for deepfake detection
                    https://github.com/CursedOn3/DeepFake-Detection-for-Image
- **Confidence Scores**: Detailed confidence metrics for each prediction
- **Detection History**: Track and review past analyses
- **Statistics Dashboard**: View aggregate detection stats
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Dropzone
- React Icons

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Multer (file uploads)
- CORS

### Machine Learning
- TensorFlow/Keras
- Python detection script
- Custom trained CNN model

## 📁 Project Structure

```
deepfake-web-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ImageUploader.jsx
│   │   │   └── ResultCard.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── History.jsx
│   │   │   └── About.jsx
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── server.js
├── python/                 # Python detection
│   └── detect.py
├── uploads/                # Uploaded images
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Python 3.8+ with TensorFlow
- Trained deepfake detection model

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/deepfake-web-app.git
   cd deepfake-web-app
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (backend + frontend)
   npm run install-all
   
   # Or install separately
   npm install
   cd client && npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/deepfake-detector
   PYTHON_PATH=python
   MODEL_PATH=path/to/your/model.h5
   ```

4. **Set up the ML model**
   
   Update `python/detect.py` with the correct path to your trained model.

5. **Start MongoDB**
   ```bash
   # If running locally
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 📡 API Endpoints

### Detection
- `POST /api/detect` - Upload and analyze an image
  - Body: `multipart/form-data` with `image` field
  - Returns: Detection result with confidence score

### History
- `GET /api/history` - Get all detection history
- `GET /api/history/:id` - Get specific detection
- `DELETE /api/history/:id` - Delete a detection record
- `GET /api/history/stats` - Get detection statistics

## 🎨 Screenshots

### Home Page
Upload images with drag-and-drop interface

### Results
View detailed detection results with confidence scores

### History
Browse and manage past detection results

## 🔧 Configuration

### Python Model Path
Update the model path in `.env`:
```env
MODEL_PATH=/path/to/your/deepfake_detector.h5
```

### MongoDB Connection
For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/deepfake-detector
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is provided for educational and research purposes. No detection system is 100% accurate. Results should be used as one factor in assessing media authenticity, not as definitive proof.

## 🙏 Acknowledgments

- TensorFlow team for the ML framework
- React team for the frontend framework
- All contributors to this project
