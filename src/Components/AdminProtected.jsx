import { useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";

const AdminProtected = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  // ❌ Not logged in
  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  const role = user?.publicMetadata?.role;

  // 🔥 Wait for role (IMPORTANT)
  if (!role) {
    return <div>Checking permissions...</div>;
  }

  // ❌ Not admin
  if (role !== "admin") {
    
    return <Navigate to="/home" />;
  }

  // ✅ Admin access
  return children;
};

export default AdminProtected;