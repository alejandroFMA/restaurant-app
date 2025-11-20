export const formatDate = (date) => {
  return date.toLocaleDateString("en-UK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
