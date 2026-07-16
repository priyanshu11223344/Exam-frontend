import { useUser } from "@clerk/react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const TeacherProtected = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { user: backendUser, role, loading } = useSelector((state) => state.user);

  const clerkRole = user?.publicMetadata?.role;

  if (!isLoaded) return <div>Loading...</div>;

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (!clerkRole && !backendUser && loading) {
    return <div>Checking teacher permissions...</div>;
  }

  const resolvedRole = clerkRole || role || "user";

  if (!["admin", "teacher"].includes(resolvedRole)) {
    return <Navigate to="/home" />;
  }

  return children;
};

export default TeacherProtected;
