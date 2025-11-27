import { useState } from "react";
import { login } from "../api/auth"; // Assuming this is your API call
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Simulate API call delay for better UX
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      // Catch error from the 'login' function
      setError("Invalid email or password");
    }
  };

  return (
    // 1. Main container: full screen, dark background with gradient effect
    <div className="min-h-screen flex">
      {/* --- Left Section (Branding/Info) --- */}
      <div className="hidden lg:flex flex-col justify-center p-16 w-full lg:w-1/2 
                    bg-gradient-to-br from-teal-800 to-teal-900 
                    text-white">
        
        {/* Logo and Name */}
        <div className="flex items-center space-x-3 mb-10">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {/* Simple representation of the logo/icon */}
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15H9v-4H7v4H5v-6h2V9h2v2h2v6zm4-2v-2h2v2h-2zm-2 0v-2h2v2h-2zm4-4h-2V9h-2v2h-2V7h6v6z"/>
          </svg>
          <h1 className="text-3xl font-semibold">GymBios</h1>
        </div>

        <p className="text-4xl font-extrabold mb-4">
          Welcome back to the future of **wellness services industry**
        </p>
        <p className="text-xl opacity-80 mb-10">
          Streamline your fitness business with our comprehensive management platform designed for modern wellness services.
        </p>

        {/* Features List */}
        <ul className="space-y-4">
          <li className="flex items-center">
            <span className="mr-3 text-teal-300">✓</span> Secure & reliable platform
          </li>
          <li className="flex items-center">
            <span className="mr-3 text-teal-300">✓</span> Complete business management
          </li>
          <li className="flex items-center">
            <span className="mr-3 text-teal-300">✓</span> Real-time analytics & insights
          </li>
        </ul>
      </div>

      {/* --- Right Section (Login Form) --- */}
      <div className="flex items-center justify-center p-8 w-full lg:w-1/2 
                    bg-gray-50 lg:bg-white"> 
        <div className="bg-white p-8 shadow-2xl rounded-xl w-full max-w-md border border-gray-100"> 
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Welcome back!</h2>
          <p className="text-gray-500 mb-6 text-center text-sm">
            Please login to continue to your dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg 
                          focus:ring-teal-500 focus:border-teal-500 bg-gray-100 placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gymbios.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 px-4 py-3 rounded-lg 
                          focus:ring-teal-500 focus:border-teal-500 bg-gray-100 placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
              {/* Remember me and Forgot Password links */}
              <div className="flex justify-between items-center text-sm mt-2">
                <label className="flex items-center text-gray-600">
                  <input type="checkbox" className="mr-2 text-teal-600 focus:ring-teal-500" />
                  Remember me
                </label>
                <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                  Forgot password?
                </a>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full flex justify-center items-center 
                        bg-teal-700 hover:bg-teal-800 text-white 
                        py-3 rounded-lg font-semibold transition duration-200"
            >
              Sign In →
            </button>
          </form>

          {/* Separator and Social Logins */}
          <div className="my-6 flex items-center">
            <hr className="flex-grow border-gray-200" />
            <span className="mx-4 text-gray-400 text-sm">Or continue with</span>
            <hr className="flex-grow border-gray-200" />
          </div>

          <div className="flex space-x-4">
            <button className="w-full flex items-center justify-center border border-gray-300 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150">
              {/* Google Icon Placeholder */}
              <span className="mr-2">G</span> Google
            </button>
            <button className="w-full flex items-center justify-center border border-gray-300 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150">
              {/* Apple Icon Placeholder */}
              <span className="mr-2"></span> Apple
            </button>
          </div>
          
          {/* Footer links */}
          <div className="mt-8 text-center text-xs text-gray-500 space-y-2">
            <p className="text-sm">New to GymBios? <a href="#" className="text-teal-600 hover:underline font-medium">Request a demo</a></p>
            <p className="pt-4">© 2024 GymBios. All rights reserved.</p>
            <div className="space-x-4">
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Terms of Service</a>
                <a href="#" className="hover:underline">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}