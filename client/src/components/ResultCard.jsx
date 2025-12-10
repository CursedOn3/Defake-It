import { FiAlertTriangle, FiCheckCircle, FiClock, FiPercent } from 'react-icons/fi';

function ResultCard({ result, imageUrl }) {
  if (!result) return null;

  const isFake = result.isFake || result.prediction === 'fake';
  const confidence = result.confidence || 0;
  
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-float">
      <div className={`rounded-2xl overflow-hidden shadow-2xl ${isFake ? 'result-fake' : 'result-real'}`}>
        {/* Header */}
        <div className="p-6 text-white">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {isFake ? (
              <FiAlertTriangle className="text-4xl animate-pulse" />
            ) : (
              <FiCheckCircle className="text-4xl" />
            )}
            <h2 className="text-3xl font-bold">
              {isFake ? 'DEEPFAKE DETECTED!' : 'AUTHENTIC IMAGE'}
            </h2>
          </div>
          
          <p className="text-center text-white/90 text-lg">
            {isFake 
              ? '⚠️ This image appears to be manipulated or AI-generated'
              : '✅ This image appears to be genuine and unaltered'
            }
          </p>
        </div>
        
        {/* Stats */}
        <div className="bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Confidence */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-500 mb-2">
                <FiPercent />
                <span className="text-sm font-medium">Confidence</span>
              </div>
              <div className={`text-3xl font-bold ${isFake ? 'text-danger-600' : 'text-success-600'}`}>
                {confidence.toFixed(1)}%
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${isFake ? 'bg-danger-500' : 'bg-success-500'}`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
            
            {/* Processing Time */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-500 mb-2">
                <FiClock />
                <span className="text-sm font-medium">Processing Time</span>
              </div>
              <div className="text-3xl font-bold text-gray-700">
                {result.processingTime ? `${(result.processingTime / 1000).toFixed(2)}s` : 'N/A'}
              </div>
              <p className="text-sm text-gray-400 mt-1">seconds</p>
            </div>
          </div>
          
          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <img 
                src={imageUrl} 
                alt="Analyzed" 
                className="w-full h-48 object-contain rounded-lg"
              />
            </div>
          )}
          
          {/* Details */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-2">Detection Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">File:</div>
              <div className="text-gray-700 truncate">{result.originalName || 'Unknown'}</div>
              <div className="text-gray-500">Prediction:</div>
              <div className={`font-semibold ${isFake ? 'text-danger-600' : 'text-success-600'}`}>
                {isFake ? 'FAKE' : 'REAL'}
              </div>
              <div className="text-gray-500">Raw Score:</div>
              <div className="text-gray-700">{result.rawScore?.toFixed(4) || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultCard;
