import React from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const ErrorPage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="flex flex-col text-center max-w-md items-center justify-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Page not found
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <img
          src="https://media.tenor.com/tU9-0t-rp7gAAAAM/this-is-fine.gif"
          alt="Error"
          className="w-1/2 h-1/2 object-cover rounded-lg items-center justify-center"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center my-8">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isAuthenticated ? "Go to Dashboard" : "Go to Login"}
          </Link>
          <Link
            to="/"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Go back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
