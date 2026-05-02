import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";

const FeatureProtectedRoute = ({ children, feature }) => {
  const { features = [], role = "user" } = useSelector((state) => state.user);

  // ✅ ADMIN BYPASS + feature check
  const hasAccess = role === "admin" || features.includes(feature);

  useEffect(() => {
    if (!hasAccess) {
      toast.error("This feature is locked. Please upgrade your plan.");
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return <Navigate to="/pricingPage" replace />;
  }

  return children;
};

export default FeatureProtectedRoute;