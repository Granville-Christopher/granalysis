import React from "react";

interface HeaderProps {
  onLogout?: () => void;
  user?: { fullName?: string; email?: string } | null;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user }) => (
  <header
    className="fixed left-0 right-0 top-0 z-40 flex flex-col md:flex-row items-center bg-white dark:bg-gray-800 p-4 rounded-none md:ml-0 lg:left-64"
    style={{ minHeight: "72px" }}
  >
    <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">
      📊 Granalysis
    </h1>
    <div className="flex-1 flex justify-center w-full">
      <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
        <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200 shadow-md">
          Export CSV
        </button>
        <button className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-800 transition-colors duration-200 shadow-md">
          Export Excel
        </button>
        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 shadow-md">
          Export SQL
        </button>
      </div>
    </div>
    <div className="flex items-center ml-auto mt-4 md:mt-0">
      {/* User will always be present since this is protected */}
      <span className="mr-4 text-sm text-gray-700 font-bold uppercase dark:text-gray-300">
        {user?.fullName || user?.email}
      </span>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow-md hover:bg-red-700 transition-colors duration-200"
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  </header>
);

export default Header;
