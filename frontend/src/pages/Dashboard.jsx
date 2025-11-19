import React, { useState, useMemo } from "react";
import restaurantsAPI from "../api/restaurantsAPI";
import { useQuery } from "@tanstack/react-query";
import RestaurantCard from "../components/RestaurantCard";
import RestaurantCardSkeleton from "../components/RestaurantCardSkeleton";

const Dashboard = () => {
  const [sortOption, setSortOption] = useState("name_asc");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["restaurants", sortOption],
    queryFn: () => restaurantsAPI.fetchAllRestaurants(sortOption),
  });

  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];
    if (!searchTerm.trim()) return restaurants;

    const term = searchTerm.toLowerCase().trim();
    return restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(term) ||
        restaurant.neighborhood.toLowerCase().includes(term) ||
        restaurant.address.toLowerCase().includes(term) ||
        restaurant.cuisine_type.toLowerCase().includes(term)
    );
  }, [restaurants, searchTerm]);

  return (
    <div className="flex flex-col gap-4">
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(8)].map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div className="flex flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm hover:shadow-md"
            placeholder="🔍 Search restaurants by name..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="sort-by" className="text-sm font-medium">
            Sort by
          </label>
          <select
            id="sort-by"
            className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all shadow-sm hover:shadow-md"
            value={sortOption}
            disabled={isLoading}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="average_rating_desc">
              Average Rating (Highest)
            </option>
            <option value="average_rating_asc">Average Rating (Lowest)</option>
            <option value="reviews_count_desc">Reviews Count (Highest)</option>
            <option value="reviews_count_asc">Reviews Count (Lowest)</option>
          </select>
        </div>
      </div>

      {filteredRestaurants && filteredRestaurants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id || restaurant._id}
              restaurant={restaurant}
            />
          ))}
        </div>
      )}

      {filteredRestaurants &&
        filteredRestaurants.length === 0 &&
        searchTerm && (
          <div className="text-center py-8 text-gray-500">
            No restaurants found matching "{searchTerm}"
          </div>
        )}
    </div>
  );
};

export default Dashboard;
