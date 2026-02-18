const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { convertToWav } = require('./audioConverter');

/**
 * Run DeepFake detection on an image using Python model
 * @param {string} imagePath - Path to the image file
 * @param {string} modelName - Name of the model to use (optional)
 * @returns {Promise<object>} Detection result
 */
const runDetection = (imagePath, modelName = 'deepfake_detector') => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        // Path to the detection project
        const detectionProjectPath = process.env.DETECTION_PROJECT_PATH || 
            'D:/Coding/img/DeepFake-Detection-for-Image';
        
        // Python script path
        const pythonScript = path.join(__dirname, '..', '..', 'python', 'detect.py');
        
        // Model path - support multiple models
        const modelPath = process.env.MODEL_PATH || 
            path.join(detectionProjectPath, 'models', `${modelName}.h5`);
        
        // Check if model exists
        if (!fs.existsSync(modelPath)) {
            console.warn(`⚠️ Model not found at: ${modelPath}, using default`);
            // Fallback to default model
            const defaultModelPath = path.join(detectionProjectPath, 'models', 'deepfake_detector.h5');
            if (!fs.existsSync(defaultModelPath)) {
                return reject(new Error(`No models found. Checked: ${modelPath} and ${defaultModelPath}`));
            }
        }
        
        // Python command
        const pythonPath = process.env.PYTHON_PATH || 'python';
        
        console.log(`🔍 Running detection on: ${imagePath}`);
        console.log(`🤖 Using model: ${modelName}`);
        console.log(`📦 Model path: ${modelPath}`);
        
        // Spawn Python process
        const pythonProcess = spawn(pythonPath, [
            pythonScript,
            '--image', imagePath,
            '--model', modelPath,
            '--project', detectionProjectPath
        ]);
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            const processingTime = Date.now() - startTime;
            
            if (code !== 0) {
                console.error('Python error:', errorOutput);
                return reject(new Error(`Detection failed: ${errorOutput || 'Unknown error'}`));
            }
            
            try {
                // Parse JSON output from Python
                const result = JSON.parse(output.trim());
                result.processingTime = processingTime;
                result.modelUsed = modelName;
                resolve(result);
            } catch (e) {
                console.error('Failed to parse Python output:', output);
                reject(new Error('Failed to parse detection result'));
            }
        });
        
        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });
    });
};

/**
 * Run DeepFake detection on a video using Python model
 * @param {string} videoPath - Path to the video file
 * @returns {Promise<object>} Detection result with frame analysis
 */
const runVideoDetection = (videoPath) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        // Path to the detection project
        const detectionProjectPath = process.env.DETECTION_PROJECT_PATH || 
            'D:/Coding/img/DeepFake-Detection-for-Image';
        
        // Python script path
        const pythonScript = path.join(__dirname, '..', '..', 'python', 'detect.py');
        
        // Model path
        const modelPath = process.env.MODEL_PATH || 
            path.join(detectionProjectPath, 'models', 'deepfake_detector.h5');
        
        // Check if model exists
        if (!fs.existsSync(modelPath)) {
            return reject(new Error(`Model not found at: ${modelPath}`));
        }
        
        // Python command
        const pythonPath = process.env.PYTHON_PATH || 'python';
        
        console.log(`🎬 Running video detection on: ${videoPath}`);
        console.log(`📦 Using model: ${modelPath}`);
        
        // Spawn Python process with --video flag
        const pythonProcess = spawn(pythonPath, [
            pythonScript,
            '--video', videoPath,
            '--model', modelPath,
            '--project', detectionProjectPath
        ]);
        
        let output = '';
        let errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            const processingTime = Date.now() - startTime;
            
            if (code !== 0) {
                console.error('Python error:', errorOutput);
                return reject(new Error(`Video detection failed: ${errorOutput || 'Unknown error'}`));
            }
            
            try {
                // Parse JSON output from Python
                const result = JSON.parse(output.trim());
                result.processingTime = processingTime;
                resolve(result);
            } catch (e) {
                console.error('Failed to parse Python output:', output);
                reject(new Error('Failed to parse video detection result'));
            }
        });
        
        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });
    });
};

/**
 * Run DeepFake detection on audio using Python model
 * @param {string} audioPath - Path to the audio file
 * @returns {Promise<object>} Detection result
 */
const runAudioDetection = async (audioPath) => {
    try {
        const startTime = Date.now();
        
        // Convert audio to WAV format (required for Python librosa)
        console.log(`🔄 Converting audio to WAV format...`);
        const wavPath = await convertToWav(audioPath);
        console.log(`✅ Audio converted: ${path.basename(wavPath)}`);
        
        // Python script path for audio detection
        const pythonScript = path.join(__dirname, '..', '..', 'python', 'detect_audio.py');
        
        // Check if script exists
        if (!fs.existsSync(pythonScript)) {
            throw new Error(`Audio detection script not found at: ${pythonScript}`);
        }
        
        // Python command
        const pythonPath = process.env.PYTHON_PATH || 'python';
        
        console.log(`🎵 Running audio detection on: ${path.basename(wavPath)}`);
        
        return new Promise((resolve, reject) => {
            // Spawn Python process
            const pythonProcess = spawn(pythonPath, [
                pythonScript,
                wavPath
            ]);
            
            let output = '';
            let errorOutput = '';
            
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            pythonProcess.on('close', (code) => {
                const processingTime = Date.now() - startTime;
                
                // Clean up WAV file after processing
                if (fs.existsSync(wavPath)) {
                    try {
                        fs.unlinkSync(wavPath);
                        console.log('🗑️  Cleaned up temporary WAV file');
                    } catch (err) {
                        console.warn('⚠️  Could not delete WAV file:', err.message);
                    }
                }
                
                if (code !== 0) {
                    console.error('Python error:', errorOutput);
                    return reject(new Error(`Audio detection failed: ${errorOutput || 'Unknown error'}`));
                }
                
                try {
                    // Parse JSON output from Python
                    const result = JSON.parse(output.trim());
                    result.processingTime = result.processingTime || processingTime;
                    resolve(result);
                } catch (e) {
                    console.error('Failed to parse Python output:', output);
                    reject(new Error('Failed to parse audio detection result'));
                }
            });
            
            pythonProcess.on('error', (err) => {
                // Clean up WAV file on error
                if (fs.existsSync(wavPath)) {
                    try {
                        fs.unlinkSync(wavPath);
                    } catch (cleanupErr) {
                        // Ignore cleanup errors
                    }
                }
                reject(new Error(`Failed to start Python process: ${err.message}`));
            });
        });
    } catch (error) {
        throw new Error(`Audio processing failed: ${error.message}`);
    }
};

module.exports = { runDetection, runVideoDetection, runAudioDetection };