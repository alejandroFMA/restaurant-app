import React from "react";
import restaurantsAPI from "../api/restaurantsAPI";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../stores/authStore";

const Dashboard = () => {
  const { user } = useAuthStore();
  const {
    data: restaurants,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantsAPI.fetchAllRestaurants(),
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.username}</p>
      <p>You are {user?.is_admin ? "an admin" : "a user"}</p>
      <p>You have {restaurants?.length} restaurants in your dashboard</p>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {restaurants && (
        <p>
          Restaurants:{" "}
          {restaurants.map((restaurant) => restaurant.name).join(", ")}
        </p>
      )}
    </div>
  );
};

export default Dashboard;
