import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/users/leaderboard');
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={32} />;
      case 2:
        return <Medal className="text-gray-400" size={28} />;
      case 3:
        return <Award className="text-orange-600" size={28} />;
      default:
        return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3: return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300';
      default: return 'bg-white';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🏆 Global Leaderboard</h1>
        <p className="text-gray-600">Top coders ranked by rating and problems solved</p>
      </div>

      <div className="space-y-3">
        {leaderboard.map((user) => (
          <div
            key={user._id}
            className={`${getRankBg(user.rank)} border rounded-xl p-6 hover:shadow-lg transition-all`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center justify-center w-16">
                  {getRankIcon(user.rank)}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user.username[0].toUpperCase()}
                  </div>

                  <div>
                    <Link
                      to={`/users/${user._id}`}
                      className="text-lg font-bold text-gray-800 hover:text-purple-600"
                    >
                      {user.username}
                    </Link>
                    {user.fullName && (
                      <p className="text-sm text-gray-600">{user.fullName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.rating}</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.solvedProblems}</div>
                  <div className="text-xs text-gray-500">Solved</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;