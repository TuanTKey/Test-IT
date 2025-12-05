import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/admin/AuthContext';
import { Trophy, Users, Zap, ChevronRight, Code, Terminal, Clock, BookOpen } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [contests, setContests] = useState([]);
  const [stats, setStats] = useState({
    totalContests: 0,
    totalProblems: 0
  });

  useEffect(() => {
    fetchContests();
    fetchStats();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await api.get('/contests');
      setContests(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching contests:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [contestsRes, problemsRes] = await Promise.all([
        api.get('/contests'),
        api.get('/problems')
      ]);
      setStats({
        totalContests: contestsRes.data.length,
        totalProblems: problemsRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);
    if (now < startTime) return 'Upcoming';
    if (now >= startTime && now <= endTime) return 'Ongoing';
    return 'Completed';
  };

  const getContestDuration = (contest) => {
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);
    const hours = Math.round((end - start) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  const statusBadge = (status) => {
    const colors = {
      'Ongoing': 'bg-green-500 text-white',
      'Upcoming': 'bg-blue-500 text-white',
      'Completed': 'bg-gray-500 text-white'
    };
    return colors[status] || 'bg-gray-500 text-white';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section - Compact */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 lg:py-20">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Code className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-mono">
                Code<span className="text-cyan-400">Judge</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Nền tảng luyện tập lập trình và thi đấu trực tuyến với AI Judge
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {!user ? (
                <>
                  <Link 
                    to="/register" 
                    className="group bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
                  >
                    Bắt đầu ngay
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/problems" 
                    className="border border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Xem bài tập
                  </Link>
                </>
              ) : (
                <Link 
                  to="/problems" 
                  className="group bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold text-white transition-all flex items-center gap-2 shadow-lg shadow-green-500/25"
                >
                  Làm bài tập
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: Trophy, value: stats.totalContests, label: 'Cuộc thi' },
                { icon: BookOpen, value: stats.totalProblems, label: 'Bài tập' },
                { icon: Terminal, value: '4+', label: 'Ngôn ngữ' },
                { icon: Zap, value: '<1s', label: 'Chấm bài' }
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
                  <item.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <div className="text-xs text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contests Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Cuộc thi
          </h2>
          <Link to="/contests" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            Xem tất cả →
          </Link>
        </div>
        
        {contests.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Chưa có cuộc thi nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {contests.map((contest) => {
              const status = getContestStatus(contest);
              return (
                <Link 
                  key={contest._id}
                  to={`/contests/${contest._id}`}
                  className="group bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 rounded-xl p-5 transition-all hover:bg-slate-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {contest.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(status)}`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {contest.problems?.length || 0} bài
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getContestDuration(contest)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Features Section - Compact */}
      <div className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-800">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Tính năng
        </h2>
        
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Terminal, title: 'Code Editor', desc: 'Monaco Editor với syntax highlighting', color: 'text-blue-400' },
            { icon: Zap, title: 'AI Judge', desc: 'Chấm bài tự động bằng Gemini AI', color: 'text-green-400' },
            { icon: Trophy, title: 'Cuộc thi', desc: 'Thi đấu và xếp hạng realtime', color: 'text-amber-400' },
            { icon: Users, title: 'Lớp học', desc: 'Quản lý học sinh và bài tập', color: 'text-purple-400' }
          ].map((f, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
              <f.icon className={`w-8 h-8 ${f.color} mb-3`} />
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-slate-400 mb-6">
            Đăng ký ngay để luyện tập và nâng cao kỹ năng lập trình
          </p>
          {!user ? (
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg shadow-cyan-500/25"
            >
              Tạo tài khoản miễn phí
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link 
              to="/problems" 
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 px-8 py-3 rounded-lg font-semibold text-white transition-all"
            >
              Làm bài ngay
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;