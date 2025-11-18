import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import reviewsAPI from "../api/reviewsAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import RatingStars from "./RatingStars";
import useAuthStore from "../stores/authStore";

const ReviewFormContent = ({
  initialRating,
  initialReview,
  onSubmit,
  isPending,
  isEditMode,
}) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [review, setReview] = useState(initialReview || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    onSubmit({ rating, review });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <RatingStars rating={rating} readOnly={false} onChange={setRating} />
        {rating > 0 && (
          <p className="text-sm text-gray-600 mt-1">{rating} stars</p>
        )}
      </div>

      <div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review here"
          className="w-full p-2 border rounded"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isPending
          ? isEditMode
            ? "Updating..."
            : "Sending..."
          : isEditMode
          ? "Edit Review"
          : "Send Review"}
      </button>
    </form>
  );
};

const ReviewForm = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: allReviews } = useQuery({
    queryKey: ["reviews", "restaurant", id],
    queryFn: () => reviewsAPI.fetchAllReviewsForRestaurant(id),
    enabled: !!id && !!user,
  });
  const userReview = useMemo(() => {
    if (!allReviews || !user) return null;
    return allReviews.find(
      (r) => r.user?.id === user.id || r.user?._id === user.id
    );
  }, [allReviews, user]);

  const existingReviewId = userReview?.id || null;
  const isEditMode = !!existingReviewId;

  const { mutate: createReview, isPending: isCreating } = useMutation({
    mutationFn: (data) => reviewsAPI.createReview(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reviews", "restaurant", id],
      });
      await queryClient.invalidateQueries({ queryKey: ["restaurants", id] });
      await queryClient.refetchQueries({
        queryKey: ["reviews", "restaurant", id],
      });
    },
    onError: (error) => {
      alert(
        error?.response?.data?.message ||
          error.message ||
          "Error creating review"
      );
    },
  });

  const { mutate: updateReview, isPending: isUpdating } = useMutation({
    mutationFn: ({ reviewId, data }) =>
      reviewsAPI.updateReviewById(reviewId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reviews", "restaurant", id],
      });
      await queryClient.invalidateQueries({ queryKey: ["restaurants", id] });
      await queryClient.refetchQueries({
        queryKey: ["reviews", "restaurant", id],
      });
    },
    onError: (error) => {
      alert(
        error?.response?.data?.message ||
          error.message ||
          "Error updating review"
      );
    },
  });

  const handleSubmit = ({ rating, review }) => {
    const reviewData = {
      restaurant: id,
      rating,
      review,
    };

    if (existingReviewId) {
      updateReview({ reviewId: existingReviewId, data: reviewData });
    } else {
      createReview(reviewData);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <ReviewFormContent
      key={existingReviewId || "new-review"}
      initialRating={userReview?.rating || 0}
      initialReview={userReview?.review || ""}
      onSubmit={handleSubmit}
      isPending={isPending}
      isEditMode={isEditMode}
    />
  );
};

export default ReviewForm;
