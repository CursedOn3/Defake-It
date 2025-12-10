const mongoose = require('mongoose');

const DetectionSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    prediction: {
        type: String,
        enum: ['real', 'fake'],
        required: true
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    rawScore: {
        type: Number
    },
    imagePath: {
        type: String
    },
    // Cloudflare R2 storage fields
    imageUrl: {
        type: String  // Public URL from R2
    },
    r2Key: {
        type: String  // R2 object key for deletion
    },
    storageType: {
        type: String,
        enum: ['local', 'r2'],
        default: 'local'
    },
    imageSize: {
        type: Number
    },
    processingTime: {
        type: Number // in milliseconds
    },
    modelUsed: {
        type: String,
        default: 'deepfake_detector'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
DetectionSchema.index({ createdAt: -1 });
DetectionSchema.index({ prediction: 1 });

module.exports = mongoose.model('Detection', DetectionSchema);
