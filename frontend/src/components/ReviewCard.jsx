import React from "react";
import RatingStars from "./RatingStars";
import { formatDate } from "../utils/formatDate";

const ReviewCard = ({ review }) => {
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
    <div className="flex flex-col gap-2 pb-4 border-b border-blue-600 w-4/6">
      <div className="flex flex-row items-center gap-3">
        <p className="font-bold text-black">
          {review.user?.username || "Anonymous"}
        </p>
        <RatingStars rating={review.rating} readOnly={true} />
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

export default ReviewCard;
