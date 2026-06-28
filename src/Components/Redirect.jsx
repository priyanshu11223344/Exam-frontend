import { useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RedirectPage = () => {
  const { user, isLoaded } = useUser();
  const { user: backendUser, role: backendRole, loading } = useSelector((state) => state.user);

  if (!isLoaded || loading) return <div>Loading...</div>;

  if (!user?.publicMetadata?.role && !backendUser) {
    return <div>Loading role...</div>;
  }

  const role = user?.publicMetadata?.role || backendRole || "user";

  // 🔥 IMPORTANT FIX
  if (!role) {
    return <div>Loading role...</div>;
  }

  if (role === "admin") {
    return <Navigate to="/admin" />;
  }

  if (role === "teacher") {
    return <Navigate to="/TeacherDashboard" />;
  }

  return <Navigate to="/home" />;
};

export default RedirectPage;
