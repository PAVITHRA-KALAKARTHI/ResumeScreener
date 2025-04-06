import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar} 
        className="fixed top-4 right-40 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-2 z-50 shadow-lg hover:from-blue-600 hover:to-purple-600 transition"
      >
        {isOpen ? '×' : '☰'}
      </button>

      {/* Sidebar Section */}
      {isOpen && (
        <div className="fixed top-16 right-1 w-48 bg-gradient-to-b from-blue-100 to-purple-300 dark:from-gray-800 dark:to-red-900 shadow-md rounded-lg z-50 p-4">
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => handleNavigation('/')} 
                className="block w-full text-left text-sm p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Home
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/auth')} 
                className="block w-full text-left text-sm p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Login / Sign Up
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/dashboard')} 
                className="block w-full text-left text-sm p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/jobs')} 
                className="block w-full text-left text-sm p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Jobs
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/?showAnalytics=true')} 
                className="block w-full text-left text-sm p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Resume Analytics
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;