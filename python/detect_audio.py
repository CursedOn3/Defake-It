"""
Audio Deepfake Detection Script
Uses the audio-deepfake-detection model for inference
"""

import sys
import json
import os
import time
from pathlib import Path
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Suppress TensorFlow logging
import logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)

# Add the audio-deepfake-detection directory to the Python path
AUDIO_DETECTION_PATH = Path(r"D:\Final Year Project\audio-deepfake-detection")
sys.path.insert(0, str(AUDIO_DETECTION_PATH))

# Import custom model classes BEFORE loading any models
# This ensures they are registered with Keras
from src.models.hybrid_model import HybridDeepfakeDetector
from src.models.attention import MultiHeadAttention

from src.inference.detector import DeepfakeDetector

# Model path
MODEL_PATH = AUDIO_DETECTION_PATH / "models" / "deepfake_detector.keras"

def detect_audio(audio_path):
    """
    Detect if an audio file is a deepfake
    
    Args:
        audio_path: Path to the audio file
        
    Returns:
        dict: Detection results
    """
    try:
        start_time = time.time()
        
        # Initialize detector
        detector = DeepfakeDetector(
            model_path=str(MODEL_PATH),
            threshold=0.5,
            target_sr=16000,
            target_length=256
        )
        
        # Run detection
        result = detector.detect_single(audio_path, return_confidence=True)
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        if result['success']:
            # Format output
            output = {
                'success': True,
                'prediction': 'fake' if result['is_deepfake'] else 'real',
                'confidence': round(result['confidence'] * 100, 2),
                'raw_score': round(result['probability'], 4),
                'is_deepfake': result['is_deepfake'],
                'threshold_used': result['threshold_used'],
                'processing_time': round(processing_time, 2),
                'model': 'audio_deepfake_detector'
            }
        else:
            output = {
                'success': False,
                'error': result.get('error', 'Unknown error occurred'),
                'processing_time': round(processing_time, 2)
            }
        
        return output
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return {
            'success': False,
            'error': str(e),
            'error_details': error_details
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'No audio file path provided'
        }))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    
    if not os.path.exists(audio_path):
        print(json.dumps({
            'success': False,
            'error': f'Audio file not found: {audio_path}'
        }))
        sys.exit(1)
    
    # Run detection
    result = detect_audio(audio_path)
    
    # Output JSON result
    print(json.dumps(result))