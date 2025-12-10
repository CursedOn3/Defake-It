import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiAlertTriangle, FiCheckCircle, FiClock, FiPercent, FiArrowLeft, FiHome } from 'react-icons/fi';

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, imageUrl } = location.state || {};

  // Redirect to home if no result data
  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Result Found</h2>
            <p className="text-gray-600 mb-8">
              Please upload an image first to see detection results.
            </p>
            <Link to="/" className="btn btn-primary">
              <FiHome className="mr-2" />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFake = result.isFake;
  const confidence = result.confidence || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Home</span>
        </button>

        {/* Main Result Card */}
        <div className={`rounded-3xl overflow-hidden shadow-2xl ${isFake ? 'ring-4 ring-red-400' : 'ring-4 ring-green-400'}`}>
          {/* Header */}
          <div className={`p-8 text-white text-center ${isFake ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}>
            <div className="flex items-center justify-center space-x-4 mb-4">
              {isFake ? (
                <FiAlertTriangle className="text-6xl animate-pulse" />
              ) : (
                <FiCheckCircle className="text-6xl" />
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">
              {isFake ? '⚠️ DEEPFAKE DETECTED!' : '✅ AUTHENTIC IMAGE'}
            </h1>
            <p className="text-xl text-white/90">
              {isFake
                ? 'This image appears to be manipulated or AI-generated'
                : 'This image appears to be genuine and unaltered'}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white p-8">
            {/* Image Preview */}
            {imageUrl && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Analyzed Image</h3>
                <div className="bg-gray-100 rounded-xl p-4">
                  <img
                    src={imageUrl}
                    alt="Analyzed"
                    className="max-h-80 mx-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Confidence Score */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center space-x-3 text-gray-500 mb-3">
                  <FiPercent className="text-xl" />
                  <span className="font-medium">Confidence Score</span>
                </div>
                <div className={`text-5xl font-bold mb-3 ${isFake ? 'text-red-600' : 'text-green-600'}`}>
                  {confidence.toFixed(1)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${isFake ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {confidence >= 80 ? 'High confidence' : confidence >= 50 ? 'Medium confidence' : 'Low confidence'}
                </p>
              </div>

              {/* Processing Time */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center space-x-3 text-gray-500 mb-3">
                  <FiClock className="text-xl" />
                  <span className="font-medium">Processing Time</span>
                </div>
                <div className="text-5xl font-bold text-gray-700 mb-3">
                  {result.processingTime ? `${(result.processingTime / 1000).toFixed(2)}` : 'N/A'}
                </div>
                <p className="text-gray-500">seconds</p>
              </div>
            </div>

            {/* Details Table */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Detection Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500">File Name</span>
                  <span className="text-gray-800 font-medium">{result.originalName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500">Prediction</span>
                  <span className={`font-bold ${isFake ? 'text-red-600' : 'text-green-600'}`}>
                    {isFake ? '🔴 FAKE' : '🟢 REAL'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-500">Raw Score</span>
                  <span className="text-gray-800 font-mono">{result.rawScore?.toFixed(6) || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Model Used</span>
                  <span className="text-gray-800">DeepFake Detector v1.0</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => navigate('/')}
                className="flex-1 btn btn-primary"
              >
                Analyze Another Image
              </button>
              <Link to="/history" className="flex-1 btn btn-secondary text-center">
                View History
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
          <p className="text-yellow-700 text-sm">
            ⚠️ This result is based on AI analysis and should not be considered definitive proof.
            Always verify important content through multiple sources.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Result;
