import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './Components/Navbar.jsx';
import SearchForm from './Components/SearchForm.jsx';
import ResourceCard from './Components/ResourceCard.jsx';
import Home from './Components/Home.jsx';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Admin from "./Components/Admin.jsx"
const App = () => {

  // 🔥 Get real papers from Redux


  return (
    // <div className="min-h-screen pb-20">
    //   <Navbar />
      
      

    //   {/* Quick Help Floating Button */}
   
    // </div>
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/admin" element={<Admin/>}></Route>
      </Routes>
    </Router>
  );
};

export default App;
