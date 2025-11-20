import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const { default: app } = await import("../../index.js");
const Review = (await import("../../schema/Review.schema.js")).default;
const User = (await import("../../schema/User.schema.js")).default;
const Restaurant = (await import("../../schema/Restaurant.schema.js")).default;

const generateAuthToken = (userId = "testuser123", isAdmin = true) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(
    { id: userId, username: "testuser", is_admin: isAdmin },
    secret
  );
};

const createTestRestaurant = async () => {
  return await Restaurant.create({
    name: "Test Restaurant",
    address: "123 Main St",
    latlng: { lat: 40.7128, lng: -74.006 },
    operating_hours: { Monday: "9am-10pm" },
    cuisine_type: "Italian",
    neighborhood: "Downtown",
    image: "https://example.com/image.jpg",
    photograph: "test.jpg",
    reviews_count: 0,
    average_rating: 0,
    created_at: new Date(),
  });
};

describe("Review Routes", () => {
  let server;
  let authToken;
  let nonAdminAuthToken;
  let testUserId;
  let nonAdminUserId;
  let mongoServer;
  let isConnected = false;

  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      await mongoose.connect(mongoUri);
      isConnected = mongoose.connection.readyState === 1;

      if (!isConnected) {
        throw new Error("MongoDB Memory Server connection failed");
      }

      await Restaurant.deleteMany({});
      await User.deleteMany({});
      await Review.deleteMany({});

      const testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });
      testUserId = testUser._id.toString();
      authToken = generateAuthToken(testUserId, true);

      const nonAdminUser = await User.create({
        username: "regularuser",
        email: "regular@example.com",
        password: "hashedpassword123!",
        first_name: "Regular",
        last_name: "User",
        is_admin: false,
      });
      nonAdminUserId = nonAdminUser._id.toString();
      nonAdminAuthToken = generateAuthToken(nonAdminUserId, false);

      server = app.listen(0);
    } catch (error) {
      console.error("Error setting up test database:", error.message);
      throw error;
    }
  }, 60000);

  afterAll(async () => {
    try {
      if (server) {
        server.close();
      }

      if (isConnected) {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
      }

      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (error) {
      console.error("Error cleaning up:", error.message);
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
        }
        if (mongoServer) {
          await mongoServer.stop();
        }
      } catch (closeError) {}
    }
  }, 30000);

  beforeEach(async () => {
    await Review.deleteMany({});
    await User.deleteMany({});
    await Restaurant.deleteMany({});
  });

  describe("GET routes", () => {
    it("should return all reviews", async () => {
      const restaurant = await createTestRestaurant();
      // Create reviews from different users (index unique constraint: user + restaurant)
      const reviews = await Review.insertMany([
        {
          user: new mongoose.Types.ObjectId(testUserId),
          restaurant: restaurant._id,
          rating: 5,
          review: "Great food and service!",
        },
        {
          user: new mongoose.Types.ObjectId(nonAdminUserId),
          restaurant: restaurant._id,
          rating: 4,
          review: "Good food and service!",
        },
      ]);
      const response = await request(server)
        .get(`/api/reviews/restaurant/${restaurant._id.toString()}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(2);
      // Check that both reviews are present (order may vary)
      const ratings = response.body.map((r) => r.rating).sort();
      expect(ratings).toEqual([4, 5]);
    });

    it("should return reviews for a specific restaurant", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        user: new mongoose.Types.ObjectId(testUserId),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const response = await request(server)
        .get(`/api/reviews/restaurant/${restaurant._id.toString()}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(1);
      expect(response.body[0].rating).toBe(5);
      expect(response.body[0].review).toBe("Great food and service!");
    });
  });

  describe("POST routes", () => {
    it("should create a new review", async () => {
      const restaurant = await createTestRestaurant();
      const response = await request(server)
        .post(`/api/reviews`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          restaurant: restaurant._id.toString(),
          rating: 5,
          review: "Great food and service!",
        });
      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.rating).toBe(5);
      expect(response.body.review).toBe("Great food and service!");
    });

    it("should change the average rating of the restaurant and reviews count", async () => {
      const restaurant = await Restaurant.create({
        name: "Test Restaurant",
        address: "123 Main St",
        latlng: { lat: 40.7128, lng: -74.006 },
        operating_hours: { Monday: "9am-10pm" },
        cuisine_type: "Italian",
        neighborhood: "Downtown",
        image: "https://example.com/image.jpg",
        photograph: "test.jpg",
        reviews_count: 0,
        average_rating: 0,
        created_at: new Date(),
      });
      const response = await request(server)
        .post(`/api/reviews`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          restaurant: restaurant._id.toString(),
          rating: 5,
          review: "Great food and service!",
        });
      expect(response.status).toBe(201);
      expect(response.body).toBeDefined();
      expect(response.body.rating).toBe(5);
      expect(response.body.review).toBe("Great food and service!");
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant.average_rating).toBe(5);
      expect(updatedRestaurant.reviews_count).toBe(1);
    });

    it("should return 400 if the request body is invalid", async () => {
      const response = await request(server)
        .post(`/api/reviews`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("should return 400 if the restaurant id is not a valid ObjectId", async () => {
      const response = await request(server)
        .post(`/api/reviews`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          restaurant: "invalid-id",
          rating: 5,
          review: "Great food and service!",
        });
      expect(response.status).toBe(400);
    });

    it("should return 400 if the rating is not a number", async () => {
      const restaurant = await createTestRestaurant();
      const response = await request(server)
        .post(`/api/reviews`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          restaurant: restaurant._id.toString(),
          rating: "invalid-rating",
          review: "Great food and service!",
        });
      expect(response.status).toBe(400);
    });
  });

  describe("PUT routes", () => {
    it("should update a review", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        user: new mongoose.Types.ObjectId(testUserId),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const response = await request(server)
        .put(`/api/reviews/${review._id.toString()}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 4,
          review: "Good food and service!",
        });
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.rating).toBe(4);
      expect(response.body.review).toBe("Good food and service!");
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant.average_rating).toBe(4);
      expect(updatedRestaurant.reviews_count).toBe(1);
    });
    it("should return 400 if the review id is not a valid ObjectId", async () => {
      const response = await request(server)
        .put(`/api/reviews/invalid-id`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          rating: 4,
          review: "Good food and service!",
        });
      expect(response.status).toBe(400);
    });
    it("should return 400 if the request body is invalid", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        user: new mongoose.Types.ObjectId(testUserId),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const response = await request(server)
        .put(`/api/reviews/${review._id.toString()}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("should only update the review if the user is the owner of the review", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        user: new mongoose.Types.ObjectId(testUserId),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const response = await request(server)
        .put(`/api/reviews/${review._id.toString()}`)
        .set("Authorization", `Bearer ${nonAdminAuthToken}`)
        .send({
          rating: 4,
          review: "Good food and service!",
        });
      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Unauthorized: You can only modify your own resources"
      );
    });

    it("should return 403 if the user is not an admin", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        user: new mongoose.Types.ObjectId(),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const response = await request(server)
        .put(`/api/reviews/${review._id.toString()}`)
        .set("Authorization", `Bearer ${nonAdminAuthToken}`)
        .send({
          rating: 4,
          review: "Good food and service!",
        });
      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Unauthorized: You can only modify your own resources"
      );
    });
  });

  describe("DELETE routes", () => {
    it("should delete a review", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        user: new mongoose.Types.ObjectId(testUserId),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const response = await request(server)
        .delete(`/api/reviews/${review._id.toString()}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Review deleted successfully");
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant.average_rating).toBe(0);
      expect(updatedRestaurant.reviews_count).toBe(0);
    });
    it("should change the average rating of the restaurant and reviews count", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        user: new mongoose.Types.ObjectId(testUserId),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const response = await request(server)
        .delete(`/api/reviews/${review._id.toString()}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.message).toBe("Review deleted successfully");
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant.average_rating).toBe(0);
      expect(updatedRestaurant.reviews_count).toBe(0);
    });
    it("should return 404 if the review id is not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(server)
        .delete(`/api/reviews/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
    it("should return 400 if the review id is not a valid ObjectId", async () => {
      const response = await request(server)
        .delete(`/api/reviews/invalid-id`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(400);
    });
    it("should return 401 if no authentication token is provided", async () => {
      const response = await request(server).delete(`/api/reviews/123`);
      expect(response.status).toBe(401);
    });
    it("should return 401 if invalid authentication token is provided", async () => {
      const response = await request(server)
        .delete(`/api/reviews/123`)
        .set("Authorization", "Bearer invalid-token");
      expect(response.status).toBe(401);
    });
    it("should return 403 if the user is not the owner of the review", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        _id: new mongoose.Types.ObjectId(),
        user: new mongoose.Types.ObjectId(),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const nonAdminUserId = new mongoose.Types.ObjectId();
      const nonAdminAuthToken = generateAuthToken(nonAdminUserId, false);
      const response = await request(server)
        .delete(`/api/reviews/${review._id.toString()}`)
        .set("Authorization", `Bearer ${nonAdminAuthToken}`);
      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Unauthorized: You can only modify your own resources"
      );
    });
    it("should return 403 if the user is not an admin", async () => {
      const restaurant = await createTestRestaurant();
      const review = await Review.create({
        user: new mongoose.Types.ObjectId(),
        restaurant: restaurant._id,
        rating: 5,
        review: "Great food and service!",
      });
      const response = await request(server)
        .delete(`/api/reviews/${review._id.toString()}`)
        .set("Authorization", `Bearer ${nonAdminAuthToken}`);
      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Unauthorized: You can only modify your own resources"
      );
    });
  });
});
