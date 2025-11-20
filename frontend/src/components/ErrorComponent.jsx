import React, { useEffect } from "react";
import useErrorStore from "../stores/errorStore";

const ErrorComponent = () => {
  const { error, clearError } = useErrorStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-1 text-sm text-red-700">
              {error.split("\n").map((line, index) => (
                <p
                  key={index}
                  className={index > 0 ? "mt-1" : ""}
                  data-cy="error-message"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
          <button
            onClick={clearError}
            className="ml-4 flex-shrink-0 text-red-400 hover:text-red-600 focus:outline-none"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
