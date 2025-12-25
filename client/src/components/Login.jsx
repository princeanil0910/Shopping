import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Sign In</h1>
        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <input className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-400" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4">
          <Link
            to="/register"
            className="w-full block text-center bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-transform transform hover:scale-105"
          >
            Create new account
          </Link>
        </div>
      </div>
    </div>
  );
}
