import { useState, useMemo } from "react";
import { Rating, ThinRoundedStar } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

const RatingStars = ({
  rating = 0,
  readOnly = true,
  onChange,
  initialValue = 0,
}) => {
  const [ratingValue, setRatingValue] = useState(initialValue || rating);

  const handleChange = (value) => {
    setRatingValue(value);
    if (onChange) onChange(value);
  };

  const itemStyles = useMemo(
    () => ({
      itemShapes: ThinRoundedStar,
      activeFillColor: "#2563eb ",
      activeStrokeColor: "#1d4ed8",
      inactiveFillColor: "#e5e7eb",
      inactiveStrokeColor: "#d1d5db",
    }),
    []
  );

  return (
    <Rating
      value={ratingValue}
      readOnly={readOnly}
      precision={0.5}
      onChange={readOnly ? undefined : handleChange}
      itemStyles={itemStyles}
      style={{ maxWidth: 140 }}
    />
  );
};

export default RatingStars;
