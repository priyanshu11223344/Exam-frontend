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
  const lastRoute = sessionStorage.getItem("lastRoute") || "";
  const lastPath = lastRoute.split(/[?#]/)[0];

  // 🔥 IMPORTANT FIX
  if (!role) {
    return <div>Loading role...</div>;
  }

  if (lastRoute && lastPath) {
    const isAdminRoute = lastPath === "/admin" || lastPath.startsWith("/admin/");
    const isTeacherRoute = lastPath === "/TeacherDashboard" || lastPath.startsWith("/TeacherDashboard/");
    const isStudentRoute = lastPath === "/UserDashboard" || lastPath.startsWith("/UserDashboard/");

    if (role === "admin" && !isStudentRoute && lastPath !== "/home") {
      return <Navigate to={lastRoute} replace />;
    }

    if (role === "teacher" && isTeacherRoute) {
      return <Navigate to={lastRoute} replace />;
    }

    if (
      role !== "admin" &&
      role !== "teacher" &&
      !isAdminRoute &&
      !isTeacherRoute
    ) {
      return <Navigate to={lastRoute} replace />;
    }
  }

  if (role === "admin") {
    return <Navigate to="/admin/overview" replace />;
  }

  if (role === "teacher") {
    return <Navigate to="/TeacherDashboard/overview" replace />;
  }

  return <Navigate to="/home" replace />;
};

export default RedirectPage;
