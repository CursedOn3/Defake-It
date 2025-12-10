import { FiShield, FiCode, FiDatabase, FiCpu, FiGithub, FiExternalLink } from 'react-icons/fi';

function About() {
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
            About DeepFake Detection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            An AI-powered tool to detect synthetic and manipulated media
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* What is DeepFake */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">What are DeepFakes?</h2>
            <p className="text-gray-600 leading-relaxed">
              DeepFakes are synthetic media in which a person in an existing image or video is replaced 
              with someone else's likeness using artificial intelligence. These techniques can create 
              convincing fake content that may be used for misinformation, fraud, or other malicious purposes.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Our detection system uses advanced deep learning models to analyze facial features, 
              artifacts, and inconsistencies that are often invisible to the human eye but detectable 
              by trained neural networks.
            </p>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📤</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">1. Upload</h3>
                <p className="text-gray-600 text-sm">
                  Upload an image you want to analyze. We support JPG, JPEG, and PNG formats.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">2. Analyze</h3>
                <p className="text-gray-600 text-sm">
                  Our AI model processes the image using deep learning to detect manipulation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">3. Results</h3>
                <p className="text-gray-600 text-sm">
                  Get instant results with confidence score indicating likelihood of manipulation.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Technology Stack</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiCode className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Frontend</h3>
                  <p className="text-gray-600 text-sm">
                    React 18, Vite, Tailwind CSS, React Router
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiDatabase className="text-xl text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Backend</h3>
                  <p className="text-gray-600 text-sm">
                    Node.js, Express.js, MongoDB
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiCpu className="text-xl text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">ML Model</h3>
                  <p className="text-gray-600 text-sm">
                    TensorFlow, Keras, EfficientNet architecture
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FiGithub className="text-xl text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Open Source</h3>
                  <p className="text-gray-600 text-sm">
                    MIT License, contributions welcome
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Disclaimer</h3>
            <p className="text-yellow-700 text-sm leading-relaxed">
              This tool is provided for educational and research purposes. While our model achieves 
              high accuracy, no detection system is 100% accurate. Results should be used as one 
              factor in assessing media authenticity, not as definitive proof. Always verify 
              important content through multiple sources and methods.
            </p>
          </div>

          {/* Links */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Learn More</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/CursedOn3/DeepFake-Detection-for-Image"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FiGithub />
                <span>View on GitHub</span>
              </a>
              <a
                href="https://tensorflow.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <FiExternalLink />
                <span>TensorFlow</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with ❤️ for fighting misinformation</p>
          <p className="mt-2">© 2024 DeepFake Detection. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
