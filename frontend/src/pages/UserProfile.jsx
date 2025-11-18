import React from "react";
import useAuthStore from "../stores/authStore";
import reviewsAPI from "../api/reviewsAPI";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UserReviewCard from "../components/UserReviewCard";

const UserProfile = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery({
    queryKey: ["reviews", "user", userId],
    queryFn: () => reviewsAPI.fetchAllReviewsByUser(userId),
    enabled: !!userId,
  });

  const { mutate: deleteReview, isPending: isDeletingReview } = useMutation({
    mutationFn: (reviewId) => reviewsAPI.deleteReviewById(reviewId),
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["reviews", "user", userId],
        });
      }
    },
    onError: (error) => {
      console.error("Error deleting review:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Error deleting review";
      alert(errorMessage);
    },
  });

  if (reviewsLoading) return <p>Loading...</p>;
  if (reviewsError) return <p>Error: {reviewsError.message}</p>;
  if (!user) return <p>User not found</p>;

  return (
    <>
      <div>
        <h1>User Profile</h1>
        <p>Username: {user.username}</p>
      </div>

      <div>
        <h2>My Favourite Restaurants</h2>
        <div>
          {user.favourite_restaurants &&
          user.favourite_restaurants.length > 0 ? (
            user.favourite_restaurants.map((restaurant) => (
              <p key={restaurant.id}>{restaurant.name}</p>
            ))
          ) : (
            <p>No favourite restaurants yet</p>
          )}
        </div>
      </div>

      <div>
        <h2>My Reviews</h2>
        <div>
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <UserReviewCard
                key={review.id}
                review={review}
                onDelete={deleteReview}
                isDeleting={isDeletingReview}
              />
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfile;
