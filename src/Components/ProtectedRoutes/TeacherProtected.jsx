import { useUser } from "@clerk/react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const TeacherProtected = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { user: backendUser, role, loading } = useSelector((state) => state.user);

  if (!isLoaded || loading) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (!user?.publicMetadata?.role && !backendUser) {
    return <div>Checking teacher permissions...</div>;
  }

  const resolvedRole = user?.publicMetadata?.role || role || "user";

  if (!["admin", "teacher"].includes(resolvedRole)) {
    return <Navigate to="/home" />;
  }

  return children;
};

export default TeacherProtected;
