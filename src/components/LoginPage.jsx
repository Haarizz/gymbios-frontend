import { useState } from "react";
import { login } from "../api/auth";
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
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-xl rounded-xl w-[400px]">
        <h2 className="text-2xl font-bold mb-4 text-center">Welcome back!</h2>
        <p className="text-gray-500 mb-6 text-center">
          Please login to continue to your dashboard
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label>Email Address</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded-lg mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gymbios.com"
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded-lg mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-teal-700 text-white py-2 rounded-lg mt-4"
          >
            Sign In →
          </button>
        </form>
      </div>
    </div>
  );
}
