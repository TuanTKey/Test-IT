const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'teacher'], // THÊM 'teacher'
    default: 'user'
  },
  avatar: {
    type: String
  },
  bio: {
    type: String
  },
  solvedProblems: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 1200
  },
  // THÊM CÁC FIELD MỚI CHO QUẢN LÝ LỚP
  class: {
    type: String,
    trim: true,
    // Chỉ required cho học sinh, không required cho admin/teacher
    required: function() {
      return this.role === 'user'; // Chỉ required nếu là user (học sinh)
    },
    enum: [
      '10A1', '10A2', '10A3', '10A4', '10A5',
      '11A1', '11A2', '11A3', '11A4', '11A5', 
      '12A1', '12A2', '12A3', '12A4', '12A5',
      'ADMIN', 'TEACHER','NONE'
    ]
  },
  // Field để giáo viên quản lý nhiều lớp
  teacherClasses: [{
    type: String,
    enum: [
      '10A1', '10A2', '10A3', '10A4', '10A5',
      '11A1', '11A2', '11A3', '11A4', '11A5', 
      '12A1', '12A2', '12A3', '12A4', '12A5'
    ]
  }],
  // Giữ lại field cũ từ code của bạn
  submissionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving - GIỮ NGUYÊN
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method - GIỮ NGUYÊN
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Thêm virtual để lấy role text
userSchema.virtual('roleText').get(function() {
  const roleMap = {
    'admin': 'Quản trị viên',
    'teacher': 'Giáo viên',
    'user': 'Học sinh'
  };
  return roleMap[this.role] || this.role;
});

// Thêm method để kiểm tra quyền
userSchema.methods.isTeacherOfClass = function(className) {
  if (this.role === 'admin') return true;
  if (this.role === 'teacher') {
    return this.teacherClasses.includes(className);
  }
  return false;
};

// Index cho tìm kiếm theo class và role
userSchema.index({ class: 1, role: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);