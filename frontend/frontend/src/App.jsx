import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import AnimatedPage from "./components/AnimatedPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventDetails from "./pages/EventDetails";
import Events from "./pages/Events";
import Bookmarks from "./pages/Bookmarks";
import RegisteredEvents from "./pages/RegisteredEvents";
import Profile from "./pages/Profile";
import "./App.css";

function DashboardRedirect() {
  const { userProfile } = useAuth();
  if (!userProfile) return <Navigate to="/dashboard" replace />;
  switch (userProfile.role) {
    case "organizer": return <Navigate to="/organizer" replace />;
    case "admin": return <Navigate to="/admin" replace />;
    default: return <Navigate to="/dashboard" replace />;
  }
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navbar />
            <div className="app-content">
              <AnimatedPage>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />

                  {/* Student Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute roles={["student"]}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/create" element={
                    <ProtectedRoute roles={["student"]}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/bookmarks" element={
                    <ProtectedRoute roles={["student"]}>
                      <Bookmarks />
                    </ProtectedRoute>
                  } />
                  <Route path="/registered" element={
                    <ProtectedRoute roles={["student"]}>
                      <RegisteredEvents />
                    </ProtectedRoute>
                  } />

                  {/* Organizer Routes */}
                  <Route path="/organizer" element={
                    <ProtectedRoute roles={["organizer"]}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/organizer/create" element={
                    <ProtectedRoute roles={["organizer"]}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/organizer/manage" element={
                    <ProtectedRoute roles={["organizer"]}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/organizer/rsvps" element={
                    <ProtectedRoute roles={["organizer"]}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/events" element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/stats" element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Profile */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatedPage>
            </div>
          </div>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
