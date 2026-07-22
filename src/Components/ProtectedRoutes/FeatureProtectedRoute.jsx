import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";

const FeatureProtectedRoute = ({ children, feature }) => {
  const { features = [], role = "user", user, loading } = useSelector((state) => state.user);
  const profileIncomplete = role === "user" && user && !(user.profileComplete ?? (user.name && user.board && user.studentClass));

  // ✅ ADMIN BYPASS + feature check
  const hasAccess = role === "admin" || features.includes(feature);

  useEffect(() => {
    if (!loading && !profileIncomplete && !hasAccess) {
      toast.error("This feature is locked. Please upgrade your plan.");
    }
  }, [hasAccess, loading, profileIncomplete]);

  if (loading) return <div>Checking your academic profile...</div>;
  if (profileIncomplete) return <Navigate to="/UserDashboard/dashboard" replace />;

  if (!hasAccess) {
    return <Navigate to="/pricingPage" replace />;
  }

  return children;
};

export default FeatureProtectedRoute;
