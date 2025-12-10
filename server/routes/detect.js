const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { detectImage } = require('../controllers/detectController');

// POST /api/detect - Upload and detect deepfake
router.post('/', upload.single('image'), detectImage);

module.exports = router;
