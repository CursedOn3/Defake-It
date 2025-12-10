const Detection = require('../models/Detection');
const { deleteFromR2 } = require('../utils/r2Storage');
const fs = require('fs');
const path = require('path');

/**
 * Get all detection history
 */
const getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {};
        
        // Filter by prediction type
        if (req.query.type && ['real', 'fake'].includes(req.query.type)) {
            filter.prediction = req.query.type;
        }

        const [detections, total] = await Promise.all([
            Detection.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Detection.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: {
                detections,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch detection history'
        });
    }
};

/**
 * Get single detection by ID
 */
const getDetectionById = async (req, res) => {
    try {
        const detection = await Detection.findById(req.params.id).lean();

        if (!detection) {
            return res.status(404).json({
                success: false,
                error: 'Detection not found'
            });
        }

        res.json({
            success: true,
            data: detection
        });
    } catch (error) {
        console.error('Get detection error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch detection'
        });
    }
};

/**
 * Delete detection by ID
 */
const deleteDetection = async (req, res) => {
    try {
        const detection = await Detection.findById(req.params.id);

        if (!detection) {
            return res.status(404).json({
                success: false,
                error: 'Detection not found'
            });
        }

        // Delete from R2 if stored there
        if (detection.storageType === 'r2' && detection.r2Key) {
            try {
                await deleteFromR2(detection.r2Key);
                console.log(`🗑️ Deleted from R2: ${detection.r2Key}`);
            } catch (r2Error) {
                console.log('⚠️ Failed to delete from R2:', r2Error.message);
            }
        }

        // Delete local file if exists
        if (detection.storageType === 'local' && detection.filename) {
            const localPath = path.join(__dirname, '..', '..', 'uploads', detection.filename);
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
                console.log(`🗑️ Deleted local file: ${detection.filename}`);
            }
        }

        // Delete from database
        await Detection.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Detection deleted successfully'
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete detection'
        });
    }
};

/**
 * Get detection statistics
 */
const getStats = async (req, res) => {
    try {
        const [totalCount, fakeCount, realCount, recentDetections] = await Promise.all([
            Detection.countDocuments(),
            Detection.countDocuments({ prediction: 'fake' }),
            Detection.countDocuments({ prediction: 'real' }),
            Detection.find().sort({ createdAt: -1 }).limit(5).lean()
        ]);

        const avgConfidence = await Detection.aggregate([
            { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
        ]);

        res.json({
            success: true,
            data: {
                total: totalCount,
                fake: fakeCount,
                real: realCount,
                fakePercentage: totalCount > 0 ? ((fakeCount / totalCount) * 100).toFixed(1) : 0,
                avgConfidence: avgConfidence[0]?.avgConfidence?.toFixed(1) || 0,
                recentDetections
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
};

module.exports = { getHistory, getDetectionById, deleteDetection, getStats };
