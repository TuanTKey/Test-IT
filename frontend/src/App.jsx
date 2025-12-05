import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/admin/AuthContext';
import Navbar from './components/layout/Navbar';
import AdminRoute from './components/admin/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Leaderboard from './pages/Leaderboard';

// User Pages
import Problems from './pages/Problems';
import ProblemSolve from './pages/ProblemSolve';
import ContestList from './components/contests/ContestList';
import ContestDetail from './components/contests/ContestDetail';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProblems from './components/admin/AdminProblems';
import CreateProblem from './components/admin/CreateProblem';
import AdminUsers from './components/admin/AdminUsers';
import AdminSubmissions from './components/admin/AdminSubmissions';
import AdminProblemSubmissions from './components/admin/AdminProblemSubmissions';
import AdminContestSubmissions from './components/admin/AdminContestSubmissions';
import EditProblem from './components/admin/EditProblem';
import AdminContests from './components/admin/AdminContests';
import CreateContest from './components/contests/CreateContest';
import EditContest from './components/admin/EditContest';
import ContestLeaderboard from './components/admin/ContestLeaderboard';

// THÊM TRANG QUẢN LÝ LỚP HỌC
import AdminClasses from './components/admin/AdminClasses';
import ClassDetail from './components/admin/ClassDetail';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        
        {/* User Routes */}
        <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
        <Route path="/problems/:slug" element={<ProtectedRoute><ProblemSolve /></ProtectedRoute>} />
        <Route path="/contests" element={<ProtectedRoute><ContestList /></ProtectedRoute>} />
        <Route path="/contests/:id" element={<ProtectedRoute><ContestDetail /></ProtectedRoute>} />  
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/problems" element={<AdminRoute><AdminProblems /></AdminRoute>} />
        <Route path="/admin/problems/create" element={<AdminRoute><CreateProblem /></AdminRoute>} />
        <Route path="/admin/problems/edit/:id" element={<AdminRoute><EditProblem /></AdminRoute>} />
        
        <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
        <Route path="/admin/submissions/problems" element={<AdminRoute><AdminProblemSubmissions /></AdminRoute>} />
        <Route path="/admin/submissions/contests" element={<AdminRoute><AdminContestSubmissions /></AdminRoute>} />
        
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        
        <Route path="/admin/contests" element={<AdminRoute><AdminContests /></AdminRoute>} />
        <Route path="/admin/contests/create" element={<AdminRoute><CreateContest /></AdminRoute>} />
        <Route path="/admin/contests/edit/:id" element={<AdminRoute><EditContest /></AdminRoute>} />
        <Route path="/admin/contests/:id/leaderboard" element={<AdminRoute><ContestLeaderboard /></AdminRoute>} />
        
        {/* THÊM ROUTES QUẢN LÝ LỚP HỌC */}
        <Route path="/admin/classes" element={<AdminRoute><AdminClasses /></AdminRoute>} />
        <Route path="/admin/class/:class" element={<AdminRoute><ClassDetail /></AdminRoute>} />
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;