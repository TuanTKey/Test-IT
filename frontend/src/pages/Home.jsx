import { Link } from 'react-router-dom';
import { useAuth } from '../components/admin/AuthContext';
import { Code2, Trophy, Users, Zap, ChevronRight, Cpu, Terminal, BookOpen, Clock, Award } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Terminal,
      title: 'Online Code Editor',
      description: 'Code with syntax highlighting, auto-completion in 20+ programming languages',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Cpu,
      title: 'Real-time Judge',
      description: 'Instant code execution and validation with comprehensive test cases',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Trophy,
      title: 'Coding Contests',
      description: 'Regular programming competitions with rankings and prizes',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: BookOpen,
      title: 'Learning Paths',
      description: 'Structured curriculum from beginner to advanced algorithms',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const programmingLanguages = [
    'Python', 'JavaScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby',
    'Swift', 'Kotlin', 'TypeScript', 'PHP', 'SQL', 'R', 'Scala'
  ];

  const contestStats = [
    { number: '50+', label: 'Active Contests' },
    { number: '2K+', label: 'Daily Submissions' },
    { number: '95%', label: 'Accuracy Rate' },
    { number: '<1s', label: 'Avg Judging Time' }
  ];

  const recentContests = [
    {
      title: 'Weekly Coding Challenge #45',
      participants: 1247,
      difficulty: 'Medium',
      duration: '3 hours',
      status: 'Ongoing'
    },
    {
      title: 'Algorithm Masters Tournament',
      participants: 2896,
      difficulty: 'Hard',
      duration: '5 hours',
      status: 'Upcoming'
    },
    {
      title: 'Beginner Friendly Contest',
      participants: 3561,
      difficulty: 'Easy',
      duration: '2 hours',
      status: 'Completed'
    }
  ];

  const difficultyBadge = (level) => {
    const colors = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const statusBadge = (status) => {
    const colors = {
      'Ongoing': 'bg-green-100 text-green-800',
      'Upcoming': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section với theme lập trình */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        {/* Background pattern giống code editor */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 font-mono text-sm">function main() {'{'}</div>
          <div className="absolute top-20 left-16 font-mono text-sm">  return "Hello World";</div>
          <div className="absolute top-28 left-10 font-mono text-sm">{'}'}</div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Real-time Code Execution • 20+ Languages</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-mono">
              &lt;Code<span className="text-cyan-400">Judge</span>/&gt;
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for <span className="text-cyan-300">competitive programming</span>, 
              <span className="text-blue-300"> coding practice</span>, and 
              <span className="text-purple-300"> technical interviews</span>
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              {!user ? (
                <>
                  <Link 
                    to="/register" 
                    className="group bg-cyan-600 hover:bg-cyan-700 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 font-mono"
                  >
                    $ git start
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/problems" 
                    className="group border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 font-mono"
                  >
                    view problems
                  </Link>
                </>
              ) : (
                <Link 
                  to="/problems" 
                  className="group bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2 font-mono"
                >
                  $ cd problems
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>

            {/* Supported Languages */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto border border-white/10">
              <div className="text-sm text-gray-400 mb-4 font-mono">// Supported Languages</div>
              <div className="flex flex-wrap justify-center gap-3">
                {programmingLanguages.map((lang, index) => (
                  <div 
                    key={index} 
                    className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer hover:scale-105 transform duration-200"
                  >
                    {lang}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contest Stats */}
      <div className="relative -mt-8 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {contestStats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center font-mono"
            >
              <div className="text-2xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Contests Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 font-mono">
            &lt;Active Contests/&gt;
          </h2>
          <Link to="/contests" className="text-cyan-600 hover:text-cyan-700 font-medium font-mono">
            view_all.js
          </Link>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {recentContests.map((contest, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-lg">{contest.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(contest.status)}`}>
                  {contest.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{contest.participants.toLocaleString()} participants</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{contest.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyBadge(contest.difficulty)}`}>
                    {contest.difficulty}
                  </span>
                </div>
              </div>
              
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg font-medium transition-colors font-mono">
                {contest.status === 'Completed' ? 'View Results' : 'Join Contest'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section với theme coding */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-mono">
              &lt;Platform Features/&gt;
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to improve your coding skills and prepare for technical interviews
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 font-mono">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-mono">
            $ git commit -m "Start Coding"
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of developers improving their skills through practice and competition
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!user ? (
              <>
                <Link 
                  to="/register" 
                  className="bg-cyan-600 hover:bg-cyan-700 px-8 py-4 rounded-lg font-bold text-lg transition-colors font-mono"
                >
                  Create Account
                </Link>
                <Link 
                  to="/problems" 
                  className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors font-mono"
                >
                  Try Demo
                </Link>
              </>
            ) : (
              <Link 
                to="/contests" 
                className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-bold text-lg transition-colors font-mono"
              >
                Join Contest
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;