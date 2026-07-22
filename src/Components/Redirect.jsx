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
  const studentProfileIncomplete = role === "user" && backendUser && !(backendUser.profileComplete ?? (backendUser.name && backendUser.board && backendUser.studentClass));
  const lastRoute = sessionStorage.getItem("lastRoute") || "";
  const lastPath = lastRoute.split(/[?#]/)[0];

  // 🔥 IMPORTANT FIX
  if (!role) {
    return <div>Loading role...</div>;
  }

  if (studentProfileIncomplete) {
    return <Navigate to="/UserDashboard/dashboard" replace />;
  }

  if (lastRoute && lastPath) {
    const isAdminRoute = lastPath === "/admin" || lastPath.startsWith("/admin/");
    const isTeacherRoute = lastPath === "/TeacherDashboard" || lastPath.startsWith("/TeacherDashboard/");
    if ((role === "admin" || role === "staff") && isAdminRoute) {
      return <Navigate to={lastRoute} replace />;
    }

    if (role === "teacher" && isTeacherRoute) {
      return <Navigate to={lastRoute} replace />;
    }

    if (
      role !== "admin" &&
      role !== "staff" &&
      role !== "teacher" &&
      !isAdminRoute &&
      !isTeacherRoute
    ) {
      return <Navigate to={lastRoute} replace />;
    }
  }

  if (role === "admin" || role === "staff") {
    return <Navigate to="/admin/overview" replace />;
  }

  if (role === "teacher") {
    return <Navigate to="/TeacherDashboard/overview" replace />;
  }

  return <Navigate to="/UserDashboard/dashboard" replace />;
};

export default RedirectPage;
