import { jest } from "@jest/globals";

const mockFetchUserById = jest.fn();
const mockFetchAllUsers = jest.fn();
const mockFetchUserByEmail = jest.fn();
const mockFetchUserByUsername = jest.fn();
const mockUpdateUserById = jest.fn();
const mockDeleteUserById = jest.fn();
const mockFetchFavouriteRestaurants = jest.fn();
const mockAddRestaurantToFavouritesRepository = jest.fn();
const mockRemoveRestaurantFromFavouritesRepository = jest.fn();
const mockFetchRestaurantById = jest.fn();
const mockUserFindById = jest.fn();

jest.unstable_mockModule("../../../repository/users.repository.js", () => ({
  fetchUserById: mockFetchUserById,
  fetchAllUsers: mockFetchAllUsers,
  fetchUserByEmail: mockFetchUserByEmail,
  fetchUserByUsername: mockFetchUserByUsername,
  updateUserById: mockUpdateUserById,
  deleteUserById: mockDeleteUserById,
  fetchFavouriteRestaurants: mockFetchFavouriteRestaurants,
  addRestaurantToFavouritesRepository: mockAddRestaurantToFavouritesRepository,
  removeRestaurantFromFavouritesRepository:
    mockRemoveRestaurantFromFavouritesRepository,
}));

jest.unstable_mockModule(
  "../../../repository/restaurants.repository.js",
  () => ({
    fetchRestaurantById: mockFetchRestaurantById,
  })
);

jest.unstable_mockModule("../../../schema/User.schema.js", () => ({
  default: {
    findById: mockUserFindById,
  },
}));

const {
  getUserById,
  getAllUsers,
  getUserByEmail,
  getUserByUsername,
  updateUser,
  deleteUser,
  getFavouriteRestaurants,
} = await import("../../../controllers/users.controller.js");

