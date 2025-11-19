import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import reviewsAPI from "../api/reviewsAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import RatingStars from "./RatingStars";
import useAuthStore from "../stores/authStore";
import { reviewSchema } from "../utils/validators/review.schema";
import Spinner from "./Spinner";
import { showError } from "../utils/errorHandler";

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
      showError("Please select a rating");
      return;
    }
    if (!review.trim()) {
      showError("Please write a review");
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
          required
        />
      </div>
      <div className="flex flex-row gap-2">
        <button
          type="submit"
          disabled={isPending || rating === 0 || !review.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending && <Spinner className="h-4 w-4" />}
          {isPending
            ? isEditMode
              ? "Updating..."
              : "Sending..."
            : isEditMode
            ? "Edit Review"
            : "Send Review"}
        </button>
      </div>
    </form>
  );
};

const ReviewForm = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = user?.id || user?._id;

  const { data: allReviews } = useQuery({
    queryKey: ["reviews", "restaurant", id],
    queryFn: () => reviewsAPI.fetchAllReviewsForRestaurant(id),
    enabled: !!id && !!user,
    refetchOnMount: true,
  });
  const userReview = useMemo(() => {
    if (!allReviews || !user || !userId) return null;
    return allReviews.find((r) => {
      const reviewUserId = r.user?.id || r.user?._id;
      return reviewUserId && reviewUserId.toString() === userId.toString();
    });
  }, [allReviews, user, userId]);

  const existingReviewId = userReview?.id || null;
  const isEditMode = !!existingReviewId;

  const { mutate: createReview, isPending: isCreating } = useMutation({
    mutationFn: (data) => reviewsAPI.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "restaurant", id],
      });
      queryClient.invalidateQueries({ queryKey: ["restaurants", id] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const { mutate: updateReview, isPending: isUpdating } = useMutation({
    mutationFn: ({ reviewId, data }) =>
      reviewsAPI.updateReviewById(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "restaurant", id],
      });
      queryClient.invalidateQueries({ queryKey: ["restaurants", id] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const handleSubmit = ({ rating, review }) => {
    const reviewData = {
      restaurant: id,
      rating,
      review,
    };

    const result = reviewSchema.safeParse(reviewData);

    if (!result.success) {
      const errorMessages = result.error.issues.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      showError(`Validation errors: ${errorMessages.join(", ")}`);
      return;
    }

    if (existingReviewId) {
      updateReview({ reviewId: existingReviewId, data: result.data });
    } else {
      createReview(result.data);
    }
  };

  const isPending = isEditMode ? isUpdating : isCreating;

  return (
    <ReviewFormContent
      key={`${existingReviewId || "new-review"}-${userId || "no-user"}`}
      initialRating={userReview?.rating || 0}
      initialReview={userReview?.review || ""}
      onSubmit={handleSubmit}
      isPending={isPending}
      isEditMode={isEditMode}
    />
  );
};

export default ReviewForm;
