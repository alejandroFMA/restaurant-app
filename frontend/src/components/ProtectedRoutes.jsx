import { Navigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
