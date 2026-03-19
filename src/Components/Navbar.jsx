import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/react';

const Navbar = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();

  const handleLogout = async () => {
    await signOut();
    navigate("/"); // redirect after logout
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              Aurethia
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Resources</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Syllabus</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Revision Tools</a>

            {/* Dashboard */}
            <button
             onClick={() => {
              if (!isSignedIn) {
                navigate("/login");
                return;
              }
            
              const role = user?.publicMetadata?.role;
            
              if (role === "admin") {
                navigate("/admin");
              } else {
                navigate("/UserDashboard");
              }
            }}
              className="bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 transition-all shadow-md"
            >
              Dashboard
            </button>

            {/* Logout (only if signed in) */}
            {isSignedIn && (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all shadow-md"
              >
                Logout
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;