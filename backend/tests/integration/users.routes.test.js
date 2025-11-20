import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const { default: app } = await import("../../index.js");
const User = (await import("../../schema/User.schema.js")).default;
const Restaurant = (await import("../../schema/Restaurant.schema.js")).default;

const generateAuthToken = (userId = "testuser123", isAdmin = true) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(
    { id: userId, username: "testuser", is_admin: isAdmin },
    secret
  );
};

describe("Users Routes", () => {
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
    await User.deleteMany({});

    jest.clearAllMocks();
  });

  describe("GET routes", () => {
    it("should return all users", async () => {
      const users = await User.insertMany([
        {
          username: "testuser",
          email: "test@example.com",
          password: "hashedpassword123!",
          first_name: "Test",
          last_name: "User",
          is_admin: true,
        },
        {
          username: "regularuser",
          email: "regular@example.com",
          password: "hashedpassword123!",
          first_name: "Regular",
          last_name: "User",
          is_admin: false,
        },
      ]);

      const response = await request(server)
        .get("/api/users")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].username).toBe("testuser");
      expect(response.body[1].username).toBe("regularuser");
    });

    it("should return user by id", async () => {
      const user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });
      const userId = user._id.toString();

      const response = await request(server)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.id || response.body._id).toBe(userId);
      expect(response.body.username).toBe("testuser");
    });

    it("should return user by email", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });

      const userId = user._id.toString();

      const response = await request(server)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe("testuser");
    });

    it("should return user by username with no email", async () => {
      const user = await User.create({
        username: "testuser2",
        email: "test2@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: false,
      });

      const response = await request(server)
        .get("/api/users/username/testuser2")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.username).toBe("testuser2");
      expect(response.body.email).toBeUndefined();
    });

    it("should return favourite restaurants", async () => {
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

      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
        favourite_restaurants: [restaurant._id],
      });
      const userId = user._id.toString();
      const response = await request(server)
        .get(`/api/users/${userId}/favourites`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe("Test Restaurant");
      expect(response.body[0].id).toBe(restaurant._id.toString());
    });

    it("should login successfully", async () => {
      const { hashPassword } = await import("../../utils/encryptPassword.js");
      const hashedPassword = await hashPassword("password123!");

      const user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });
      const userId = user._id.toString();
      const response = await request(server)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123!" });
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.id || response.body.user._id).toBe(userId);
    });

    it("should return 401 if invalid credentials", async () => {
      const { hashPassword } = await import("../../utils/encryptPassword.js");
      const hashedPassword = await hashPassword("password123!");

      const user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });
      const response = await request(server)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });

    it("should return 404 if user is not found by id", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(server)
        .get(`/api/users/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should return 404 if user is not found by email", async () => {
      const response = await request(server)
        .get("/api/users/email/nonexistent@example.com")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should return 400 if the user id is not a valid ObjectId", async () => {
      const response = await request(server)
        .get("/api/users/123")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it("should return 400 if the user email is empty", async () => {
      const response = await request(server)
        .get("/api/users/email/")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it("should return 401 if no authentication token is provided", async () => {
      const response = await request(server).get("/api/users");

      expect(response.status).toBe(401);
    });

    it("should return 401 if invalid authentication token is provided", async () => {
      const response = await request(server)
        .get("/api/users")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should only admin users can access to get user by email", async () => {
      const response = await request(server)
        .get("/api/users/email/test@example.com")
        .set("Authorization", `Bearer ${nonAdminAuthToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST routes", () => {
    it("should create a new user", async () => {
      const response = await request(server).post("/api/auth/register").send({
        username: "newuser",
        email: "newuser@example.com",
        password: "SecurePass123!",
        first_name: "New",
        last_name: "User",
      });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.user.username).toBe("newuser");
    });
    it("should return 400 if the request body is invalid", async () => {
      const response = await request(server)
        .post("/api/auth/register")
        .send({});

      expect(response.status).toBe(400);
    });

    it("should return 400 if the username is already taken", async () => {
      await User.create({
        username: "existinguser",
        email: "existing@example.com",
        password: "hashedpassword123!",
        first_name: "Existing",
        last_name: "User",
      });
      const response = await request(server).post("/api/auth/register").send({
        username: "existinguser",
        email: "new@example.com",
        password: "SecurePass123!",
        first_name: "New",
        last_name: "User",
      });
      expect(response.status).toBe(409);
    });

    it("shoud add a restaurant to favourites", async () => {
      const restaurant = await Restaurant.create({
        _id: new mongoose.Types.ObjectId(),
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
      const user = await User.create({
        _id: new mongoose.Types.ObjectId(),
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
        favourite_restaurants: [],
      });
      const userToken = generateAuthToken(user._id.toString(), true);
      const response = await request(server)
        .post(`/api/users/favourites`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ restaurantId: restaurant._id.toString() });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Restaurant added to favourites successfully"
      );
      expect(response.body.user.favourite_restaurants.length).toBe(1);
      const favouriteId =
        response.body.user.favourite_restaurants[0].toString();
      expect(favouriteId).toBe(restaurant._id.toString());
    });

    it("shouls be able to remove a restaurant from favourites", async () => {
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
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
        favourite_restaurants: [restaurant._id],
      });
      const userToken = generateAuthToken(user._id.toString(), true);
      const response = await request(server)
        .delete(`/api/users/favourites`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ restaurantId: restaurant._id.toString() });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Restaurant removed from favourites successfully"
      );
      expect(response.body.user.favourite_restaurants.length).toBe(0);
    });

    it("should return 400 if the email is already taken", async () => {
      await User.create({
        username: "anotheruser",
        email: "existing@example.com",
        password: "hashedpassword123!",
        first_name: "Another",
        last_name: "User",
      });

      const response = await request(server).post("/api/auth/register").send({
        username: "newuser2",
        email: "existing@example.com",
        password: "SecurePass123!",
        first_name: "New",
        last_name: "User",
      });
      expect(response.status).toBe(409);
    });

    it("should return 400 if the password is not strong enough", async () => {
      const response = await request(server).post("/api/auth/register").send({
        username: "weakuser",
        email: "weak@example.com",
        password: "weak",
        first_name: "Weak",
        last_name: "User",
      });
      expect(response.status).toBe(400);
    });

    it("should return 400 if the first name is empty", async () => {
      const response = await request(server).post("/api/auth/register").send({
        username: "nofirstname",
        email: "nofirst@example.com",
        password: "SecurePass123!",
        first_name: "",
        last_name: "User",
      });
      expect(response.status).toBe(400);
    });

    it("should return 400 if the last name is empty", async () => {
      const response = await request(server).post("/api/auth/register").send({
        username: "nolastname",
        email: "nolast@example.com",
        password: "SecurePass123!",
        first_name: "First",
        last_name: "",
      });
      expect(response.status).toBe(400);
    });

    it("should return 400 if the email is not valid", async () => {
      const response = await request(server).post("/api/auth/register").send({
        username: "invalidemail",
        email: "invalid-email",
        password: "SecurePass123!",
        first_name: "First",
        last_name: "User",
      });
      expect(response.status).toBe(400);
    });
  });

  describe("PUT routes", () => {
    it("should update a user", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });

      const updateData = {
        first_name: "Jane",
        last_name: "Smith",
        username: "newusername",
      };
      const userId = user._id.toString();
      const response = await request(server)
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.first_name).toBe("Jane");
      expect(response.body.last_name).toBe("Smith");
      expect(response.body.username).toBe("newusername");
    });
    it("should return 404 if the user is not found", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(server)
        .put(`/api/users/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ first_name: "Test" });
      expect(response.status).toBe(404);
    });
    it("should return error when not admin user tries to update a user", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });
      const userId = user._id.toString();
      const updateData = {
        first_name: "Jane",
        last_name: "Smith",
        username: "newusername",
      };
      const response = await request(server)
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${nonAdminAuthToken}`)
        .send(updateData);
      expect(response.status).toBe(403);
    });
  });

  describe("DELETE routes", () => {
    it("should delete a user", async () => {
      const user = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword123!",
        first_name: "Test",
        last_name: "User",
        is_admin: true,
      });
      const userId = user._id.toString();
      const response = await request(server)
        .delete(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User deleted successfully");
    });
  });
  it("should return 401 if no authentication token is provided", async () => {
    const response = await request(server).delete("/api/users/123");
    expect(response.status).toBe(401);
  });
  it("should return 401 if invalid authentication token is provided", async () => {
    const response = await request(server)
      .delete("/api/users/123")
      .set("Authorization", "Bearer invalid-token");
  });

  it("should return error when not admin user tries to delete a user", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "hashedpassword123!",
      first_name: "Test",
      last_name: "User",
      is_admin: true,
    });
    const userId = user._id.toString();
    const response = await request(server)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${nonAdminAuthToken}`);
    expect(response.status).toBe(403);
  });
});
