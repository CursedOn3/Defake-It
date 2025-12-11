import { Link } from 'react-router-dom';
import { FiShield, FiUpload, FiCpu, FiCheckCircle, FiAlertTriangle, FiArrowRight, FiGithub, FiZap, FiLock, FiBarChart2 } from 'react-icons/fi';

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-5 bg-white/10 backdrop-blur-sm rounded-2xl">
                <FiShield className="text-6xl" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Detect DeepFakes with
              <span className="block text-primary-200">AI-Powered Precision</span>
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-10">
              Protect yourself from manipulated media. Our advanced deep learning model 
              analyzes images in seconds to detect AI-generated or altered content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/detect"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FiUpload className="mr-2" />
                Start Detection
                <FiArrowRight className="ml-2" />
              </Link>
              <a
                href="https://github.com/CursedOn3/DefakeIt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-800/50 text-white font-semibold rounded-xl hover:bg-primary-800 transition-all duration-300 border border-primary-400/30"
              >
                <FiGithub className="mr-2" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">95%+</div>
              <div className="text-gray-600 mt-1">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">&lt;5s</div>
              <div className="text-gray-600 mt-1">Analysis Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">10K+</div>
              <div className="text-gray-600 mt-1">Images Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">Free</div>
              <div className="text-gray-600 mt-1">To Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to verify the authenticity of any image
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <FiUpload className="text-3xl text-primary-600" />
                </div>
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Image</h3>
                <p className="text-gray-600">
                  Drag and drop or click to upload any image you want to verify. 
                  Supports JPG, PNG, and WebP formats up to 10MB.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <FiCpu className="text-3xl text-purple-600" />
                </div>
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Analysis</h3>
                <p className="text-gray-600">
                  Our deep learning model analyzes the image for signs of manipulation, 
                  AI generation, or facial alterations.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow h-full">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <FiCheckCircle className="text-3xl text-green-600" />
                </div>
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Get Results</h3>
                <p className="text-gray-600">
                  Receive detailed results with confidence scores indicating the 
                  likelihood of the image being authentic or manipulated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology to fight misinformation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiZap className="text-2xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600 text-sm">
                Get results in seconds with our optimized pipeline
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiBarChart2 className="text-2xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">High Accuracy</h3>
              <p className="text-gray-600 text-sm">
                Trained on thousands of real and fake images
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiLock className="text-2xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600 text-sm">
                Your images are processed securely and not stored
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiGithub className="text-2xl text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Open Source</h3>
              <p className="text-gray-600 text-sm">
                Transparent and community-driven development
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Results Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Example results from our detection system
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Fake Example */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <FiAlertTriangle className="text-xl" />
                  <span className="font-bold">DEEPFAKE DETECTED</span>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-100 h-40 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400">Sample Fake Image</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confidence</span>
                  <span className="text-red-600 font-bold">89.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '89.2%' }} />
                </div>
              </div>
            </div>
            
            {/* Real Example */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="text-xl" />
                  <span className="font-bold">AUTHENTIC IMAGE</span>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-100 h-40 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-400">Sample Real Image</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confidence</span>
                  <span className="text-green-600 font-bold">94.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.7%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Verify Your Images?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Start detecting deepfakes now - it's free and takes just seconds.
          </p>
          <Link
            to="/detect"
            className="inline-flex items-center justify-center px-10 py-5 bg-white text-primary-700 font-bold text-lg rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FiShield className="mr-3 text-xl" />
            Start Free Detection
            <FiArrowRight className="ml-3" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 text-white mb-4">
                <FiShield className="text-2xl text-primary-400" />
                <span className="font-bold text-xl">DeepFake Detector</span>
              </div>
              <p className="text-gray-400 mb-4">
                Fighting misinformation with AI-powered deepfake detection. 
                Protect yourself and others from manipulated media.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/detect" className="hover:text-white transition-colors">Detect</Link></li>
                <li><Link to="/history" className="hover:text-white transition-colors">History</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="https://github.com/CursedOn3/DefakeIt" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>© 2025 DeepFake Detector. Built with ❤️ for a safer digital world.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
