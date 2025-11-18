import React, { useState } from "react";
import useAuthStore from "../stores/authStore";
import reviewsAPI from "../api/reviewsAPI";
import usersAPI from "../api/usersAPI";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UserReviewCard from "../components/UserReviewCard";
import UserRestaurantCard from "../components/UserRestaurantCard";
import FavouriteComponent from "../components/FavouriteComponent";
import UserDataCard from "../components/UserDataCard";
import EditUserModal from "../components/EditUserModal";
import UserDataCardSkeleton from "../components/UserDataSkeleton";
import ListItemSkeleton from "../components/ListItemSkeleton";

const UserProfile = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = currentUser?.id || currentUser?._id;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: userData,
    isLoading: userDataLoading,
    error: userDataError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersAPI.fetchUserById(userId),
    enabled: !!userId,
  });

  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery({
    queryKey: ["reviews", "user", userId],
    queryFn: () => reviewsAPI.fetchAllReviewsByUser(userId),
    enabled: !!userId,
  });

  const {
    data: favouriteRestaurants,
    isLoading: favouritesLoading,
    error: favouritesError,
  } = useQuery({
    queryKey: ["favouriteRestaurants", userId],
    queryFn: () => usersAPI.fetchFavouriteRestaurants(userId),
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
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
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

  if (reviewsLoading || favouritesLoading || userDataLoading)
    return <UserDataCardSkeleton />;
  if (reviewsError) return <p>Error: {reviewsError.message}</p>;
  if (favouritesError) return <p>Error: {favouritesError.message}</p>;
  if (userDataError) return <UserDataCardSkeleton />;
  if (!currentUser) return <UserDataCardSkeleton />;

  const displayUser = userData || currentUser;

  return (
    <>
      <div className="flex flex-col items-center my-8">
        <UserDataCard
          user={displayUser}
          onEdit={() => setIsEditModalOpen(true)}
        />
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={displayUser}
      />

      <div className="flex flex-row gap-10 align-center justify-around">
        <div className="flex flex-col items-center space-y-2 my-8">
          <h2 className="text-2xl font-bold">My Favs</h2>
          <div className="flex flex-col items-center space-y-2">
            {favouritesLoading && (
              <div className="flex flex-col items-center space-y-2">
                {[...Array(6)].map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            )}
            {favouriteRestaurants && favouriteRestaurants.length > 0 ? (
              favouriteRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id || restaurant._id}
                  className="flex flex-row items-center justify-between p-2 border-b border-gray-200 w-full max-w-2xl"
                >
                  <UserRestaurantCard restaurant={restaurant} />
                  <FavouriteComponent
                    restaurantId={restaurant.id || restaurant._id}
                    userProfile={true}
                  />
                </div>
              ))
            ) : (
              <p>No favourite restaurants yet</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center space-y-2 my-8">
          <h2 className="text-2xl font-bold">My Reviews</h2>
          <div className="flex flex-col items-center space-y-2">
            {reviewsLoading && (
              <div className="flex flex-col items-center space-y-2">
                {[...Array(6)].map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            )}
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
      </div>
    </>
  );
};

export default UserProfile;
