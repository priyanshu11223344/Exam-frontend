import {useUser} from "@clerk/react"
import { Navigate } from "react-router-dom"

const ProtectedRoute=({children})=>{
    const {isSignedIn,isLoaded}=useUser();
    if(!isLoaded)return <div> Loading...</div>
    if(!isSignedIn){
        return <Navigate to="/login"/>
    }
    return children;
};
export default ProtectedRoute;