import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Only one review per user per restaurant
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
