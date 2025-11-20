import React from "react";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";
import Spinner from "./Spinner";
import { formatDate } from "../utils/formatDate";

const UserReviewCard = ({ review, onDelete, isDeleting }) => {
  const restaurantId =
    typeof review.restaurant === "object"
      ? review.restaurant.id || review.restaurant._id
      : review.restaurant;
  const restaurantName =
    typeof review.restaurant === "object"
      ? review.restaurant.name
      : "Restaurant";

  const createdAt =
    review.createdAt || review.created_at
      ? new Date(review.createdAt || review.created_at)
      : null;
  const formattedDate =
    createdAt && !isNaN(createdAt.getTime())
      ? formatDate(createdAt)
      : "Unknown date";

  const updatedAt =
    review.updatedAt || review.updated_at
      ? new Date(review.updatedAt || review.updated_at)
      : null;
  const formattedUpdatedDate =
    updatedAt && !isNaN(updatedAt.getTime()) ? formatDate(updatedAt) : null;

  const recentlyUpdated = updatedAt > createdAt;

  return (
    <div className="flex flex-col gap-2 pb-4 border-b border-blue-600 w-full max-w-2xl">
      <div className="flex flex-row items-center justify-between gap-3">
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
        <button
          onClick={() => onDelete(review.id)}
          disabled={isDeleting}
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
        >
          {isDeleting ? (
            <>
              <Spinner className="h-4 w-4" />
              <span>Deleting...</span>
            </>
          ) : (
            <>
              <span className="text-lg">🗑️</span>
            </>
          )}
        </button>
      </div>

      <p className="text-gray-700 break-words overflow-wrap-anywhere">
        {review.review}
      </p>
      <div className="flex flex-row gap-2 items-center justify-end">
        {(formattedDate || formattedUpdatedDate) && (
          <span className="text-gray-500 text-sm text-end font-bold">
            {recentlyUpdated && formattedUpdatedDate
              ? `Updated on ${formattedUpdatedDate}`
              : `Created on ${formattedDate}`}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserReviewCard;
