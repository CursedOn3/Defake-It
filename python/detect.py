"""
DeepFake Detection Bridge Script
Connects the MERN web app to the Python detection model
"""

import sys
import os
import json
import argparse

# Suppress TensorFlow warnings BEFORE importing tensorflow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress TF logging
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import warnings
warnings.filterwarnings('ignore')

# Redirect stderr to suppress any remaining warnings during import
import io
old_stderr = sys.stderr
sys.stderr = io.StringIO()

def detect_image(image_path, model_path, project_path):
    """
    Run deepfake detection on an image
    
    Args:
        image_path: Path to the image file
        model_path: Path to the trained model
        project_path: Path to the DeepFake detection project
    
    Returns:
        dict: Detection result
    """
    # Add project path to sys.path
    if project_path not in sys.path:
        sys.path.insert(0, project_path)
    
    try:
        # Import from the detection project
        from src.inference import DeepfakeInference
        
        # Suppress stdout temporarily to catch print statements
        old_stdout = sys.stdout
        sys.stdout = io.StringIO()
        
        # Initialize detector
        detector = DeepfakeInference(model_path)
        
        # Run detection
        result = detector.predict_single_image(image_path, verbose=False)
        
        # Restore stdout
        sys.stdout = old_stdout
        
        if result is None:
            return {
                'success': False,
                'error': 'Failed to process image',
                'prediction': 'error',
                'confidence': 0
            }
        
        # Format output
        output = {
            'success': True,
            'prediction': result.get('prediction', 'unknown'),
            'confidence': float(result.get('confidence', 0) * 100),  # Convert to percentage
            'raw_score': float(result.get('probability', 0)),
            'is_fake': result.get('prediction', '').lower() == 'fake',
            'model': os.path.basename(model_path)
        }
        
        return output
        
    except ImportError as e:
        # Fallback: Use simple TensorFlow loading
        return detect_with_tensorflow(image_path, model_path)
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'prediction': 'error',
            'confidence': 0
        }

def detect_with_tensorflow(image_path, model_path):
    """
    Fallback detection using direct TensorFlow model loading
    """
    try:
        import numpy as np
        from tensorflow.keras.models import load_model
        from tensorflow.keras.preprocessing.image import load_img, img_to_array
        
        # Load model
        model = load_model(model_path)
        
        # Get input shape from model
        input_shape = model.input_shape[1:3]  # (height, width)
        
        # Load and preprocess image
        img = load_img(image_path, target_size=input_shape)
        img_array = img_to_array(img)
        img_array = img_array / 255.0  # Normalize
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        
        # Predict
        prediction = model.predict(img_array, verbose=0)
        
        # Get probability (assuming binary classification)
        prob = float(prediction[0][0]) if prediction.shape[-1] == 1 else float(prediction[0][1])
        
        # Determine class
        is_fake = prob >= 0.5
        confidence = prob if is_fake else (1 - prob)
        
        return {
            'success': True,
            'prediction': 'fake' if is_fake else 'real',
            'confidence': confidence * 100,
            'raw_score': prob,
            'is_fake': is_fake,
            'model': os.path.basename(model_path)
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'prediction': 'error',
            'confidence': 0
        }

def main():
    # Restore stderr for argument parsing errors
    sys.stderr = old_stderr
    
    parser = argparse.ArgumentParser(description='DeepFake Detection')
    parser.add_argument('--image', required=True, help='Path to image file')
    parser.add_argument('--model', required=True, help='Path to model file')
    parser.add_argument('--project', default='', help='Path to detection project')
    
    args = parser.parse_args()
    
    # Suppress stderr again during processing
    sys.stderr = io.StringIO()
    
    # Validate image path
    if not os.path.exists(args.image):
        sys.stderr = old_stderr
        result = {'success': False, 'error': f'Image not found: {args.image}'}
        print(json.dumps(result))
        sys.exit(1)
    
    # Validate model path
    if not os.path.exists(args.model):
        sys.stderr = old_stderr
        result = {'success': False, 'error': f'Model not found: {args.model}'}
        print(json.dumps(result))
        sys.exit(1)
    
    # Run detection
    result = detect_image(args.image, args.model, args.project)
    
    # Restore stderr before output
    sys.stderr = old_stderr
    
    # Output JSON result (only this should go to stdout)
    print(json.dumps(result))
    
    # Exit with appropriate code
    sys.exit(0 if result.get('success', False) else 1)

if __name__ == '__main__':
    main()
