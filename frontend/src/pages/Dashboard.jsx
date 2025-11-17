import React from "react";
import restaurantsAPI from "../api/restaurantsAPI";
import { useQuery } from "@tanstack/react-query";
import RestaurantCard from "../components/RestaurantCard";

const Dashboard = () => {
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
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {restaurants && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
