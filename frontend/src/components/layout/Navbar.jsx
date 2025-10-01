import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../admin/AuthContext';
import { Code2, Trophy, BarChart3, LogOut, Shield, Home, FileCode } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Code2 className="text-purple-600" size={34} />
            <div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                CodeJudge
              </span>
              <div className="text-xs text-gray-500 -mt-1">Luyện tập & Thi đấu</div>
            </div>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-200 font-medium group"
              >
                <Home size={18} className="group-hover:scale-110 transition-transform" />
                <span>Trang chủ</span>
              </Link>
              
              <Link 
                to="/problems" 
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-200 font-medium group"
              >
                <FileCode size={18} className="group-hover:scale-110 transition-transform" />
                <span>Bài tập</span>
              </Link>
              
              <Link 
                to="/contests" 
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-200 font-medium group"
              >
                <Trophy size={18} className="group-hover:scale-110 transition-transform" />
                <span>Cuộc thi</span>
              </Link>
              
              <Link 
                to="/leaderboard" 
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-200 font-medium group"
              >
                <BarChart3 size={18} className="group-hover:scale-110 transition-transform" />
                <span>Xếp hạng</span>
              </Link>
              
              {/* Admin Link */}
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg group"
                >
                  <Shield size={18} className="group-hover:scale-110 transition-transform" />
                  <span>Quản trị</span>
                </Link>
              )}
            </div>
          )}

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Profile */}
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-3 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user.username[0].toUpperCase()}
                    </div>
                    {user.role === 'admin' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-semibold text-gray-800">
                        {user.username}
                      </div>
                      {user.role === 'admin' && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <Trophy size={12} className="text-yellow-500" />
                      <span>Điểm: {user.rating || 0}</span>
                    </div>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 font-medium group"
                >
                  <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden md:block">Đăng xuất</span>
                </button>
              </>
            ) : (
              /* Login/Signup for non-authenticated users */
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-200 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Only show when user is logged in */}
        {user && (
          <div className="md:hidden border-t border-gray-200 mt-2 pt-3 pb-2">
            <div className="flex justify-around items-center">
              <Link 
                to="/" 
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-purple-600 transition-all"
              >
                <Home size={20} />
                <span className="text-xs font-medium">Trang chủ</span>
              </Link>
              
              <Link 
                to="/problems" 
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-purple-600 transition-all"
              >
                <FileCode size={20} />
                <span className="text-xs font-medium">Bài tập</span>
              </Link>
              
              <Link 
                to="/contests" 
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-purple-600 transition-all"
              >
                <Trophy size={20} />
                <span className="text-xs font-medium">Cuộc thi</span>
              </Link>
              
              <Link 
                to="/leaderboard" 
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-purple-600 transition-all"
              >
                <BarChart3 size={20} />
                <span className="text-xs font-medium">Xếp hạng</span>
              </Link>

              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex flex-col items-center space-y-1 text-orange-600 hover:text-orange-700 transition-all"
                >
                  <Shield size={20} />
                  <span className="text-xs font-medium">Quản trị</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;