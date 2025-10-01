const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Public routes
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:id', userController.getUserProfile);

// Authenticated routes
router.get('/me', authenticate, userController.getCurrentUser);
router.put('/me', authenticate, userController.updateProfile);

// Class management routes
router.get('/classes/all', userController.getClasses);
router.get('/class/:class/users', authenticate, userController.getUsersByClass);
router.get('/class/:class/statistics', authenticate, userController.getClassStatistics);

// Admin only routes
router.get('/admin/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'user' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    res.json({ 
      totalUsers,
      totalStudents, 
      totalTeachers,
      totalAdmins
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// THÊM API LẤY DANH SÁCH GIÁO VIÊN
router.get('/admin/teachers', authenticate, isAdmin, async (req, res) => {
  try {
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
});

// THÊM API CẬP NHẬT LỚP CHO GIÁO VIÊN
router.put('/admin/teachers/:teacherId/classes', authenticate, isAdmin, userController.updateTeacherClasses);

// THÊM API LẤY USERS THEO LỚP (đã có trong controller)
router.get('/class/:className/users', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    
    const users = await User.find({ 
      class: className,
      role: 'user' // chỉ lấy học sinh
    }).select('username fullName email solvedProblems rating avatar class');
    
    res.json({
      className,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Get class users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// THÊM API LẤY THỐNG KÊ LỚP
router.get('/class/:className/statistics', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    
    // Lấy tất cả users trong lớp
    const users = await User.find({ class: className, role: 'user' });
    const userIds = users.map(user => user._id);
    
    // Import Submission model
    const Submission = require('../models/Submission');
    
    // Lấy thống kê submissions
    const submissions = await Submission.find({ 
      userId: { $in: userIds } 
    });
    
    const acceptedSubmissions = submissions.filter(sub => sub.status === 'accepted');
    const solvedProblems = new Set(acceptedSubmissions.map(sub => sub.problemId?.toString())).size;
    
    res.json({
      className,
      totalStudents: users.length,
      totalSubmissions: submissions.length,
      acceptedSubmissions: acceptedSubmissions.length,
      solvedProblemsCount: solvedProblems,
      acceptanceRate: submissions.length > 0 ? 
        ((acceptedSubmissions.length / submissions.length) * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Get class statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;