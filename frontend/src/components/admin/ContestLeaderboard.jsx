import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Trophy, Users, Clock, ArrowLeft, Medal, Star, Award } from 'lucide-react';
import { format } from 'date-fns';

const ContestLeaderboard = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestAndLeaderboard();
  }, [id]);

  const fetchContestAndLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Fetch contest data
      const contestResponse = await api.get(`/contests/${id}`);
      setContest(contestResponse.data.contest);
      
      // Fetch leaderboard
      const leaderboardResponse = await api.get(`/contests/${id}/leaderboard`);
      setLeaderboard(leaderboardResponse.data.leaderboard || []);

    } catch (error) {
      console.error('Error fetching contest leaderboard:', error);
      alert('Không thể tải bảng xếp hạng');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Medal className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-800" size={24} />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/contests"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-semibold mb-4"
          >
            <ArrowLeft size={20} />
            <span>Quay lại Quản lý Cuộc thi</span>
          </Link>
        </div>

        {/* Contest Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{contest?.title}</h1>
              <p className="text-lg text-gray-600 mb-4">{contest?.description}</p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock size={18} />
                  <span>Bắt đầu: {contest ? format(new Date(contest.startTime), 'dd/MM/yyyy HH:mm') : ''}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={18} />
                  <span>Kết thúc: {contest ? format(new Date(contest.endTime), 'dd/MM/yyyy HH:mm') : ''}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={18} />
                  <span>{contest?.participants?.length || 0} người tham gia</span>
                </div>
              </div>
            </div>
            
            <div className="lg:ml-8 lg:mt-0 mt-4">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg text-center">
                <Trophy size={32} className="mx-auto mb-2" />
                <div className="text-2xl font-bold">{leaderboard.length}</div>
                <div className="text-sm">Người có điểm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Trophy className="text-yellow-500" />
              <span>Bảng Xếp Hạng</span>
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Award size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có dữ liệu xếp hạng</h3>
              <p className="text-gray-600">Chưa có ai hoàn thành bài tập trong cuộc thi này.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((participant, index) => (
                <div
                  key={participant.user._id}
                  className={`p-6 border-l-4 ${
                    participant.rank === 1 ? 'border-l-yellow-500' :
                    participant.rank === 2 ? 'border-l-gray-400' :
                    participant.rank === 3 ? 'border-l-orange-500' : 'border-l-purple-500'
                  } ${getRankColor(participant.rank)} hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(participant.rank)}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {participant.user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {participant.user.username}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {participant.user.fullName || 'Chưa có tên'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {participant.score}
                          </div>
                          <div className="text-sm text-gray-600">Điểm</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">
                            {participant.solvedCount}
                          </div>
                          <div className="text-sm text-gray-600">Bài giải</div>
                        </div>

                        {participant.solvedProblems && participant.solvedProblems.length > 0 && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {participant.solvedProblems.length}
                            </div>
                            <div className="text-sm text-gray-600">Đã giải</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Solved Problems */}
                  {participant.solvedProblems && participant.solvedProblems.length > 0 && (
                    <div className="mt-4 pl-16">
                      <div className="flex flex-wrap gap-2">
                        {participant.solvedProblems.map((solved, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold"
                          >
                            <Star size={12} />
                            <span>{solved.problem?.title || `Bài ${idx + 1}`}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {leaderboard.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-purple-600">{leaderboard.length}</div>
              <div className="text-sm text-gray-600">Tổng thí sinh</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-green-600">
                {leaderboard.filter(p => p.solvedCount > 0).length}
              </div>
              <div className="text-sm text-gray-600">Có bài giải</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...leaderboard.map(p => p.score))}
              </div>
              <div className="text-sm text-gray-600">Điểm cao nhất</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-orange-600">
                {leaderboard[0]?.user.username || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Người dẫn đầu</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestLeaderboard;