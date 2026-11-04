import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<div className="p-6"><h2 className="text-2xl font-bold">Dashboard Home</h2><p className="mt-2 text-gray-600">Welcome to your student portal!</p></div>} />
            <Route path="profile" element={<div className="p-6"><h2 className="text-2xl font-bold">Profile</h2><p className="mt-2 text-gray-600">Manage your profile here</p></div>} />
            <Route path="applications" element={<div className="p-6"><h2 className="text-2xl font-bold">Applications</h2><p className="mt-2 text-gray-600">View your applications here</p></div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

