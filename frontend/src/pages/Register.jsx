import { useNavigate, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import authAPI from "../api/authAPI";
import { useMutation } from "@tanstack/react-query";
import { passwordValidator } from "../utils/validators/passwordValidator";
import { emailValidator } from "../utils/validators/emailValidator";
import { userSchema } from "../utils/validators/user.schema";
import Spinner from "../components/Spinner";
const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");

  const passwordChecks = useMemo(() => {
    return passwordValidator(password);
  }, [password]);
  const navigate = useNavigate();

  const emailChecks = useMemo(() => {
    return emailValidator(email);
  }, [email]);

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

    const formData = {
      username,
      email,
      password,
      first_name,
      last_name,
    };

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      console.log(result.error.issues);
      const errorMessages = result.error.issues.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      alert(`\n${errorMessages.join("\n")}`);
      return;
    }

    registerMutation(result.data);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src="https://media-cdn.tripadvisor.com/media/photo-m/1280/17/09/88/77/caption.jpg"
          alt="Register background"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white border-2 border-black rounded-lg shadow-lg">
        <form onSubmit={handleRegister} className="p-8 space-y-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Register
          </h1>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  email
                    ? emailChecks
                      ? "border-green-500 focus:ring-green-500"
                      : "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-600"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {email && (
                <div className="mt-2 space-y-1">
                  <div
                    className={`flex items-center text-xs ${
                      emailChecks ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span className="mr-2">{emailChecks ? "✓" : "○"}</span>
                    Valid email format
                  </div>
                </div>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  password
                    ? passwordChecks.isValid
                      ? "border-green-500 focus:ring-green-500"
                      : "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-600"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {password && (
                <div className="mt-2 space-y-1">
                  <div
                    className={`flex items-center text-xs ${
                      passwordChecks.hasMinLength
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <span className="mr-2">
                      {passwordChecks.hasMinLength ? "✓" : "○"}
                    </span>
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center text-xs ${
                      passwordChecks.hasNumber
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <span className="mr-2">
                      {passwordChecks.hasNumber ? "✓" : "○"}
                    </span>
                    Contains a number
                  </div>
                  <div
                    className={`flex items-center text-xs ${
                      passwordChecks.hasSpecialChar
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    <span className="mr-2">
                      {passwordChecks.hasSpecialChar ? "✓" : "○"}
                    </span>
                    Contains a special character (!@#$%^&*)
                  </div>
                </div>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error?.response?.data?.message ||
                error?.message ||
                `Registration failed. ${
                  error?.response?.status
                    ? `Status: ${error.response.status}`
                    : ""
                }`}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isPending && <Spinner className="h-5 w-5" />}
            {isPending ? "Registering..." : "Create account"}
          </button>

          <div className="text-center text-sm text-gray-600 pt-2">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
