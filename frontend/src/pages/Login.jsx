import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("กรุณาใส่ username และ password");
      return;
    }
    try {
      const data = await login({
        username,
        password
      });

      localStorage.setItem("token", data.token);

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-gray-50 py-20">

      <div className="w-full max-w-sm min-w-0 bg-white p-6 rounded-xl shadow-md">

        <h2 className="text-xl font-semibold text-center mb-6">
          Login
        </h2>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>

          <div>
            <label className="text-sm text-gray-600">Username</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button
            className="w-full py-2 rounded-lg font-semibold text-gray-800 hover:shadow-md transition-all"
            style={{ background: "#F5E87C" }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}