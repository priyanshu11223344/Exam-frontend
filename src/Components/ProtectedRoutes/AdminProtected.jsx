import { useUser } from "@clerk/react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminProtected = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { user: backendUser, role: backendRole, loading } = useSelector((state) => state.user);

  if (!isLoaded || loading) return <div>Loading...</div>;

  // ❌ Not logged in
  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (!user?.publicMetadata?.role && !backendUser) {
    return <div>Checking permissions...</div>;
  }

  const role = user?.publicMetadata?.role || backendRole || "user";

  // ❌ Not admin
  if (role !== "admin") {
    
    return <Navigate to="/home" />;
  }

  // ✅ Admin access
  return children;
};

export default AdminProtected;
