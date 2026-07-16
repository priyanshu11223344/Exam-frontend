import { useUser } from "@clerk/react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const StudentProtected = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { user: backendUser, role, loading } = useSelector((state) => state.user);

  const clerkRole = user?.publicMetadata?.role;

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (!clerkRole && !backendUser && loading) {
    return <div>Checking permissions...</div>;
  }

  const resolvedRole = clerkRole || role || "user";

  if (resolvedRole === "teacher") {
    return <Navigate to="/TeacherDashboard/overview" replace />;
  }

  if (resolvedRole === "admin") {
    return <Navigate to="/admin/overview" replace />;
  }

  return children;
};

export default StudentProtected;
