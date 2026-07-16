import React from 'react';
import Home from './Components/Home.jsx';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from "@clerk/react"
import Admin from "./Components/Admin.jsx"
import LandingPage from './Components/LandingPage.jsx';
import ProtectedRoute from './Components/ProtectedRoutes/ProtectedRoute.jsx';
import StudentProtected from './Components/ProtectedRoutes/StudentProtected.jsx';
import RedirectPage from './Components/Redirect.jsx';
import AdminProtected from "./Components/ProtectedRoutes/AdminProtected.jsx"
import TeacherProtected from "./Components/ProtectedRoutes/TeacherProtected.jsx"
import UserDashboard from './Components/UserDashboard.jsx';
import TeacherDashboard from './Components/TeacherDashboard.jsx';
import RouteMemory from './Components/RouteMemory.jsx';
import Quiz from './Components/Quiz/Quiz.jsx';
import PricingPage from './Components/Subscription/PricingPage.jsx';
import { fetchUser, setAdminAccess } from './features/user/userSlice.js';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import FeatureProtectedRoute from './Components/ProtectedRoutes/FeatureProtectedRoute.jsx';
import { useAuth, useUser } from '@clerk/react';
const App = () => {
  const dispatch = useDispatch();
  // 🔥 Get real papers from Redux
  const {getToken}=useAuth();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user.publicMetadata?.role;

    if (role === "admin") {
      dispatch(setAdminAccess({
        name: user.fullName || user.firstName || "Admin",
        email: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [dispatch, isLoaded, user]);

  useEffect(() => {
    if (getToken && isLoaded && user) {
      dispatch(fetchUser({ getToken, clerkUser: user }));
    }
  }, [dispatch, getToken, isLoaded, user]);

  return (
    // <div className="min-h-screen pb-20">
    //   <Navbar />



    //   {/* Quick Help Floating Button */}

    // </div>
    <Router>
      <RouteMemory />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '10px',
            padding: '12px 16px'
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/redirect" element={<RedirectPage />} />
        <Route
          path="/login"
          element={
            <SignIn forceRedirectUrl="/redirect" />
          }
        />

        <Route
          path="/signup"
          element={
            <SignUp forceRedirectUrl="/redirect" />
          }
        />
        <Route
          path="/quiz"
          element={
            <FeatureProtectedRoute feature="mcq">
              <Quiz />
            </FeatureProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminProtected><Navigate to="/admin/overview" replace /></AdminProtected>}></Route>
        <Route path="/admin/:section" element={<AdminProtected><Admin /></AdminProtected>}></Route>
        <Route path="/UserDashboard" element={<StudentProtected><Navigate to="/UserDashboard/dashboard" replace /></StudentProtected>}></Route>
        <Route path="/UserDashboard/:tab" element={<StudentProtected><UserDashboard /></StudentProtected>}></Route>
        <Route path="/TeacherDashboard" element={<TeacherProtected><Navigate to="/TeacherDashboard/overview" replace /></TeacherProtected>}></Route>
        <Route path="/TeacherDashboard/:tab" element={<TeacherProtected><TeacherDashboard /></TeacherProtected>}></Route>
        <Route path="/pricingPage" element={<PricingPage />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
