import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Clock, Play, Trophy, Users, Search, Filter } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const ContestList = () => {
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
      return 'SẮP DIỄN RA';
    } else if (now >= start && now <= end) {
      return 'ĐANG DIỄN RA';
    } else {
      return 'ĐÃ KẾT THÚC';
    }
  };

  const getStatusIcon = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);

    if (now < start) {
      return <Clock className="text-blue-500" size={20} />;
    } else if (now >= start && now <= new Date(contest.endTime)) {
      return <Play className="text-green-500" size={20} />;
    } else {
      return <Trophy className="text-gray-500" size={20} />;
    }
  };

  const canJoin = (contest) => {
    const now = new Date();
    const start = new Date(contest.startTime);
    return now < start; // Chỉ có thể đăng ký trước khi cuộc thi bắt đầu
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Cuộc thi Lập trình</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tham gia các cuộc thi lập trình để thử thách kỹ năng và cạnh tranh với các lập trình viên khác
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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

        {/* Contests Grid */}
        {filteredContests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Trophy size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Không có cuộc thi nào</h3>
            <p className="text-gray-600 mb-6">Hiện tại không có cuộc thi nào phù hợp với tìm kiếm của bạn.</p>
            <button
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
            >
              Xem tất cả cuộc thi
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => (
              <div
                key={contest._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
              >
                {/* Contest Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(contest)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contest)}`}>
                        {getStatusText(contest)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Users size={16} />
                      <span>{contest.participants?.length || 0}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {contest.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {contest.description}
                  </p>
                </div>

                {/* Contest Info */}
                <div className="p-6">
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Bắt đầu:</span>
                      <span className="font-semibold">
                        {format(new Date(contest.startTime), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kết thúc:</span>
                      <span className="font-semibold">
                        {format(new Date(contest.endTime), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bài tập:</span>
                      <span className="font-semibold">
                        {contest.problems?.length || 0} bài
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời lượng:</span>
                      <span className="font-semibold">
                        {contest.duration} phút
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mb-4">
                    {getStatusText(contest) === 'SẮP DIỄN RA' ? (
                      <span className="text-blue-600">
                        ⏰ Bắt đầu {formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}
                      </span>
                    ) : getStatusText(contest) === 'ĐANG DIỄN RA' ? (
                      <span className="text-green-600">
                        🚀 Kết thúc {formatDistanceToNow(new Date(contest.endTime), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        ✅ Đã kết thúc
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/contests/${contest._id}`}
                      className="flex-1 bg-purple-600 text-white text-center py-2 px-4 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
                    >
                      {getStatusText(contest) === 'ĐÃ KẾT THÚC' ? 'Xem Kết quả' : 'Xem Chi tiết'}
                    </Link>
                    
                    {canJoin(contest) && (
                      <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-semibold transition-colors">
                        Đăng ký
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Trophy className="mx-auto mb-3 text-yellow-500" size={32} />
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {contests.filter(c => new Date(c.endTime) < new Date()).length}
            </h3>
            <p className="text-gray-600">Cuộc thi đã kết thúc</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Play className="mx-auto mb-3 text-green-500" size={32} />
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {contests.filter(c => new Date(c.startTime) <= new Date() && new Date(c.endTime) >= new Date()).length}
            </h3>
            <p className="text-gray-600">Đang diễn ra</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Clock className="mx-auto mb-3 text-blue-500" size={32} />
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {contests.filter(c => new Date(c.startTime) > new Date()).length}
            </h3>
            <p className="text-gray-600">Sắp diễn ra</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestList;