import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';

const CreateContest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: 120,
    rules: '',
    isPublic: true
  });

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await api.get('/problems?limit=100');
      setProblems(response.data.problems);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProblemSelect = (problemId) => {
    if (selectedProblems.includes(problemId)) {
      setSelectedProblems(selectedProblems.filter(id => id !== problemId));
    } else {
      setSelectedProblems([...selectedProblems, problemId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        problems: selectedProblems,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        duration: parseInt(formData.duration)
      };

      console.log('Creating contest:', payload);

      const response = await api.post('/contests', payload);
      alert('Cuộc thi đã được tạo thành công!');
      navigate('/admin/contests');
    } catch (error) {
      console.error('Error creating contest:', error);
      alert(error.response?.data?.error || 'Không thể tạo cuộc thi');
    } finally {
      setLoading(false);
    }
  };

  // Calculate default times
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const defaultEnd = new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000); // +2 hours

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/admin/contests')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-2"
            >
              <ArrowLeft size={20} />
              <span>Quay lại</span>
            </button>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Tạo Cuộc thi Mới</h1>
            <p className="text-gray-600">Thiết lập cuộc thi lập trình mới</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin Cuộc thi</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên cuộc thi *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Ví dụ: Cuộc thi Lập trình Hàng tuần"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mô tả về cuộc thi..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời gian bắt đầu *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời gian kết thúc *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={formData.startTime || new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Thời lượng (phút) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="30"
                    max="10080"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quy định
                  </label>
                  <input
                    type="text"
                    name="rules"
                    value={formData.rules}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Quy định cuộc thi..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label className="text-sm font-semibold text-gray-700">
                  Cuộc thi công khai (ai cũng có thể tham gia)
                </label>
              </div>
            </div>
          </div>

          {/* Problem Selection */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Chọn Bài tập</h2>
            
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {problems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Chưa có bài tập nào</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {problems.map((problem) => (
                    <div
                      key={problem._id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedProblems.includes(problem._id)
                          ? 'bg-purple-50 border-l-4 border-l-purple-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleProblemSelect(problem._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{problem.title}</h3>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {problem.difficulty === 'easy' ? 'DỄ' : 
                               problem.difficulty === 'medium' ? 'TRUNG BÌNH' : 'KHÓ'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {problem.tags?.slice(0, 3).join(', ')}
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedProblems.includes(problem._id)}
                          onChange={() => {}}
                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
              <span>Đã chọn: {selectedProblems.length} bài tập</span>
              {selectedProblems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedProblems([])}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/contests')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              <Save size={20} />
              <span>{loading ? 'Đang tạo...' : 'Tạo Cuộc thi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContest;