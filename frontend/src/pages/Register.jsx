import { useState } from "react";
import { register } from "../api/authAPI";
import { useMutation } from "@tanstack/react-query";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const {
    mutate: registerMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({ username, email, password, firstName, lastName }) =>
      register(username, email, password, firstName, lastName),
  });

  const handleRegister = () => {
    registerMutation({ username, email, password, firstName, lastName });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-xs p-8 bg-white rounded shadow">
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
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          className="mb-4 w-full p-2 border rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <button
          onClick={handleRegister}
          disabled={isPending}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isPending ? "Registering..." : "Register"}
        </button>
        {isError && (
          <div className="text-red-500 mt-2">
            {error?.message || "Registration failed."}
          </div>
        )}
        <div className="mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
