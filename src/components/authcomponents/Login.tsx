import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

interface LoginProps {
  onShowCodeLogin?: () => void;
  onLoginSuccess?: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onShowCodeLogin, onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
      try {
        const loginResponse = await api.post("/auth/login", { email, password });
        console.log('[Frontend] Login response:', loginResponse.headers);
        
        const userResponse = await api.get("/auth/me");
        console.log('[Frontend] /me response:', userResponse.headers);
        const message = `Logged in! Welcome ${userResponse.data.user.fullName}`;
        setSuccess(message);
        setError("");
        if (onLoginSuccess) {
          onLoginSuccess(userResponse.data.user);
        } else {
          // Force reload so App.tsx re-checks authentication and routes to dashboard
          window.location.reload();
        }
        console.log('Logged in:', userResponse.data);
        navigate("/dashboard");
        window.location.reload();
    } catch (err: any) {
    setSuccess("");
    setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          {success ? (
            <div className="mb-4 text-green-600">{success}</div>
          ) : (
            error && <div className="mb-4 text-red-600">{error}</div>
          )}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          <span>
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </a>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;
