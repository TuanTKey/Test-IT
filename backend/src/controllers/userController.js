const User = require('../models/User');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get statistics
    const totalSubmissions = await Submission.countDocuments({ 
      userId: user._id 
    });

    const acceptedSubmissions = await Submission.countDocuments({
      userId: user._id,
      status: 'accepted'
    });

    const solvedProblems = await Submission.distinct('problemId', {
      userId: user._id,
      status: 'accepted'
    });

    // Get difficulty breakdown
    const solvedProblemDetails = await Problem.find({
      _id: { $in: solvedProblems }
    }).select('difficulty');

    const difficultyBreakdown = {
      easy: 0,
      medium: 0,
      hard: 0
    };

    solvedProblemDetails.forEach(p => {
      difficultyBreakdown[p.difficulty]++;
    });

    // Get recent submissions
    const recentSubmissions = await Submission.find({
      userId: user._id
    })
      .populate('problemId', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      statistics: {
        totalSubmissions,
        acceptedSubmissions,
        solvedProblems: solvedProblems.length,
        difficultyBreakdown,
        acceptanceRate: totalSubmissions > 0 
          ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)
          : 0
      },
      recentSubmissions
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, class: className } = req.query;

    let query = {};
    if (className && className !== 'all') {
      query.class = className;
    }

    const users = await User.find(query)
      .select('username fullName class rating solvedProblems avatar')
      .sort({ rating: -1, solvedProblems: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    const leaderboard = users.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      ...user.toObject()
    }));

    res.json({
      leaderboard,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ========== QUẢN LÝ LỚP HỌC ========== //

// Lấy danh sách tất cả lớp
exports.getClasses = async (req, res) => {
  try {
    const classes = await User.distinct('class', { 
      class: { $ne: null, $ne: '' } 
    });
    
    res.json({
      classes: classes.sort(),
      total: classes.length
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy danh sách học sinh theo lớp
exports.getUsersByClass = async (req, res) => {
  try {
    const { class: className } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Kiểm tra quyền: giáo viên chỉ xem được lớp mình quản lý
    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.id);
      if (!teacher.teacherClasses.includes(className)) {
        return res.status(403).json({ error: 'Bạn không có quyền xem lớp này' });
      }
    }

    const query = { 
      class: className, 
      role: 'student' 
    };
    
    const users = await User.find(query)
      .select('username fullName email solvedProblems submissionCount avatar createdAt')
      .sort({ solvedProblems: -1, username: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Lấy thống kê chi tiết cho lớp
    const classStats = await Submission.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: {
          'user.class': className,
          'user.role': 'student'
        }
      },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          uniqueStudents: { $addToSet: '$userId' }
        }
      }
    ]);

    const count = await User.countDocuments(query);

    res.json({
      users,
      className,
      statistics: classStats[0] ? {
        totalSubmissions: classStats[0].totalSubmissions,
        acceptedSubmissions: classStats[0].acceptedSubmissions,
        totalStudents: classStats[0].uniqueStudents.length,
        acceptanceRate: classStats[0].totalSubmissions > 0 
          ? ((classStats[0].acceptedSubmissions / classStats[0].totalSubmissions) * 100).toFixed(2)
          : 0
      } : {
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        totalStudents: 0,
        acceptanceRate: 0
      },
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get users by class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy thống kê lớp học cho giáo viên
exports.getClassStatistics = async (req, res) => {
  try {
    const { class: className } = req.params;

    // Kiểm tra quyền
    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user.id);
      if (!teacher.teacherClasses.includes(className)) {
        return res.status(403).json({ error: 'Bạn không có quyền xem thống kê lớp này' });
      }
    }

    const stats = await Submission.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $match: {
          'user.class': className,
          'user.role': 'student'
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const studentCount = await User.countDocuments({ 
      class: className, 
      role: 'student' 
    });

    const solvedProblems = await Submission.distinct('problemId', {
      status: 'accepted',
      userId: { 
        $in: await User.find({ class: className }).distinct('_id') 
      }
    });

    const recentSubmissions = await Submission.find({
      userId: { $in: await User.find({ class: className }).distinct('_id') }
    })
      .populate('userId', 'username fullName')
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      className,
      studentCount,
      solvedProblemsCount: solvedProblems.length,
      submissionStats: stats,
      recentSubmissions
    });
  } catch (error) {
    console.error('Get class statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cập nhật lớp cho giáo viên (admin only)
exports.updateTeacherClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { teacherClasses } = req.body;

    // Chỉ admin mới được cập nhật
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền này' });
    }

    const teacher = await User.findByIdAndUpdate(
      teacherId,
      { teacherClasses },
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ error: 'Giáo viên không tồn tại' });
    }

    res.json({
      message: 'Cập nhật lớp cho giáo viên thành công',
      teacher
    });
  } catch (error) {
    console.error('Update teacher classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy danh sách giáo viên và lớp họ quản lý
exports.getTeachers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền này' });
    }

    const teachers = await User.find({ role: 'teacher' })
      .select('username fullName email teacherClasses createdAt')
      .sort({ createdAt: -1 });

    res.json({
      teachers,
      total: teachers.length
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Cập nhật lớp cho giáo viên (admin only)
exports.updateTeacherClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { teacherClasses } = req.body;

    // Chỉ admin mới được cập nhật
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền này' });
    }

    const teacher = await User.findByIdAndUpdate(
      teacherId,
      { teacherClasses },
      { new: true, runValidators: true }
    ).select('-password');

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ error: 'Giáo viên không tồn tại' });
    }

    res.json({
      message: 'Cập nhật lớp cho giáo viên thành công',
      teacher
    });
  } catch (error) {
    console.error('Update teacher classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Lấy danh sách giáo viên và lớp họ quản lý
exports.getTeachers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền này' });
    }

    const teachers = await User.find({ role: 'teacher' })
      .select('username fullName email teacherClasses createdAt')
      .sort({ createdAt: -1 });

    res.json({
      teachers,
      total: teachers.length
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};