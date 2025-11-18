import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  neighborhood: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  latlng: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  photograph: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: true,
  },
  cuisine_type: {
    type: String,
    required: true,
  },
  operating_hours: {
    type: Object,
    required: true,
  },
  average_rating: {
    type: Number,
    default: 0,
  },
  reviews_count: {
    type: Number,
    default: 0,
  },
  created_at: { type: Date, default: Date.now },
});

RestaurantSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

export default Restaurant;
