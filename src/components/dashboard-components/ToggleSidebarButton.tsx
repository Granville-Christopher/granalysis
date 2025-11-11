import React from "react";

interface ToggleSidebarButtonProps {
  onClick: () => void;
}

const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({
  onClick,
}) => (
  <button
    onClick={onClick}
    className="lg:hidden fixed top-4 left-0 pl-4 z-50 p-1 flex items-center text-gray-700 rounded-tr-md rounded-br-md shadow-lg"
    aria-label="Open sidebar"
  >
    <span className="material-icons">menu</span>
  </button>
);

export default ToggleSidebarButton;
