import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "../stores/authStore";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProtectedRoutes from "../components/ProtectedRoutes";
import Layout from "../components/layout/Layout";
import RestaurantDetail from "../pages/RestaurantDetail";
import UserProfile from "../pages/UserProfile";
import CreateRestaurant from "../pages/CreateRestaurant";
import ErrorComponent from "../components/ErrorComponent";

const Router = () => {
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <ErrorComponent />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
          }
        />

        <Route
          element={
            <ProtectedRoutes>
              <Layout />
            </ProtectedRoutes>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/create-restaurant" element={<CreateRestaurant />} />
        </Route>

        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
