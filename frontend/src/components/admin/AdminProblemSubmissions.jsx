import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Eye, Code, Users, BookOpen, CheckCircle, Search, RefreshCw, FileText, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminProblemSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedProblem, setSelectedProblem] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetchSubmissions();
    fetchClasses();
    fetchProblems();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, selectedClass, selectedProblem, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/submissions/admin/all?limit=500');
      // Chỉ lấy bài nộp KHÔNG thuộc contest (bài tập thường)
      const problemSubmissions = (response.data.submissions || [])
        .filter(sub => sub.status === 'accepted' && !sub.contestId);
      setSubmissions(problemSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/users/classes/all');
      setClasses([{ id: 'all', name: 'Tất cả lớp' }, ...response.data.classes.map(cls => ({
        id: cls,
        name: cls
      }))]);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([
        { id: 'all', name: 'Tất cả lớp' },
        { id: '10A1', name: '10A1' },
        { id: '10A2', name: '10A2' },
        { id: '11A1', name: '11A1' },
        { id: '11A2', name: '11A2' },
        { id: '12A1', name: '12A1' }
      ]);
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await api.get('/problems?limit=100');
      setProblems([{ id: 'all', title: 'Tất cả bài tập' }, ...(response.data.problems || [])]);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    if (selectedClass !== 'all') {
      filtered = filtered.filter(sub => sub.userId?.class === selectedClass);
    }

    if (selectedProblem !== 'all') {
      filtered = filtered.filter(sub => sub.problemId?._id === selectedProblem);
    }

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const getStatusColor = () => 'bg-green-100 text-green-800 border border-green-200';
  const getStatusIcon = () => <CheckCircle className="text-green-500" size={16} />;
  const getStatusText = () => 'HOÀN THÀNH';

  const viewSubmission = async (submissionId) => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      setSelectedSubmission(response.data.submission);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching submission details:', error);
      alert('Failed to load submission details');
    }
  };

  const exportToExcel = () => {
    const data = filteredSubmissions.map(sub => ({
      'Học sinh': sub.userId?.username,
      'Lớp': sub.userId?.class,
      'Bài tập': sub.problemId?.title,
      'Ngôn ngữ': sub.language,
      'Thời gian': `${sub.executionTime}ms`,
      'Thời gian nộp': new Date(sub.createdAt).toLocaleString('vi-VN')
    }));

    const headers = ['Học sinh', 'Lớp', 'Bài tập', 'Ngôn ngữ', 'Thời gian', 'Thời gian nộp'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bai_tap_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-800">Quản lý Submit Bài Tập</h1>
            </div>
            <p className="text-gray-600">
              {filteredSubmissions.length} bài nộp thành công • {new Set(filteredSubmissions.map(s => s.userId?._id)).size} học sinh
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={fetchSubmissions}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex space-x-2">
          <Link
            to="/admin/submissions"
            className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-3 rounded-lg font-semibold transition"
          >
            <CheckCircle size={20} />
            <span>Tất cả</span>
          </Link>
          <Link
            to="/admin/submissions/problems"
            className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold"
          >
            <FileText size={20} />
            <span>Bài Tập</span>
          </Link>
          <Link
            to="/admin/submissions/contests"
            className="flex-1 flex items-center justify-center space-x-2 bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-3 rounded-lg font-semibold transition"
          >
            <Trophy size={20} />
            <span>Bài Thi</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Lớp học
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="inline w-4 h-4 mr-1" />
                Bài tập
              </label>
              <select
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {problems.map(problem => (
                  <option key={problem.id} value={problem._id || problem.id}>
                    {problem.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Tìm học sinh
              </label>
              <input
                type="text"
                placeholder="Nhập tên học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">{filteredSubmissions.length}</div>
            <div className="text-sm text-gray-600">Bài nộp</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">
              {new Set(filteredSubmissions.map(s => s.userId?._id)).size}
            </div>
            <div className="text-sm text-gray-600">Học sinh</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(filteredSubmissions.map(s => s.problemId?._id)).size}
            </div>
            <div className="text-sm text-gray-600">Bài tập</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(filteredSubmissions.map(s => s.userId?.class)).size}
            </div>
            <div className="text-sm text-gray-600">Lớp học</div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">Không có bài nộp bài tập nào</p>
              <p className="text-sm text-gray-400 mt-2">Thử thay đổi bộ lọc để xem kết quả khác</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Học sinh</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Lớp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Bài tập</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ngôn ngữ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thời gian</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thời gian nộp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {submission.userId?.username?.[0]?.toUpperCase() || 'H'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {submission.userId?.username || 'Unknown'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {submission.userId?.fullName || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                          {submission.userId?.class || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/problems/${submission.problemId?.slug}`}
                          className="text-blue-600 hover:text-blue-800 font-medium block"
                        >
                          {submission.problemId?.title || 'Unknown Problem'}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1">
                          Độ khó: <span className={`font-semibold ${
                            submission.problemId?.difficulty === 'easy' ? 'text-green-600' :
                            submission.problemId?.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {submission.problemId?.difficulty?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border">
                          {submission.language?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon()}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
                            {getStatusText()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">
                        {submission.executionTime ? `${submission.executionTime}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewSubmission(submission._id)}
                          className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Eye size={14} />
                          <span>Xem code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Chi tiết bài nộp</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin học sinh</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Học sinh:</span>
                        <span className="font-semibold">{selectedSubmission.userId?.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lớp:</span>
                        <span className="font-semibold">{selectedSubmission.userId?.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bài tập:</span>
                        <span className="font-semibold">{selectedSubmission.problemId?.title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Thông tin chấm điểm</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngôn ngữ:</span>
                        <span className="font-semibold">{selectedSubmission.language?.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-semibold">{selectedSubmission.executionTime || 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Test cases:</span>
                        <span className="font-semibold">
                          {selectedSubmission.testCasesPassed || 0}/{selectedSubmission.totalTestCases || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Code className="mr-2" size={18} />
                    Code giải bài
                  </h3>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {selectedSubmission.code}
                  </pre>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProblemSubmissions;
