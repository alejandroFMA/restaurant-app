import React from "react";
import { useParams } from "react-router-dom";
import restaurantsAPI from "../api/restaurantsAPI";
import reviewsAPI from "../api/reviewsAPI";
import { useQuery } from "@tanstack/react-query";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";
import FavouriteComponent from "../components/FavouriteComponent";

const RestaurantDetail = () => {
  const { id } = useParams();
  const {
    data: restaurant,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => restaurantsAPI.fetchRestaurantById(id),
  });

  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery({
    queryKey: ["reviews", "restaurant", id],
    queryFn: () => reviewsAPI.fetchAllReviewsForRestaurant(id),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!restaurant) return <p>Restaurant not found</p>;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="relative w-full h-64 bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden"
        style={{ backgroundImage: `url(${restaurant.image})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative h-full flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            {restaurant.name}
          </h1>
          <p className="text-white text-lg">{restaurant.address}</p>
          <p className="text-white text-lg">{restaurant.cuisine_type}</p>
        </div>
      </div>

      <div className="flex flex-row gap-10 justify-around items-center w-full">
        {restaurant.operating_hours && (
          <div className="flex flex-col gap-2 border border-black rounded-lg p-4 w-max">
            {Object.entries(restaurant.operating_hours).map(([day, hours]) => (
              <p key={day} className="text-gray-600 text-sm">
                <span className="font-medium">{day}:</span> {hours}
              </p>
            ))}
          </div>
        )}

        <div className="flex-1 max-w-lg">
          <div className="border border-black rounded-lg p-4 flex flex-col gap-4">
            <ReviewForm restaurantId={id} />
          </div>
          <div className="flex flex-row gap-2 my-2">
            <FavouriteComponent restaurantId={id} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center w-full">
        <h2 className="text-2xl font-bold">Reviews</h2>
        {reviewsLoading && <p>Loading reviews...</p>}
        {reviewsError && <p>Error: {reviewsError.message}</p>}
        {reviews && reviews.length > 0 ? (
          <div className="flex flex-col gap-4 w-full max-w-3xl">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
