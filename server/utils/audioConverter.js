const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convert audio file to WAV format (required for Python librosa processing)
 * @param {string} inputPath - Path to input audio file
 * @returns {Promise<string>} - Path to converted WAV file
 */
const convertToWav = (inputPath) => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(inputPath).toLowerCase();
        
        // If already WAV, return original path
        if (ext === '.wav') {
            return resolve(inputPath);
        }
        
        // Create output path (same name, .wav extension)
        const outputPath = inputPath.replace(/\.[^/.]+$/, '.wav');
        
        console.log(`🔄 Converting ${ext} to WAV: ${path.basename(inputPath)}`);
        
        ffmpeg(inputPath)
            .toFormat('wav')
            .audioChannels(1)          // Mono
            .audioFrequency(16000)     // 16kHz sample rate (required by model)
            .on('start', (commandLine) => {
                console.log('   FFmpeg command:', commandLine);
            })
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`   Progress: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log('✅ Conversion complete:', path.basename(outputPath));
                
                // Delete original file after successful conversion
                try {
                    fs.unlinkSync(inputPath);
                    console.log('🗑️  Deleted original file');
                } catch (err) {
                    console.warn('⚠️  Could not delete original file:', err.message);
                }
                
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('❌ Conversion error:', err.message);
                reject(new Error(`Audio conversion failed: ${err.message}`));
            })
            .save(outputPath);
    });
};

/**
 * Get audio duration in seconds
 * @param {string} audioPath - Path to audio file
 * @returns {Promise<number>} - Duration in seconds
 */
const getAudioDuration = (audioPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audioPath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                const duration = metadata.format.duration || 0;
                resolve(duration);
            }
        });
    });
};

module.exports = {
    convertToWav,
    getAudioDuration
};
