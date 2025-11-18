import React from "react";
import RatingStars from "./RatingStars";

const ReviewCard = ({ review }) => {
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
    </div>
  );
};

export default ReviewCard;
