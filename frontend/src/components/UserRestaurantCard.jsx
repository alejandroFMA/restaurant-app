import React from "react";
import { Link } from "react-router-dom";

const UserRestaurantCard = ({ restaurant }) => {
  const restaurantId = restaurant.id || restaurant._id;

  return (
    <Link
      to={`/restaurant/${restaurantId}`}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <img
        src={restaurant.image || "https://via.placeholder.com/150"}
        alt={restaurant.name}
        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
      />
      <h3 className="text-lg font-semibold text-gray-800">{restaurant.name}</h3>
    </Link>
  );
};

export default UserRestaurantCard;
