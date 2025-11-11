import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800 font-sans">
    {children}
  </div>
);

export default DashboardLayout;
