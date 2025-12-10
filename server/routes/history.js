const express = require('express');
const router = express.Router();
const { 
    getHistory, 
    getDetectionById, 
    deleteDetection, 
    getStats 
} = require('../controllers/historyController');

// GET /api/history - Get all detection history
router.get('/', getHistory);

// GET /api/history/stats - Get statistics
router.get('/stats', getStats);

// GET /api/history/:id - Get single detection
router.get('/:id', getDetectionById);

// DELETE /api/history/:id - Delete detection
router.delete('/:id', deleteDetection);

module.exports = router;
