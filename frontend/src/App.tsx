import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentDashboardHomePage from './pages/StudentDashboardHomePage';
import ProfilePage from './pages/ProfilePage';
import ApplicationsPage from './pages/ApplicationsPage';
import NewApplicationPage from './pages/NewApplicationPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminApplicationDetailPage from './pages/admin/AdminApplicationDetailPage';
import AdminAdmissionPeriodsPage from './pages/admin/AdminAdmissionPeriodsPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Applicant Portal Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboardHomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="applications/new" element={<NewApplicationPage />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />
          </Route>

          {/* Admin & Registrar Portal Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="applications/:id" element={<AdminApplicationDetailPage />} />
            <Route path="admission-periods" element={<AdminAdmissionPeriodsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </AuthProvider>
  );
}

export default App;

