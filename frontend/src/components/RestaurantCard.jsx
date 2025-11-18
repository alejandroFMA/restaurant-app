import React from "react";
import RatingStars from "./RatingStars";
import { Link } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  const recommended = restaurant.average_rating > 4.5;
  const popular = restaurant.reviews_count > 5;

  return (
    <Link to={`/restaurant/${restaurant.id}`} className="block ">
      <div className="hover:shadow-md my-4 p-4 rounded-md">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-40 object-cover rounded-md"
        />
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex flex-row gap-2 justify-start items-center">
            <h2 className="text-xl font-bold text-start">{restaurant.name}</h2>
            <p>({restaurant.neighborhood})</p>
          </div>
          <div className="flex flex-row gap-12 justify-center items-center">
            <div className="flex flex-row gap-1 justify-start items-center">
              <RatingStars rating={restaurant.average_rating} readOnly={true} />
              <p className="text-lg  text-gray-500">
                ({restaurant.average_rating})
              </p>
              <span className="text-xs text-black-500 font-semibold">
                Avg. Rating
              </span>
            </div>
            <p className="text-sm text-black font-bold">
              ({restaurant.reviews_count} reviews)
            </p>
          </div>
          {(recommended || popular) && (
            <div className="flex flex-row gap-2 justify-start items-center">
              {recommended && (
                <span className="text-green-500">🌟 Recommended!</span>
              )}
              {popular && <span className="text-red-500">🔥 Popular!</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
