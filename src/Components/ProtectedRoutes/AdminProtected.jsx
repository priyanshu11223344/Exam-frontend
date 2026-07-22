import { useUser } from "@clerk/react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminProtected = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { user: backendUser, role: backendRole, loading } = useSelector((state) => state.user);

  const clerkRole = user?.publicMetadata?.role;

  if (!isLoaded) return <div>Loading...</div>;

  // ❌ Not logged in
  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (!clerkRole && !backendUser && loading) {
    return <div>Checking permissions...</div>;
  }

  const role = clerkRole || backendRole || "user";

  // ❌ Not admin
  if (!["admin", "staff"].includes(role)) {
    
    return <Navigate to="/home" />;
  }

  // ✅ Admin access
  return children;
};

export default AdminProtected;
