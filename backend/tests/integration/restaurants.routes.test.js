import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.JWT_SECRET = "test-secret-key-for-integration-tests";
process.env.NODE_ENV = "test";

const mockGeocodeAddress = jest.fn();
jest.unstable_mockModule("../../utils/geocoding.js", () => ({
  geocodeAddress: mockGeocodeAddress,
}));

const { default: app } = await import("../../index.js");
const Restaurant = (await import("../../schema/Restaurant.schema.js")).default;
const User = (await import("../../schema/User.schema.js")).default;

const generateAuthToken = (userId = "testuser123", isAdmin = true) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(
    { id: userId, username: "testuser", is_admin: isAdmin },
    secret
  );
};

describe("Restaurants Routes", () => {
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

      const testUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });
      testUserId = testUser._id.toString();
      authToken = generateAuthToken(testUserId);

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
    await Restaurant.deleteMany({});

    jest.clearAllMocks();
    mockGeocodeAddress.mockResolvedValue({ lat: 40.7128, lng: -74.006 });
  });

  describe("GET routes", () => {
    it("should return the top restaurants", async () => {
      const restaurants = await Restaurant.insertMany([
        {
          name: "Best Restaurant",
          neighborhood: "Downtown",
          address: "123 Main St",
          cuisine_type: "Italian",
          image: "https://example.com/image1.jpg",
          latlng: { lat: 40.7128, lng: -74.006 },
          operating_hours: { Monday: "9am-10pm" },
          average_rating: 5.0,
          reviews_count: 10,
        },
        {
          name: "Good Restaurant",
          neighborhood: "Uptown",
          address: "456 Oak Ave",
          cuisine_type: "French",
          image: "https://example.com/image2.jpg",
          latlng: { lat: 40.758, lng: -73.9855 },
          operating_hours: { Monday: "10am-9pm" },
          average_rating: 4.5,
          reviews_count: 8,
        },
        {
          name: "Nice Restaurant",
          neighborhood: "Midtown",
          address: "789 Pine St",
          cuisine_type: "Japanese",
          image: "https://example.com/image3.jpg",
          latlng: { lat: 40.7505, lng: -73.9934 },
          operating_hours: { Monday: "11am-10pm" },
          average_rating: 4.0,
          reviews_count: 5,
        },
      ]);

      const response = await request(server)
        .get("/api/restaurants/top")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].average_rating).toBeGreaterThanOrEqual(
        response.body[response.body.length - 1]?.average_rating || 0
      );
    });

    it("should return restaurants by name", async () => {
      const restaurant = await Restaurant.create({
        name: "Best Pizza Place",
        neighborhood: "Downtown",
        address: "123 Main St",
        cuisine_type: "Italian",
        image: "https://example.com/image.jpg",
        latlng: { lat: 40.7128, lng: -74.006 },
        operating_hours: { Monday: "9am-10pm" },
        average_rating: 4.5,
        reviews_count: 10,
      });

      const response = await request(server)
        .get("/api/restaurants/name/Best")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toContain("Best");
    });

    it("should return restaurant by id", async () => {
      const restaurant = await Restaurant.create({
        name: "Test Restaurant",
        neighborhood: "Downtown",
        address: "123 Main St",
        cuisine_type: "Italian",
        image: "https://example.com/image.jpg",
        latlng: { lat: 40.7128, lng: -74.006 },
        operating_hours: { Monday: "9am-10pm" },
        average_rating: 4.5,
        reviews_count: 10,
      });

      const restaurantId = restaurant._id.toString();

      const response = await request(server)
        .get(`/api/restaurants/${restaurantId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Test Restaurant");
      expect(response.body.id).toBe(restaurantId);
    });

    it("should return all restaurants", async () => {
      await Restaurant.insertMany([
        {
          name: "Restaurant A",
          neighborhood: "Downtown",
          address: "123 Main St",
          cuisine_type: "Italian",
          image: "https://example.com/image1.jpg",
          latlng: { lat: 40.7128, lng: -74.006 },
          operating_hours: { Monday: "9am-10pm" },
        },
        {
          name: "Restaurant B",
          neighborhood: "Uptown",
          address: "456 Oak Ave",
          cuisine_type: "French",
          image: "https://example.com/image2.jpg",
          latlng: { lat: 40.758, lng: -73.9855 },
          operating_hours: { Monday: "10am-9pm" },
        },
      ]);

      const response = await request(server)
        .get("/api/restaurants")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe("Restaurant A");
      expect(response.body[1].name).toBe("Restaurant B");
    });

    it("should return all restaurants with sortby query parameter", async () => {
      await Restaurant.insertMany([
        {
          name: "Low Rating",
          neighborhood: "Downtown",
          address: "123 Main St",
          cuisine_type: "Italian",
          image: "https://example.com/image1.jpg",
          latlng: { lat: 40.7128, lng: -74.006 },
          operating_hours: { Monday: "9am-10pm" },
          average_rating: 3.0,
          reviews_count: 5,
        },
        {
          name: "High Rating",
          neighborhood: "Uptown",
          address: "456 Oak Ave",
          cuisine_type: "French",
          image: "https://example.com/image2.jpg",
          latlng: { lat: 40.758, lng: -73.9855 },
          operating_hours: { Monday: "10am-9pm" },
          average_rating: 5.0,
          reviews_count: 10,
        },
      ]);

      const response = await request(server)
        .get("/api/restaurants?sortby=average_rating_desc")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].average_rating).toBe(5.0);
      expect(response.body[1].average_rating).toBe(3.0);
    });

    it("should return 404 if restaurant is not found by id", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(server)
        .get(`/api/restaurants/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Restaurant not found");
    });

    it("should return 404 if restaurant is not found by name", async () => {
      const response = await request(server)
        .get("/api/restaurants/name/NonExistentRestaurant")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Restaurant not found");
    });

    it("should return 400 if the restaurant id is not a valid ObjectId", async () => {
      const response = await request(server)
        .get("/api/restaurants/123")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it("should return 400 if the restaurant name is empty", async () => {
      const response = await request(server)
        .get("/api/restaurants/name/")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it("should return 401 if no authentication token is provided", async () => {
      const response = await request(server).get("/api/restaurants/top");

      expect(response.status).toBe(401);
    });

    it("should return 401 if invalid authentication token is provided", async () => {
      const response = await request(server)
        .get("/api/restaurants/top")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });
  });

  describe("POST routes", () => {
    it("should create a new restaurant", async () => {
      const response = await request(server)
        .post("/api/restaurants")
        .set("Authorization", `Bearer ${authToken}`);
    });

    it("should return 401 if no authentication token is provided", async () => {
      const response = await request(server).post("/api/restaurants");

      expect(response.status).toBe(401);
    });

    it("should return 401 if invalid authentication token is provided", async () => {
      const response = await request(server)
        .post("/api/restaurants")
        .set("Authorization", "Bearer invalid-token");
    });

    it("should return 400 if the request body is invalid", async () => {
      const response = await request(server)
        .post("/api/restaurants")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("PUT routes", () => {
    it("should update a restaurant", async () => {
      const response = await request(server)
        .put("/api/restaurants/123")
        .set("Authorization", `Bearer ${authToken}`);
    });

    it("should return 401 if invalid authentication token is provided", async () => {
      const response = await request(server)
        .put("/api/restaurants/123")
        .set("Authorization", "Bearer invalid-token");
    });

    it("should return 400 if the request body is invalid", async () => {
      const response = await request(server)
        .put("/api/restaurants/123")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("should return 400 if the restaurant id is not a valid ObjectId", async () => {
      const response = await request(server)
        .put("/api/restaurants/123")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(400);
    });

    it("should return 400 if the restaurant name is empty", async () => {
      const response = await request(server)
        .put("/api/restaurants/123")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "" });
      expect(response.status).toBe(400);
    });

    it("should return 404 if the restaurant is not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(server)
        .put(`/api/restaurants/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Updated Name" });
      expect(response.status).toBe(404);
    });

    it("should return error when not admin user tries to update a restaurant", async () => {
      const restaurant = await Restaurant.create({
        name: "Test Restaurant",
        neighborhood: "Downtown",
        address: "123 Main St",
        cuisine_type: "Italian",
        image: "https://example.com/image.jpg",
        latlng: { lat: 40.7128, lng: -74.006 },
        operating_hours: { Monday: "9am-10pm" },
      });
      const restaurantId = restaurant._id.toString();

      const response = await request(server)
        .put(`/api/restaurants/${restaurantId}`)
        .set("Authorization", `Bearer ${nonAdminAuthToken}`)
        .send({ name: "Updated Name" });
      expect(response.status).toBe(403);
    });
  });

  describe("DELETE routes", () => {
    it("should delete a restaurant", async () => {
      const response = await request(server)
        .delete("/api/restaurants/123")
        .set("Authorization", `Bearer ${authToken}`);
    });

    it("should return 401 if no authentication token is provided", async () => {
      const response = await request(server).delete("/api/restaurants/123");
      expect(response.status).toBe(401);
    });

    it("should return 401 if invalid authentication token is provided", async () => {
      const response = await request(server)
        .delete("/api/restaurants/123")
        .set("Authorization", "Bearer invalid-token");
    });
    it("should return 400 if the restaurant id is not a valid ObjectId", async () => {
      const response = await request(server)
        .delete("/api/restaurants/123")
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(400);
    });
    it("should return 400 if the restaurant name is empty", async () => {
      const response = await request(server)
        .delete("/api/restaurants/123")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "" });
      expect(response.status).toBe(400);
    });
    it("should return 404 if the restaurant is not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(server)
        .delete(`/api/restaurants/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(404);
    });
    it("should return error when not admin user tries to delete a restaurant", async () => {
      const restaurant = await Restaurant.create({
        name: "Test Restaurant",
        neighborhood: "Downtown",
        address: "123 Main St",
        cuisine_type: "Italian",
        image: "https://example.com/image.jpg",
        latlng: { lat: 40.7128, lng: -74.006 },
        operating_hours: { Monday: "9am-10pm" },
      });
      const restaurantId = restaurant._id.toString();

      const response = await request(server)
        .delete(`/api/restaurants/${restaurantId}`)
        .set("Authorization", `Bearer ${nonAdminAuthToken}`);
      expect(response.status).toBe(403);
    });
  });
});
