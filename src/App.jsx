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
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import RedirectPage from './Components/Redirect.jsx';
import AdminProtected from "./Components/AdminProtected.jsx"
import UserDashboard from './Components/UserDashboard.jsx';
const App = () => {

  // 🔥 Get real papers from Redux


  return (
    // <div className="min-h-screen pb-20">
    //   <Navbar />



    //   {/* Quick Help Floating Button */}

    // </div>
    <Router>
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
        <Route path="/admin" element={<AdminProtected><Admin /></AdminProtected>}></Route>
        <Route path="/UserDashboard" element={<UserDashboard/>}></Route>
      </Routes>
    </Router>
  );
};

export default App;
