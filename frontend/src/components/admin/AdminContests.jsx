import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Edit, Trash2, Users, Clock, Play, Trophy, Search, Filter, Eye } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const AdminContests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const response = await api.get(`/contests?${params}`);
      setContests(response.data.contests);
    } catch (error) {
      console.error('Error fetching contests:', error);
      alert('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contest?')) {
      return;
    }

    try {
      await api.delete(`/contests/${id}`);
      setContests(contests.filter(c => c._id !== id));
      alert('Contest deleted successfully');
    } catch (error) {
      console.error('Error deleting contest:', error);
      alert('Failed to delete contest');
    }
  };

  const getStatusColor = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) {
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    } else if (now >= start && now <= end) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else {
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusText = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) {
      return 'UPCOMING';
    } else if (now >= start && now <= end) {
      return 'RUNNING';
    } else {
      return 'FINISHED';
    }
  };

  const getStatusIcon = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);

    if (now < start) {
      return <Clock className="text-blue-500" size={16} />;
    } else if (now >= start && now <= new Date(contest.endTime)) {
      return <Play className="text-green-500" size={16} />;
    } else {
      return <Trophy className="text-gray-500" size={16} />;
    }
  };

  const filteredContests = contests.filter(contest =>
    contest.title.toLowerCase().includes(search.toLowerCase()) ||
    contest.description.toLowerCase().includes(search.toLowerCase())
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Quản lý Cuộc thi</h1>
            <p className="text-gray-600">{contests.length} cuộc thi</p>
          </div>
          <Link
            to="/admin/contests/create"
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
          >
            <Plus size={20} />
            <span>Tạo Cuộc thi</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm cuộc thi..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="running">Đang diễn ra</option>
                <option value="past">Đã kết thúc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contests Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredContests.length === 0 ? (
            <div className="text-center py-12">
              <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-lg">Không có cuộc thi nào</p>
              <Link
                to="/admin/contests/create"
                className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Tạo cuộc thi đầu tiên
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tên cuộc thi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thời gian</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Bài tập</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tham gia</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContests.map((contest) => (
                  <tr key={contest._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">
                          {contest.title}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {contest.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(contest)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contest)}`}>
                          {getStatusText(contest)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <div>Bắt đầu: {format(new Date(contest.startTime), 'dd/MM/yyyy HH:mm')}</div>
                        <div>Kết thúc: {format(new Date(contest.endTime), 'dd/MM/yyyy HH:mm')}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getStatusText(contest) === 'UPCOMING' ? (
                            `Bắt đầu ${formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}`
                          ) : getStatusText(contest) === 'RUNNING' ? (
                            `Kết thúc ${formatDistanceToNow(new Date(contest.endTime), { addSuffix: true })}`
                          ) : 'Đã kết thúc'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {contest.problems?.length || 0} bài tập
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Users size={16} />
                        <span>{contest.participants?.length || 0} người tham gia</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/contests/${contest._id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </Link>
                        
                        <Link
                        to={`/admin/contests/edit/${contest._id}`}
                        className="text-green-600 hover:text-green-800"
                        title="Chỉnh sửa"
                        >
                        <Edit size={18} />
                        </Link>
                        <Link
                        to={`/admin/contests/${contest._id}/leaderboard`}
                        className="text-purple-600 hover:text-purple-800"
                        title="Bảng xếp hạng"
                        >
                        <Trophy size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(contest._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContests;