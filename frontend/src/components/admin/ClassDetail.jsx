import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Users, BookOpen, CheckCircle, TrendingUp, Search, User, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ClassDetail = () => {
  const { class: className } = useParams();
  const [students, setStudents] = useState([]);
  const [classStats, setClassStats] = useState({});
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassData();
  }, [className]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Fetching data for class:', className);
      
      // TÍNH TOÁN THỦ CÔNG VÌ API CÓ THỂ CHƯA CÓ
      try {
        // Lấy tất cả users để filter theo lớp
        const usersRes = await api.get('/users/leaderboard?limit=500');
        const allUsers = usersRes.data.leaderboard || [];
        const classStudents = allUsers.filter(user => user.class === className);
        setStudents(classStudents);
        console.log('👥 Students in class:', classStudents.length);

        // Lấy tất cả submissions để tính thống kê
        const submissionsRes = await api.get('/submissions/admin/all?limit=1000');
        const allSubmissions = submissionsRes.data.submissions || [];
        
        // Filter submissions theo lớp
        const classSubmissions = allSubmissions.filter(sub => {
          const user = allUsers.find(u => u._id === sub.userId?._id);
          return user && user.class === className;
        });

        const acceptedSubmissions = classSubmissions.filter(sub => sub.status === 'accepted');
        const solvedProblems = new Set(acceptedSubmissions.map(sub => sub.problemId?._id)).size;

        // Tính toán thống kê
        const stats = {
          totalStudents: classStudents.length,
          totalSubmissions: classSubmissions.length,
          acceptedSubmissions: acceptedSubmissions.length,
          solvedProblemsCount: solvedProblems,
          acceptanceRate: classSubmissions.length > 0 ? 
            ((acceptedSubmissions.length / classSubmissions.length) * 100).toFixed(1) : 0
        };
        
        setClassStats(stats);
        setRecentSubmissions(classSubmissions.slice(0, 10)); // 10 bài gần nhất

      } catch (apiError) {
        console.error('API Error:', apiError);
        setError('Không thể tải dữ liệu từ server');
        // Set dữ liệu mẫu để test
        setStudents([]);
        setClassStats({
          totalStudents: 0,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          solvedProblemsCount: 0,
          acceptanceRate: 0
        });
        setRecentSubmissions([]);
      }

    } catch (error) {
      console.error('Error fetching class data:', error);
      setError('Không thể tải dữ liệu lớp học');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/admin/classes"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-2"
            >
              <ArrowLeft size={20} />
              <span>Quay lại Quản lý Lớp</span>
            </Link>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Lớp {className}</h1>
            <p className="text-gray-600">Quản lý học sinh và theo dõi tiến độ</p>
          </div>
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{classStats.totalStudents || 0}</div>
            <div className="text-sm text-gray-600">Học sinh</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {classStats.solvedProblemsCount || 0}
            </div>
            <div className="text-sm text-gray-600">Bài tập đã giải</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {classStats.totalSubmissions || 0}
            </div>
            <div className="text-sm text-gray-600">Bài nộp</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {classStats.acceptanceRate || 0}%
            </div>
            <div className="text-sm text-gray-600">Tỉ lệ đạt</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Users className="mr-2" size={20} />
              Danh sách Học sinh ({filteredStudents.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <div key={student._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      {student.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {student.username || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.fullName || 'Chưa có tên'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">
                          {student.solvedProblems || 0}
                        </div>
                        <div className="text-sm text-gray-600">Bài giải</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {student.rating || 1200}
                        </div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <User size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">
                {students.length === 0 ? 'Không có học sinh nào trong lớp này' : 'Không tìm thấy học sinh nào'}
              </p>
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Clock className="mr-2" size={20} />
              Bài nộp gần đây ({recentSubmissions.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentSubmissions.map((submission) => (
              <div key={submission._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-800">
                        {submission.userId?.username || 'Unknown'}
                      </span>
                      <span className="text-sm text-gray-600">
                        đã nộp bài
                      </span>
                      <span className="text-purple-600 font-medium">
                        {submission.problemId?.title || 'Unknown Problem'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Ngôn ngữ: {submission.language}</span>
                      <span>Thời gian: {submission.executionTime}ms</span>
                      <span>
                        {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    submission.status === 'accepted' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {submission.status === 'accepted' ? 'ĐẠT' : 'SAI'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {recentSubmissions.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">Chưa có bài nộp nào trong lớp này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;