describe("Users Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      user: { id: "user123", is_admin: false },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user when ID is valid (own profile)", async () => {
      const mockUser = {
        _id: "user123",
        id: "user123",
        username: "testuser",
        email: "user@example.com",
        first_name: "John",
        last_name: "Doe",
        toObject: jest.fn(() => ({
          _id: "user123",
          id: "user123",
          username: "testuser",
          first_name: "John",
          last_name: "Doe",
        })),
      };
      req.params.id = "user123";
      req.user.id = "user123";
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockUser),
      };
      mockUserFindById.mockReturnValue(mockQuery);

      await getUserById(req, res, next);

      expect(mockUserFindById).toHaveBeenCalledWith("user123");
      expect(mockQuery.select).toHaveBeenCalledWith("+email");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should return user when ID is valid (other user)", async () => {
      const mockUser = {
        _id: "user456",
        id: "user456",
        username: "otheruser",
        email: "other@example.com",
        first_name: "Jane",
        last_name: "Smith",
      };
      req.params.id = "user456";
      req.user.id = "user123";
      mockFetchUserById.mockResolvedValue(mockUser);

      await getUserById(req, res, next);

      expect(mockFetchUserById).toHaveBeenCalledWith("user456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if user does not exist", async () => {
      req.params.id = "nonexistentuser";
      mockFetchUserById.mockResolvedValue(null);

      await getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors (own profile)", async () => {
      req.params.id = "user123";
      req.user.id = "user123";
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest
          .fn()
          .mockRejectedValue(new Error("Database connection failed")),
      };
      mockUserFindById.mockReturnValue(mockQuery);

      await getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors (other user)", async () => {
      req.params.id = "user456";
      req.user.id = "user123";
      mockFetchUserById.mockRejectedValue(
        new Error("Database connection failed")
      );

      await getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getAllUsers", () => {
    it("should return array of users", async () => {
      const mockUsers = [
        { _id: "user1", id: "user1", username: "user1" },
        { _id: "user2", id: "user2", username: "user2" },
      ];
      mockFetchAllUsers.mockResolvedValue(mockUsers);

      await getAllUsers(req, res, next);

      expect(mockFetchAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return empty array if no users exist", async () => {
      mockFetchAllUsers.mockResolvedValue([]);

      await getAllUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith([]);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockFetchAllUsers.mockRejectedValue(new Error("Database error"));

      await getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when email exists", async () => {
      const mockUser = {
        _id: "user123",
        id: "user123",
        username: "testuser",
        email: "user@example.com",
      };
      req.params.email = "user@example.com";
      mockFetchUserByEmail.mockResolvedValue(mockUser);

      await getUserByEmail(req, res, next);

      expect(mockFetchUserByEmail).toHaveBeenCalledWith("user@example.com");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if email does not exist", async () => {
      req.params.email = "nonexistent@example.com";
      mockFetchUserByEmail.mockResolvedValue(null);

      await getUserByEmail(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.email = "user@example.com";
      mockFetchUserByEmail.mockRejectedValue(new Error("Database error"));

      await getUserByEmail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getUserByUsername", () => {
    it("should return user when username exists", async () => {
      const mockUser = {
        _id: "user123",
        id: "user123",
        username: "testuser",
        email: "user@example.com",
      };
      req.params.username = "testuser";
      mockFetchUserByUsername.mockResolvedValue(mockUser);

      await getUserByUsername(req, res, next);

      expect(mockFetchUserByUsername).toHaveBeenCalledWith("testuser");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if username does not exist", async () => {
      req.params.username = "nonexistentuser";
      mockFetchUserByUsername.mockResolvedValue(null);

      await getUserByUsername(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.username = "testuser";
      mockFetchUserByUsername.mockRejectedValue(new Error("Database error"));

      await getUserByUsername(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update only whitelisted fields", async () => {
      const updateData = {
        first_name: "Jane",
        last_name: "Smith",
        username: "newusername",
      };
      const updatedUser = {
        _id: "user123",
        id: "user123",
        ...updateData,
        email: "user@example.com",
        toObject: jest.fn(() => ({
          _id: "user123",
          id: "user123",
          ...updateData,
        })),
      };
      req.params.id = "user123";
      req.user.id = "user123";
      req.body = updateData;
      mockUpdateUserById.mockResolvedValue(updatedUser);

      await updateUser(req, res, next);

      expect(mockUpdateUserById).toHaveBeenCalledWith("user123", updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("should filter out non-whitelisted fields", async () => {
      const updateData = {
        first_name: "Jane",
        email: "hacker@example.com",
        is_admin: true,
        password: "newpassword",
      };
      const filteredData = { first_name: "Jane", email: "hacker@example.com" };
      const updatedUser = {
        _id: "user123",
        id: "user123",
        first_name: "Jane",
        email: "hacker@example.com",
        toObject: jest.fn(() => ({
          _id: "user123",
          id: "user123",
          first_name: "Jane",
        })),
      };
      req.params.id = "user123";
      req.user.id = "user123";
      req.body = updateData;
      mockUpdateUserById.mockResolvedValue(updatedUser);

      await updateUser(req, res, next);

      expect(mockUpdateUserById).toHaveBeenCalledWith("user123", filteredData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if user does not exist", async () => {
      req.params.id = "nonexistentuser";
      req.body = { first_name: "Jane" };
      mockUpdateUserById.mockResolvedValue(null);

      await updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.id = "user123";
      req.body = { first_name: "Jane" };
      mockUpdateUserById.mockRejectedValue(new Error("Update failed"));

      await updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should return success message on successful deletion", async () => {
      req.params.id = "user123";
      mockDeleteUserById.mockResolvedValue({
        _id: "user123",
        username: "testuser",
      });

      await deleteUser(req, res, next);

      expect(mockDeleteUserById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if user not found", async () => {
      req.params.id = "nonexistentuser";
      mockDeleteUserById.mockResolvedValue(null);

      await deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.id = "user123";
      mockDeleteUserById.mockRejectedValue(new Error("Delete failed"));

      await deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getFavouriteRestaurants", () => {
    it("should return user favourite restaurants", async () => {
      const mockFavourites = [
        { _id: "rest1", name: "Restaurant 1" },
        { _id: "rest2", name: "Restaurant 2" },
      ];
      const mockUser = {
        _id: "user123",
        username: "testuser",
        favourite_restaurants: mockFavourites,
      };
      req.params.id = "user123";
      mockFetchFavouriteRestaurants.mockResolvedValue(mockUser);

      await getFavouriteRestaurants(req, res, next);

      expect(mockFetchFavouriteRestaurants).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockFavourites);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return empty array if no favourites", async () => {
      const mockUser = {
        _id: "user123",
        username: "testuser",
        favourite_restaurants: [],
      };
      req.params.id = "user123";
      mockFetchFavouriteRestaurants.mockResolvedValue(mockUser);

      await getFavouriteRestaurants(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return undefined if favourites is undefined", async () => {
      const mockUser = {
        _id: "user123",
        username: "testuser",
      };
      req.params.id = "user123";
      mockFetchFavouriteRestaurants.mockResolvedValue(mockUser);

      await getFavouriteRestaurants(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(undefined);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if user does not exist", async () => {
      req.params.id = "nonexistentuser";
      mockFetchFavouriteRestaurants.mockResolvedValue(null);

      await getFavouriteRestaurants(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.id = "user123";
      mockFetchFavouriteRestaurants.mockRejectedValue(
        new Error("Database error")
      );

      await getFavouriteRestaurants(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
