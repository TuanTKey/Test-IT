import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, Code2 } from 'lucide-react';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    search: '',
    tags: ''
  });

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (filters.tags) params.append('tags', filters.tags);

      const response = await api.get(`/problems?${params.toString()}`);
      setProblems(response.data.problems);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Practice Problems</h1>
        <p className="text-gray-600">Solve coding challenges and improve your skills</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search problems..."
              className="input-field pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <select
            className="input-field"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <input
            type="text"
            placeholder="Filter by tags (comma separated)"
            className="input-field"
            value={filters.tags}
            onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
          />
        </div>
      </div>

      {/* Problems List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {problems.length === 0 ? (
            <div className="card text-center py-12">
              <Code2 className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No problems found</p>
            </div>
          ) : (
            problems.map((problem) => (
              <Link
                key={problem._id}
                to={`/problems/${problem.slug}`}
                className="card hover:shadow-xl transition-all block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-purple-600">
                      {problem.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {problem.description?.substring(0, 150)}...
                    </p>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty.toUpperCase()}
                      </span>
                      {problem.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-500">
                      Acceptance: {problem.submissionCount > 0 
                        ? ((problem.acceptedCount / problem.submissionCount) * 100).toFixed(1)
                        : 0}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {problem.submissionCount} submissions
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Problems;