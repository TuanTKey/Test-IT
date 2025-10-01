import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Users, BookOpen, CheckCircle, TrendingUp, Search, School, Plus, Edit, Trash2, UserPlus, AlertCircle } from 'lucide-react';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [classStats, setClassStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teacherId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching classes...');
      
      const classesRes = await api.get('/users/classes/all');
      console.log('📚 Classes response:', classesRes.data);
      
      // ĐẢM BẢO classesList KHÔNG CÓ NULL/UNDEFINED
      const classesList = (classesRes.data.classes || [])
        .filter(className => className && typeof className === 'string')
        .sort();
      
      console.log('✅ Filtered classes:', classesList);

      // TÍNH TOÁN THỦ CÔNG VÌ API STATS CÓ THỂ CHƯA CÓ
      try {
        const submissionsRes = await api.get('/submissions/admin/all?limit=1000');
        const submissions = submissionsRes.data.submissions || [];
        console.log('📊 Submissions count:', submissions.length);

        const stats = {};
        classesList.forEach(className => {
          const classSubmissions = submissions.filter(sub => 
            sub.userId?.class === className
          );
          const acceptedSubmissions = classSubmissions.filter(sub => 
            sub.status === 'accepted'
          );
          const uniqueStudents = new Set(
            classSubmissions.map(sub => sub.userId?._id).filter(id => id)
          ).size;
          
          stats[className] = {
            totalSubmissions: classSubmissions.length,
            acceptedSubmissions: acceptedSubmissions.length,
            uniqueStudents,
            acceptanceRate: classSubmissions.length > 0 ? 
              ((acceptedSubmissions.length / classSubmissions.length) * 100).toFixed(1) : 0,
            solvedProblems: new Set(
              acceptedSubmissions.map(sub => sub.problemId?._id).filter(id => id)
            ).size
          };
        });

        setClasses(classesList);
        setClassStats(stats);
        console.log('✅ Classes loaded:', classesList);
        console.log('📈 Stats calculated:', stats);
        
      } catch (statsError) {
        console.error('❌ Error calculating stats:', statsError);
        // Fallback: chỉ set classes không có stats
        setClasses(classesList);
        setClassStats({});
      }

    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      setError('Không thể tải danh sách lớp học');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      console.log('🔄 Fetching teachers...');
      const response = await api.get('/users/admin/teachers');
      console.log('👨‍🏫 Teachers response:', response.data);
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('❌ Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Creating class:', formData);
      const response = await api.post('/admin/classes', formData);
      console.log('✅ Class created:', response.data);
      alert('Tạo lớp thành công!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', teacherId: '' });
      fetchClasses();
    } catch (error) {
      console.error('❌ Error creating class:', error);
      alert(error.response?.data?.error || 'Không thể tạo lớp');
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Updating class:', selectedClass, formData);
      const response = await api.put(`/admin/classes/${selectedClass}`, formData);
      console.log('✅ Class updated:', response.data);
      alert('Cập nhật lớp thành công!');
      setShowEditModal(false);
      setSelectedClass(null);
      setFormData({ name: '', description: '', teacherId: '' });
      fetchClasses();
    } catch (error) {
      console.error('❌ Error updating class:', error);
      alert(error.response?.data?.error || 'Không thể cập nhật lớp');
    }
  };

  const handleDeleteClass = async (className) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lớp ${className}?`)) {
      return;
    }

    try {
      console.log('🔄 Deleting class:', className);
      const response = await api.delete(`/admin/classes/${className}`);
      console.log('✅ Class deleted:', response.data);
      alert('Xóa lớp thành công!');
      fetchClasses();
    } catch (error) {
      console.error('❌ Error deleting class:', error);
      alert(error.response?.data?.error || 'Không thể xóa lớp');
    }
  };

  const openEditModal = (className) => {
    setSelectedClass(className);
    setFormData({
      name: className,
      description: '',
      teacherId: ''
    });
    setShowEditModal(true);
  };

  // SỬA PHẦN FILTER - THÊM KIỂM TRA NULL
  const filteredClasses = classes.filter(className => {
    if (!className || typeof className !== 'string') return false;
    return className.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quản lý Lớp học</h1>
            <p className="text-gray-600">{classes.length} lớp học trong hệ thống</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
          >
            <Plus size={20} />
            <span>Thêm Lớp</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="text-sm text-blue-700">
            <strong>Debug Info:</strong> Loaded {classes.length} classes, {filteredClasses.length} filtered
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(className => {
            const stats = classStats[className] || {
              totalSubmissions: 0,
              acceptedSubmissions: 0,
              uniqueStudents: 0,
              acceptanceRate: 0,
              solvedProblems: 0
            };

            return (
              <div
                key={className}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <School className="text-white" size={24} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(className)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(className)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-gray-800">{className}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Users size={16} className="mr-1" />
                      Học sinh:
                    </span>
                    <span className="font-semibold text-gray-800">{stats.uniqueStudents}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <BookOpen size={16} className="mr-1" />
                      Bài nộp:
                    </span>
                    <span className="font-semibold text-gray-800">{stats.totalSubmissions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <CheckCircle size={16} className="mr-1" />
                      Bài đạt:
                    </span>
                    <span className="font-semibold text-green-600">{stats.acceptedSubmissions}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <TrendingUp size={16} className="mr-1" />
                      Tỉ lệ đạt:
                    </span>
                    <span className="font-semibold text-purple-600">{stats.acceptanceRate}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bài tập đã giải:</span>
                    <span className="font-semibold text-orange-600">{stats.solvedProblems}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to={`/admin/class/${className}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <School size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">
              {classes.length === 0 ? 'Không có lớp học nào trong hệ thống' : 'Không tìm thấy lớp học nào'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Tạo lớp đầu tiên
            </button>
          </div>
        )}

        {/* Create Class Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Thêm Lớp Mới</h2>
                
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên lớp *
                    </label>
                    <select
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Chọn lớp</option>
                      <option value="10A1">10A1</option>
                      <option value="10A2">10A2</option>
                      <option value="10A3">10A3</option>
                      <option value="10A4">10A4</option>
                      <option value="10A5">10A5</option>
                      <option value="11A1">11A1</option>
                      <option value="11A2">11A2</option>
                      <option value="11A3">11A3</option>
                      <option value="11A4">11A4</option>
                      <option value="11A5">11A5</option>
                      <option value="12A1">12A1</option>
                      <option value="12A2">12A2</option>
                      <option value="12A3">12A3</option>
                      <option value="12A4">12A4</option>
                      <option value="12A5">12A5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Mô tả về lớp học..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giáo viên chủ nhiệm
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Chọn giáo viên</option>
                      {teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName || teacher.username} ({teacher.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      Tạo Lớp
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Class Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Chỉnh sửa Lớp {selectedClass}</h2>
                
                <form onSubmit={handleEditClass} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên lớp
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Không thể thay đổi tên lớp</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Mô tả về lớp học..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giáo viên chủ nhiệm
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Chọn giáo viên</option>
                      {teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.fullName || teacher.username} ({teacher.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <AlertCircle size={16} />
                      <span className="text-sm font-semibold">Cảnh báo</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Xóa lớp sẽ không xóa học sinh, chỉ xóa thông tin lớp.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClasses;