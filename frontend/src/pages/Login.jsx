import { useState } from "react";
import { login } from "../api/authAPI";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "../stores/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuth } = useAuthStore();

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      if (data.token && data.user) {
        setAuth(data.user, data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    },
  });

  const handleLogin = () => {
    loginMutation({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={handleLogin}
          disabled={isPending}
        >
          {isPending ? "Logging in..." : "Login"}
        </button>
        {isError && (
          <div style={{ color: "red" }}>
            {error?.response?.data?.message || "Error logging in"}
          </div>
        )}
      </div>
      <div>
        "No account? <a href="/register">Register</a>"
      </div>
    </div>
  );
};

export default Login;
