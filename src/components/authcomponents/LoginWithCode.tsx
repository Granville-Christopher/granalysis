import React, { useState } from "react";

interface LoginWithCodeProps {
  onShowPasswordLogin?: () => void;
  onLoginSuccess?: (user: any) => void;
}

const LoginWithCode: React.FC<LoginWithCodeProps> = ({
  onShowPasswordLogin,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [success, setSuccess] = useState("");

  const handleGetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email to get a login code.");
      return;
    }
  setError("");
  setCodeSent(true);
  setSuccess("Login code sent to your email!");
  // Add logic to send code here
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError("Please enter both email and login code.");
      return;
    }
  setError("");
  setSuccess("Logged in with code!");
  // Add login with code logic here
  onLoginSuccess?.({ email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen flex-col">
      <form onSubmit={handleSubmit} className="p-4 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login with Code</h2>
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
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleGetCode}
          >
            Get Login Code
          </button>
          {codeSent && (
            <span className="text-green-600 text-xs">Code sent!</span>
          )}
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Login Code</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
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
            <a
              href="/signup"
              className="text-blue-600 dark:text-blue-300 hover:underline"
            >
              Sign up
            </a>
          </span>
          <span>
            <a
              href="/forgot-password"
              className="text-blue-600 dark:text-blue-300 hover:underline"
            >
              Forgotten password? Reset password here
            </a>
          </span>
          {onShowPasswordLogin && (
            <button
              type="button"
              className="text-blue-600 dark:text-white mt-4 hover:underline text-sm mb-2"
              onClick={onShowPasswordLogin}
            >
              Login with password
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginWithCode;
