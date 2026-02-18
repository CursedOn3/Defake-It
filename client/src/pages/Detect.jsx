import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { detectImage } from '../services/api';
import { FiShield, FiAlertCircle, FiCpu } from 'react-icons/fi';

const AVAILABLE_MODELS = [
  {
    id: 'deepfake_detector',
    name: 'DeepFake Detector (Default)',
    description: 'Standard model with good accuracy',
    accuracy: '94%'
  },
  {
    id: 'efficientnet_b0',
    name: 'EfficientNet B0',
    description: 'Fast and lightweight model',
    accuracy: '92%'
  },
  {
    id: 'resnet50',
    name: 'ResNet50',
    description: 'Deep residual network',
    accuracy: '93%'
  },
  {
    id: 'xception',
    name: 'Xception',
    description: 'High accuracy model',
    accuracy: '95%'
  }
];

function Home() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedModel, setSelectedModel] = useState('deepfake_detector');

  const handleUpload = async (file) => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    // Create preview URL for result page
    const imagePreview = URL.createObjectURL(file);

    try {
      const response = await detectImage(file, selectedModel, (prog) => {
        setProgress(prog);
      });

      const resultData = {
        isFake: response.data.isFake,
        confidence: response.data.confidence,
        rawScore: response.data.rawScore,
        processingTime: response.data.processingTime,
        originalName: file.name,
        modelUsed: response.data.modelUsed || selectedModel,
      };

      // Navigate to result page with data
      navigate('/result', { 
        state: { 
          result: resultData, 
          imageUrl: imagePreview 
        } 
      });
    } catch (err) {
      setError(err.error || err.message || 'Failed to analyze image. Please try again.');
      console.error('Upload error:', err);
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary-100 rounded-full">
              <FiShield className="text-5xl text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            DeepFake Detection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an image to analyze it for potential deepfake manipulation. 
            Our AI-powered system uses advanced deep learning to detect synthetic media.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Model Selection */}
          <div className="mb-6">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
              <FiCpu className="text-primary-600" />
              <span>Select Detection Model</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  disabled={isAnalyzing}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedModel === model.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {model.name}
                    </h3>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      {model.accuracy}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{model.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Image Uploader */}
          <ImageUploader
            onUpload={handleUpload}
            isLoading={isAnalyzing}
          />

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Analyzing image...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-gray-500 mt-4 text-sm">
                Running deep learning model to detect manipulation...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-center space-x-3">
              <FiAlertCircle className="text-danger-500 text-xl flex-shrink-0" />
              <p className="text-danger-700">{error}</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">AI-Powered</h3>
            <p className="text-gray-600 text-sm">
              Uses advanced deep learning models trained on thousands of images
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Fast Analysis</h3>
            <p className="text-gray-600 text-sm">
              Get results in seconds with our optimized detection pipeline
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Confidence Score</h3>
            <p className="text-gray-600 text-sm">
              Detailed confidence metrics to understand detection certainty
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
