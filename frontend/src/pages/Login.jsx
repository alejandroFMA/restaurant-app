import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authAPI from "../api/authAPI";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "../stores/authStore";
import Spinner from "../components/Spinner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({ email, password }) => authAPI.login(email, password),
    onSuccess: (data) => {
      if (data.token && data.user) {
        setAuth(data.user, data.token);
        navigate("/dashboard");
      }
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation({ email, password });
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src="https://www.restaurantinteriordesign.eu/wp-content/uploads/2022/01/Capa.png"
          alt="Login background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white border-2 border-black rounded-lg shadow-lg">
        <form onSubmit={handleLogin} className="p-8 space-y-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Sign in{" "}
          </h1>

          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error?.response?.data?.message || "Error logging in"}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isPending && <Spinner className="h-5 w-5" />}
            {isPending ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-sm text-gray-600">
            No account yet?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
