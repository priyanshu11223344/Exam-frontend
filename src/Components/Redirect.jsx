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
    const adminOnlyRoutes = new Set(["/admin"]);
    const teacherOnlyRoutes = new Set(["/TeacherDashboard"]);
    const studentOnlyRoutes = new Set(["/UserDashboard"]);

    if (role === "admin" && !studentOnlyRoutes.has(lastPath) && lastPath !== "/home") {
      return <Navigate to={lastRoute} replace />;
    }

    if (role === "teacher" && teacherOnlyRoutes.has(lastPath)) {
      return <Navigate to={lastRoute} replace />;
    }

    if (
      role !== "admin" &&
      role !== "teacher" &&
      !adminOnlyRoutes.has(lastPath) &&
      !teacherOnlyRoutes.has(lastPath)
    ) {
      return <Navigate to={lastRoute} replace />;
    }
  }

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "teacher") {
    return <Navigate to="/TeacherDashboard" replace />;
  }

  return <Navigate to="/home" replace />;
};

export default RedirectPage;
