import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && userProfile && !roles.includes(userProfile.role)) {
    // Redirect to appropriate dashboard based on actual role
    const redirectMap = {
      student: "/dashboard",
      organizer: "/organizer",
      admin: "/admin",
    };
    return (
      <Navigate to={redirectMap[userProfile.role] || "/dashboard"} replace />
    );
  }

  return children;
}
