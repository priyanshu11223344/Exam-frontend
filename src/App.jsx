import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './Components/Navbar.jsx';
import SearchForm from './Components/SearchForm.jsx';
import ResourceCard from './Components/ResourceCard.jsx';
import Home from './Components/Home.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from "@clerk/react"
import Admin from "./Components/Admin.jsx"
import LandingPage from './Components/LandingPage.jsx';
import ProtectedRoute from './Components/ProtectedRoutes/ProtectedRoute.jsx';
import RedirectPage from './Components/Redirect.jsx';
import AdminProtected from "./Components/ProtectedRoutes/AdminProtected.jsx"
import UserDashboard from './Components/UserDashboard.jsx';
import Quiz from './Components/Quiz/Quiz.jsx';
import PricingPage from './Components/Subscription/PricingPage.jsx';
import { fetchUser } from './features/user/userSlice.js';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import FeatureProtectedRoute from './Components/ProtectedRoutes/FeatureProtectedRoute.jsx';
import { useAuth } from '@clerk/react';
const App = () => {
  const dispatch = useDispatch();
  // 🔥 Get real papers from Redux
  const {getToken}=useAuth();
  useEffect(() => {
    if (getToken) {
      dispatch(fetchUser({ getToken }));
    }
  }, [dispatch, getToken]);

  return (
    // <div className="min-h-screen pb-20">
    //   <Navbar />



    //   {/* Quick Help Floating Button */}

    // </div>
    <Router>
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
        <Route path="/admin" element={<AdminProtected><Admin /></AdminProtected>}></Route>
        <Route path="/UserDashboard" element={<UserDashboard />}></Route>
        <Route path="/pricingPage" element={<PricingPage />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
