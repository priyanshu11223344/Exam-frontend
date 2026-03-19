import { useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";

const RedirectPage = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  const role = user?.publicMetadata?.role;

  // 🔥 IMPORTANT FIX
  if (!role) {
    return <div>Loading role...</div>;
  }

  if (role === "admin") {
    return <Navigate to="/admin" />;
  }

  return <Navigate to="/home" />;
};

export default RedirectPage;