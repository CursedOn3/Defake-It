const path = require('path');
const fs = require('fs');
const Detection = require('../models/Detection');
const { runDetection, runVideoDetection, runAudioDetection } = require('../utils/detector');
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
        const selectedModel = req.body.model || 'deepfake_detector';

        console.log(`📤 Processing image: ${originalName}`);
        console.log(`🤖 Using model: ${selectedModel}`);

        // Run detection with selected model
        const result = await runDetection(imagePath, selectedModel);

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
                modelUsed: selectedModel
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
                modelUsed: selectedModel,
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

/**
 * Detect deepfake in uploaded video
 */
const detectVideo = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No video file provided'
            });
        }

        const videoPath = req.file.path;
        const originalName = req.file.originalname;
        const fileSize = req.file.size;

        console.log(`🎬 Processing video: ${originalName}`);
        console.log(`📁 Video size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

        // Run video detection
        const result = await runVideoDetection(videoPath);

        if (!result.success) {
            // Clean up uploaded file on error
            try {
                fs.unlinkSync(videoPath);
            } catch (e) {
                // Ignore cleanup errors
            }
            return res.status(400).json({
                success: false,
                error: result.error || 'Video detection failed'
            });
        }

        // For videos, we don't upload to R2 by default (too large)
        // Just delete the local file after processing
        try {
            fs.unlinkSync(videoPath);
            console.log('✅ Deleted local video file after processing');
        } catch (e) {
            console.log('⚠️ Could not delete local video file:', e.message);
        }

        // Save to database (if connected)
        let savedDetection = null;
        try {
            const detection = new Detection({
                filename: req.file.filename,
                originalName: originalName,
                prediction: result.prediction,
                confidence: result.confidence,
                rawScore: result.confidence / 100, // Normalize to 0-1
                storageType: 'processed', // Video was processed and deleted
                imageSize: fileSize,
                processingTime: result.processingTime,
                modelUsed: result.model || 'deepfake_detector',
                isVideo: true,
                videoMetadata: {
                    totalFrames: result.total_frames,
                    analyzedFrames: result.analyzed_frames,
                    fakeFrames: result.fake_frames,
                    realFrames: result.real_frames,
                    durationSeconds: result.duration_seconds,
                    fps: result.fps
                }
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
                isFake: result.is_fake,
                totalFrames: result.total_frames,
                analyzedFrames: result.analyzed_frames,
                fakeFrames: result.fake_frames,
                realFrames: result.real_frames,
                durationSeconds: result.duration_seconds,
                fps: result.fps,
                frameResults: result.frame_results,
                processingTime: result.processingTime,
                message: result.is_fake 
                    ? '⚠️ This video appears to contain DEEPFAKE content!' 
                    : '✅ This video appears to be AUTHENTIC'
            }
        });

    } catch (error) {
        console.error('Video detection error:', error);
        
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
            error: error.message || 'Video detection failed'
        });
    }
};

/**
 * Detect deepfake in uploaded audio
 */
const detectAudio = async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided'
            });
        }

        const audioPath = req.file.path;
        const originalName = req.file.originalname;
        const fileSize = req.file.size;

        console.log(`🎵 Processing audio: ${originalName}`);
        console.log(`📁 Audio size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);

        // Run audio detection
        const result = await runAudioDetection(audioPath);

        if (!result.success) {
            // Clean up uploaded file on error
            try {
                fs.unlinkSync(audioPath);
            } catch (e) {
                // Ignore cleanup errors
            }
            return res.status(400).json({
                success: false,
                error: result.error || 'Audio detection failed'
            });
        }

        // Upload to Cloudflare R2 if configured
        let audioUrl = `/uploads/${req.file.filename}`;
        let r2Key = null;
        let storageType = 'local';

        if (isR2Configured()) {
            try {
                console.log('☁️ Uploading to Cloudflare R2...');
                const r2Result = await uploadToR2(audioPath, req.file.filename);
                audioUrl = r2Result.url;
                r2Key = r2Result.key;
                storageType = 'r2';
                
                // Delete local file after successful R2 upload
                fs.unlinkSync(audioPath);
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
                audioPath: storageType === 'local' ? `/uploads/${req.file.filename}` : null,
                audioUrl: audioUrl,
                r2Key: r2Key,
                storageType: storageType,
                audioSize: fileSize,
                processingTime: result.processing_time,
                modelUsed: result.model || 'audio_deepfake_detector',
                isAudio: true,
                audioMetadata: {
                    thresholdUsed: result.threshold_used
                }
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
                audioUrl: audioUrl,
                audioPath: audioUrl, // For backward compatibility
                storageType: storageType,
                processingTime: result.processing_time,
                thresholdUsed: result.threshold_used,
                message: result.prediction === 'fake' 
                    ? '⚠️ This audio appears to be a DEEPFAKE!' 
                    : '✅ This audio appears to be AUTHENTIC'
            }
        });

    } catch (error) {
        console.error('Audio detection error:', error);
        
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
            error: error.message || 'Audio detection failed'
        });
    }
};

module.exports = { detectImage, detectVideo, detectAudio };