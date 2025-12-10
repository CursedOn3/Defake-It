import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiShield, FiHome, FiClock, FiInfo, FiSearch, FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const isActive = (path) => location.pathname === path;
  
  const navLinks = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/detect', label: 'Detect', icon: FiSearch },
    { path: '/history', label: 'History', icon: FiClock },
    { path: '/about', label: 'About', icon: FiInfo },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
              <FiShield className="text-white text-xl" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              DeepFake<span className="text-primary-600">Detector</span>
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200
                  ${isActive(path) 
                    ? 'bg-primary-100 text-primary-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon className="text-lg" />
                <span>{label}</span>
              </Link>
            ))}

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <FiUser className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <FiLogOut className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <FiLogIn className="text-lg" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
