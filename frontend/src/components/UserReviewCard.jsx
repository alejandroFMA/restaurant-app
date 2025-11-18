import React from "react";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";

const UserReviewCard = ({ review, onDelete, isDeleting }) => {
  const restaurantId =
    typeof review.restaurant === "object"
      ? review.restaurant.id || review.restaurant._id
      : review.restaurant;
  const restaurantName =
    typeof review.restaurant === "object"
      ? review.restaurant.name
      : "Restaurant";

  return (
    <div className="flex flex-col gap-2 pb-4 border-b border-blue-600 w-5/12">
      <div>
        <div className="flex flex-row items-center gap-3">
          {restaurantId ? (
            <Link
              to={`/restaurant/${restaurantId}`}
              className="font-bold text-black hover:text-blue-600 transition-colors"
            >
              {restaurantName}
            </Link>
          ) : (
            <p className="font-bold text-black">Restaurant</p>
          )}
          <RatingStars rating={review.rating} readOnly={true} />
        </div>

        <p className="text-gray-700 break-words overflow-wrap-anywhere">
          {review.review}
        </p>
      </div>
      <button
        onClick={() => onDelete(review.id)}
        disabled={isDeleting}
        className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-red-700"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
};

export default UserReviewCard;
