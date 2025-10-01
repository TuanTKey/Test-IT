const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Lấy thông tin user từ database để có đầy đủ thông tin mới nhất
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user; // Lưu cả object user thay vì chỉ decoded token
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

exports.isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Teacher access required' });
  }
  next();
};

exports.isStudent = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
};

// Middleware kiểm tra giáo viên có quyền với lớp cụ thể
exports.canViewClass = async (req, res, next) => {
  try {
    const { class: className } = req.params;
    
    if (!className) {
      return res.status(400).json({ error: 'Class parameter is required' });
    }

    // Admin có quyền xem tất cả lớp
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Giáo viên chỉ xem được lớp mình quản lý
    if (req.user.role === 'teacher') {
      if (req.user.teacherClasses && req.user.teacherClasses.includes(className)) {
        return next();
      }
      return res.status(403).json({ 
        error: 'Bạn không có quyền xem lớp này',
        yourClasses: req.user.teacherClasses || []
      });
    }
    
    // Học sinh chỉ xem được lớp của chính mình
    if (req.user.role === 'user') {
      if (req.user.class === className) {
        return next();
      }
      return res.status(403).json({ 
        error: 'Bạn chỉ có thể xem lớp của mình',
        yourClass: req.user.class
      });
    }
    
    return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error('Class permission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware kiểm tra quyền chỉnh sửa thông tin user
exports.canEditUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Admin có thể chỉnh sửa bất kỳ user nào
    if (req.user.role === 'admin') {
      return next();
    }
    
    // User chỉ có thể chỉnh sửa chính mình
    if (req.user._id.toString() === id) {
      return next();
    }
    
    return res.status(403).json({ error: 'You can only edit your own profile' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware kiểm tra quyền xem submission
exports.canViewSubmission = async (req, res, next) => {
  try {
    const submissionId = req.params.id;
    
    // Admin và teacher có thể xem tất cả submission
    if (req.user.role === 'admin' || req.user.role === 'teacher') {
      return next();
    }
    
    // Học sinh chỉ xem được submission của chính mình
    // (Kiểm tra trong controller)
    return next();
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Middleware kiểm tra quyền quản lý bài tập
exports.canManageProblems = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Permission denied for problem management' });
  }
  next();
};

// Middleware tự động gán class cho học sinh khi tạo bài nộp
exports.autoAssignClass = (req, res, next) => {
  if (req.user.role === 'user' && req.user.class) {
    req.body.studentClass = req.user.class; // Thêm class vào request
  }
  next();
};

// Middleware ghi log truy cập (tùy chọn)
exports.logAccess = (req, res, next) => {
  console.log(`🔐 ${new Date().toISOString()} - ${req.user.role} ${req.user.username} accessed ${req.method} ${req.originalUrl}`);
  next();
};

// Kết hợp nhiều middleware
exports.authenticateAndLog = [exports.authenticate, exports.logAccess];
exports.teacherOrAdmin = [exports.authenticate, exports.isTeacher];
exports.adminOnly = [exports.authenticate, exports.isAdmin];
exports.authenticateWithClass = [exports.authenticate, exports.canViewClass];