import {useUser} from "@clerk/react"
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

const ProtectedRoute=({children})=>{
    const {isSignedIn,isLoaded,user}=useUser();
    const { user: backendUser, role, loading } = useSelector((state) => state.user);
    if(!isLoaded)return <div> Loading...</div>
    if(!isSignedIn){
        return <Navigate to="/login"/>
    }
    if (loading) return <div>Checking your academic profile...</div>;
    const resolvedRole = user?.publicMetadata?.role || role || "user";
    const profileIncomplete = resolvedRole === "user" && backendUser && !(backendUser.profileComplete ?? (backendUser.name && backendUser.board && backendUser.studentClass));
    if (profileIncomplete) return <Navigate to="/UserDashboard/dashboard" replace />;
    return children;
};
export default ProtectedRoute;
