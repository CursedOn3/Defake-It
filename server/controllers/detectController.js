const path = require('path');
const fs = require('fs');
const Detection = require('../models/Detection');
const { runDetection } = require('../utils/detector');
const { uploadToR2, isR2Configured } = require('../utils/r2Storage');

/**
 * Detect deepfake in uploaded image
 */
const detectImage = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            });
        }

        const imagePath = req.file.path;
        const originalName = req.file.originalname;
        const fileSize = req.file.size;

        console.log(`📤 Processing image: ${originalName}`);

        // Run detection
        const result = await runDetection(imagePath);

        // Upload to Cloudflare R2 if configured
        let imageUrl = `/uploads/${req.file.filename}`;
        let r2Key = null;
        let storageType = 'local';

        if (isR2Configured()) {
            try {
                console.log('☁️ Uploading to Cloudflare R2...');
                const r2Result = await uploadToR2(imagePath, req.file.filename);
                imageUrl = r2Result.url;
                r2Key = r2Result.key;
                storageType = 'r2';
                
                // Delete local file after successful R2 upload
                fs.unlinkSync(imagePath);
                console.log('✅ Uploaded to R2 and deleted local file');
            } catch (r2Error) {
                console.log('⚠️ R2 upload failed, keeping local file:', r2Error.message);
            }
        }

        // Save to database (if connected)
        let savedDetection = null;
        try {
            const detection = new Detection({
                filename: req.file.filename,
                originalName: originalName,
                prediction: result.prediction,
                confidence: result.confidence,
                rawScore: result.raw_score,
                imagePath: storageType === 'local' ? `/uploads/${req.file.filename}` : null,
                imageUrl: imageUrl,
                r2Key: r2Key,
                storageType: storageType,
                imageSize: fileSize,
                processingTime: result.processingTime,
                modelUsed: result.model || 'deepfake_detector'
            });
            savedDetection = await detection.save();
        } catch (dbError) {
            console.log('⚠️  Could not save to database:', dbError.message);
        }

        // Send response
        res.json({
            success: true,
            data: {
                id: savedDetection?._id || null,
                filename: req.file.filename,
                originalName: originalName,
                prediction: result.prediction,
                confidence: result.confidence,
                rawScore: result.raw_score,
                isFake: result.prediction === 'fake',
                imageUrl: imageUrl,
                imagePath: imageUrl, // For backward compatibility
                storageType: storageType,
                processingTime: result.processingTime,
                message: result.prediction === 'fake' 
                    ? '⚠️ This image appears to be a DEEPFAKE!' 
                    : '✅ This image appears to be AUTHENTIC'
            }
        });

    } catch (error) {
        console.error('Detection error:', error);
        
        // Clean up uploaded file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Detection failed'
        });
    }
};

module.exports = { detectImage };
