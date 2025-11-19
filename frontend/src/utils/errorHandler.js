import useErrorStore from "../stores/errorStore";

export const showError = (error) => {
  const errorStore = useErrorStore.getState();
  const errorMessage =
    typeof error === "string"
      ? error
      : error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred";
  errorStore.setError(errorMessage);
};

export const clearError = () => {
  const errorStore = useErrorStore.getState();
  errorStore.clearError();
};
