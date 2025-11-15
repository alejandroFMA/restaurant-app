import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    select: false,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  favourite_restaurants: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }],
    default: [],
  },
  is_admin: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.email;
    delete ret.__v;
    delete ret.password;
    delete ret.is_admin;
    return ret;
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
