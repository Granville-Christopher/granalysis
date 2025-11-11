import React, { useState } from "react";

const ForgotPassword: React.FC = () => {
  // State for email-only form
  const [email, setEmail] = useState("");
  // State for reset form
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    // Dummy OTP send logic
  
    alert("OTP sent to " + email);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy reset logic
    if (!resetEmail || !otp || !newPassword || !confirmNewPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match.");
      return;
    }
    alert("Password reset successful!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl flex flex-col md:flex-row gap-8">
        {/* Email-only form */}
        <form
          onSubmit={handleSendOtp}
          className="flex-1 flex flex-col gap-4 md:max-w-xs"
        >
          <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
          <label className="block font-medium">Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition whitespace-nowrap"
            >
              Get OTP
            </button>
          </div>
        </form>
        {/* Reset form */}
        <form
          onSubmit={handleResetPassword}
          className="flex-1 flex flex-col gap-4"
        >
          <h2 className="text-xl font-bold mb-2 md:mt-0 mt-8">
            Reset Password
          </h2>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
          />
          <label className="block font-medium">OTP</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <label className="block font-medium">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowNewPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>
          <label className="block font-medium">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              className="w-full px-3 py-2 border rounded pr-10"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirmNewPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showConfirmNewPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition mt-2"
          >
            Reset Password
          </button>
        </form>
        {/* Back to login link under reset form */}
        <div className="w-full md:w-auto mt-6 text-center text-sm">
          <a href="/login" className="text-blue-600 hover:underline">
            &larr; Back to login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
