import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import authAPI from "../api/authAPI";
import { useMutation } from "@tanstack/react-query";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const navigate = useNavigate();
  const {
    mutate: registerMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: (userData) => authAPI.register(userData),
    onSuccess: () => {
      navigate("/login");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleRegister = (e) => {
    e.preventDefault();
    registerMutation({
      username,
      email,
      password,
      first_name,
      last_name,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleRegister}
        className="flex flex-col items-center justify-center w-full max-w-xs p-8 bg-white rounded shadow"
      >
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <input
          type="text"
          placeholder="Username"
          className="mb-2 w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="mb-2 w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="mb-2 w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="First Name"
          className="mb-2 w-full p-2 border rounded"
          value={first_name}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="mb-4 w-full p-2 border rounded"
          value={last_name}
          onChange={(e) => setLastName(e.target.value)}
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isPending ? "Registering..." : "Register"}
        </button>
        {isError && (
          <div className="text-red-500 mt-2">
            {error?.response?.data?.message ||
              error?.message ||
              `Registration failed. ${
                error?.response?.status
                  ? `Status: ${error.response.status}`
                  : ""
              }`}
          </div>
        )}
        <div className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
