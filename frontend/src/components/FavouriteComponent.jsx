import React from "react";
import useAuthStore from "../stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import usersAPI from "../api/usersAPI";
import Spinner from "./Spinner";
import { showError } from "../utils/errorHandler";

const FavouriteComponent = ({ restaurantId, userProfile = false }) => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    mutate: addRestaurantToFavourites,
    isPending: isAddingRestaurantToFavourites,
  } = useMutation({
    mutationFn: () => usersAPI.addRestaurantToFavourites(restaurantId),
    onSuccess: (data) => {
      if (data.user) {
        updateUser({ favourite_restaurants: data.user.favourite_restaurants });
      }
      queryClient.invalidateQueries({
        queryKey: ["favouriteRestaurants"],
      });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const {
    mutate: removeRestaurantFromFavourites,
    isPending: isRemovingRestaurantFromFavourites,
  } = useMutation({
    mutationFn: () => usersAPI.removeRestaurantFromFavourites(restaurantId),
    onSuccess: (data) => {
      if (data.user) {
        updateUser({ favourite_restaurants: data.user.favourite_restaurants });
      }
      queryClient.invalidateQueries({
        queryKey: ["favouriteRestaurants"],
      });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const isAlreadyInFavourites = user?.favourite_restaurants?.some((fav) => {
    const favId = typeof fav === "string" ? fav : fav?.id || fav?._id;
    return favId === restaurantId || favId?.toString() === restaurantId;
  });
  const buttonText = isAlreadyInFavourites
    ? userProfile
      ? ""
      : "Remove from Favourites"
    : "Add to Favourites";
  const buttonIcon = isAlreadyInFavourites ? "❌" : "⭐";
  const isPending =
    isAddingRestaurantToFavourites || isRemovingRestaurantFromFavourites;

  const containerBgColor = isAlreadyInFavourites
    ? "bg-red-300 hover:bg-red-400"
    : "bg-blue-500 hover:bg-blue-600";

  const handleClick = () => {
    if (!restaurantId) {
      showError("Restaurant ID is missing");
      return;
    }

    if (isAlreadyInFavourites) {
      removeRestaurantFromFavourites();
    } else {
      addRestaurantToFavourites();
    }
  };

  const buttonPadding = userProfile ? "px-3 py-1.5" : "px-4 py-2";
  const buttonRounded = userProfile ? "rounded" : "rounded-lg";

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 ${buttonRounded} ${buttonPadding} text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${containerBgColor}`}
    >
      {isPending && <Spinner className="h-4 w-4" />}
      <span className="text-lg">{buttonIcon}</span>
      {!userProfile && <span>{buttonText}</span>}
    </button>
  );
};
export default FavouriteComponent;
