import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiShield, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [devResetUrl, setDevResetUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await api.post('/auth/forgot-password', { email });
            
            if (response.data.success) {
                setSuccess(true);
                // In development, show the reset URL for testing
                if (response.data.resetUrl) {
                    setDevResetUrl(response.data.resetUrl);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4 py-12">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <FiShield className="text-white text-2xl" />
                        </div>
                        <span className="text-2xl font-bold text-white">DeepGuard</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
                    {!success ? (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center mb-2">Forgot Password?</h2>
                            <p className="text-gray-400 text-center mb-8">
                                No worries! Enter your email and we'll send you a reset link.
                            </p>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center space-x-3">
                                    <FiAlertCircle className="text-red-400 flex-shrink-0" />
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Sending...</span>
                                        </span>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiCheckCircle className="text-green-400 text-3xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                            <p className="text-gray-400 mb-6">
                                If an account exists for <span className="text-white">{email}</span>, 
                                you will receive a password reset link shortly.
                            </p>

                            {/* Development mode - show reset URL */}
                            {devResetUrl && (
                                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-left">
                                    <p className="text-yellow-400 text-sm font-medium mb-2">🛠️ Development Mode:</p>
                                    <p className="text-gray-400 text-xs mb-2">Click the link below to reset your password:</p>
                                    <a 
                                        href={devResetUrl.replace('http://localhost:5173', '')} 
                                        className="text-purple-400 text-sm break-all hover:underline"
                                    >
                                        {devResetUrl}
                                    </a>
                                </div>
                            )}

                            <p className="text-gray-500 text-sm">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button 
                                    onClick={() => setSuccess(false)}
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Back to Login Link */}
                    <div className="mt-8 text-center">
                        <Link 
                            to="/login" 
                            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <FiArrowLeft />
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
