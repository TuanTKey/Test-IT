import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../admin/AuthContext';
import api from '../../services/api';
import { Clock, Users, Trophy, Play, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const ContestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    try {
      const response = await api.get(`/contests/${id}`);
      setContest(response.data.contest);
      
      // Check if user is registered
      if (user && response.data.contest.participants) {
        const registered = response.data.contest.participants.includes(user.id);
        setIsRegistered(registered);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
      alert('Failed to load contest');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đăng ký tham gia');
      return;
    }

    setRegistering(true);
    try {
      await api.post(`/contests/${id}/register`);
      setIsRegistered(true);
      alert('Đăng ký tham gia thành công!');
      fetchContest(); // Refresh contest data
    } catch (error) {
      console.error('Error registering:', error);
      alert(error.response?.data?.error || 'Không thể đăng ký');
    } finally {
      setRegistering(false);
    }
  };

  const getContestStatus = () => {
    if (!contest) return 'loading';
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) return 'upcoming';
    if (now >= start && now <= end) return 'running';
    return 'finished';
  };

  const canJoin = () => {
    return getContestStatus() === 'upcoming' && !isRegistered;
  };

  const canParticipate = () => {
    return (getContestStatus() === 'running' || getContestStatus() === 'upcoming') && isRegistered;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!contest) {
    return <Navigate to="/contests" replace />;
  }

  const status = getContestStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/contests"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-semibold mb-4"
          >
            <ArrowLeft size={20} />
            <span>Quay lại danh sách cuộc thi</span>
          </Link>
        </div>

        {/* Contest Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  status === 'running' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status === 'upcoming' ? 'SẮP DIỄN RA' :
                   status === 'running' ? 'ĐANG DIỄN RA' : 'ĐÃ KẾT THÚC'}
                </span>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Users size={18} />
                  <span>{contest.participants?.length || 0} người tham gia</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-800 mb-4">{contest.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{contest.description}</p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian bắt đầu:</span>
                    <span className="font-semibold">
                      {format(new Date(contest.startTime), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian kết thúc:</span>
                    <span className="font-semibold">
                      {format(new Date(contest.endTime), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời lượng:</span>
                    <span className="font-semibold">{contest.duration} phút</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số bài tập:</span>
                    <span className="font-semibold">{contest.problems?.length || 0} bài</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người tạo:</span>
                    <span className="font-semibold">{contest.createdBy?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`font-semibold ${
                      status === 'upcoming' ? 'text-blue-600' :
                      status === 'running' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {status === 'upcoming' ? `Bắt đầu ${formatDistanceToNow(new Date(contest.startTime), { addSuffix: true })}` :
                       status === 'running' ? `Kết thúc ${formatDistanceToNow(new Date(contest.endTime), { addSuffix: true })}` :
                       'Đã kết thúc'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="lg:ml-8 lg:mt-0 mt-6">
              <div className="space-y-3">
                {canJoin() && (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 transition-colors"
                  >
                    {registering ? 'Đang đăng ký...' : 'Đăng ký tham gia'}
                  </button>
                )}

                {isRegistered && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <CheckCircle className="inline text-green-500 mr-2" size={20} />
                    <span className="text-green-800 font-semibold">Đã đăng ký tham gia</span>
                  </div>
                )}

                {status === 'running' && isRegistered && (
                  <Link
                    to={`/contests/${contest._id}/solve`}
                    className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-semibold text-center transition-colors"
                  >
                    <Play className="inline mr-2" size={20} />
                    Vào thi ngay
                  </Link>
                )}

                <Link
                  to={`/contests/${contest._id}/leaderboard`}
                  className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold text-center transition-colors"
                >
                  <Trophy className="inline mr-2" size={20} />
                  Bảng xếp hạng
                </Link>

                {status === 'finished' && (
                  <Link
                    to={`/contests/${contest._id}/leaderboard`}
                    className="block w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 font-semibold text-center transition-colors"
                  >
                    <Trophy className="inline mr-2" size={20} />
                    Xem kết quả
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách Bài tập</h2>
          
          {contest.problems && contest.problems.length > 0 ? (
            <div className="space-y-4">
              {contest.problems.map((problem, index) => (
                <div
                  key={problem._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <Link
                        to={`/problems/${problem.slug}`}
                        className="font-semibold text-gray-800 hover:text-purple-600 text-lg"
                      >
                        {problem.title}
                      </Link>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {problem.difficulty === 'easy' ? 'DỄ' : 
                           problem.difficulty === 'medium' ? 'TRUNG BÌNH' : 'KHÓ'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {canParticipate() && (
                    <Link
                      to={`/problems/${problem.slug}?contest=${contest._id}`}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold transition-colors"
                    >
                      Giải bài
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có bài tập nào trong cuộc thi này.</p>
            </div>
          )}
        </div>

        {/* Rules Section */}
        {contest.rules && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quy định Cuộc thi</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{contest.rules}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestDetail;