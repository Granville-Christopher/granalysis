import React from "react";
import Login from "../components/authcomponents/Login";

const LoginPage: React.FC = () => {
  // No overlay switching on standalone page
  return <Login onShowCodeLogin={undefined} />;
};

export default LoginPage;
