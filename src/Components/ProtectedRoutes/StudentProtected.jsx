import { useUser } from "@clerk/react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const StudentProtected = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { user: backendUser, role, loading } = useSelector((state) => state.user);

  if (!isLoaded || loading) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (!user?.publicMetadata?.role && !backendUser) {
    return <div>Checking permissions...</div>;
  }

  const resolvedRole = user?.publicMetadata?.role || role || "user";

  if (resolvedRole === "teacher") {
    return <Navigate to="/TeacherDashboard" replace />;
  }

  if (resolvedRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default StudentProtected;
