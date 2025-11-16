import { jest } from "@jest/globals";

const mockUserFindById = jest.fn();
const mockUserFind = jest.fn();
const mockUserFindOne = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();
const mockUserFindByIdAndDelete = jest.fn();
const mockPopulate = jest.fn();

const mockUserModel = {
  findById: (id) => mockUserFindById(id),
  find: () => mockUserFind(),
  findOne: (query) => mockUserFindOne(query),
  findByIdAndUpdate: (id, data, options) =>
    mockUserFindByIdAndUpdate(id, data, options),
  findByIdAndDelete: (id) => mockUserFindByIdAndDelete(id),
};

jest.unstable_mockModule("../../../models/User.model.js", () => ({
  default: mockUserModel,
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user when ID is valid", async () => {
      const mockUser = {
        _id: "user123",
        username: "testuser",
        email: "user@example.com",
        first_name: "John",
        last_name: "Doe",
      };
      mockUserFindById.mockResolvedValue(mockUser);

      const result = await getUserById("user123");

      expect(mockUserFindById).toHaveBeenCalledWith("user123");
      expect(result).toEqual(mockUser);
    });

    it("should return null if user does not exist", async () => {
      mockUserFindById.mockResolvedValue(null);

      const result = await getUserById("nonexistentuser");

      expect(result).toBeNull();
    });

    it.each([null, undefined, ""])(
      "should throw error if userId is %s",
      async (userId) => {
        await expect(getUserById(userId)).rejects.toThrow(
          "User ID is required"
        );
      }
    );

    it("should handle database errors", async () => {
      mockUserFindById.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(getUserById("user123")).rejects.toThrow(
        "Error fetching user"
      );
    });
  });

  describe("getAllUsers", () => {
    it("should return array of users", async () => {
      const mockUsers = [
        { _id: "user1", username: "user1", email: "user1@example.com" },
        { _id: "user2", username: "user2", email: "user2@example.com" },
      ];
      mockUserFind.mockResolvedValue(mockUsers);

      const result = await getAllUsers();

      expect(mockUserFind).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it("should return empty array if no users exist", async () => {
      mockUserFind.mockResolvedValue([]);

      const result = await getAllUsers();

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockUserFind.mockRejectedValue(new Error("Database error"));

      await expect(getAllUsers()).rejects.toThrow("Error fetching users");
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when email exists", async () => {
      const mockUser = {
        _id: "user123",
        username: "testuser",
        email: "user@example.com",
      };
      mockUserFindOne.mockResolvedValue(mockUser);

      const result = await getUserByEmail("user@example.com");

      expect(mockUserFindOne).toHaveBeenCalledWith({
        email: "user@example.com",
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if email does not exist", async () => {
      mockUserFindOne.mockResolvedValue(null);

      const result = await getUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      mockUserFindOne.mockRejectedValue(new Error("Database error"));

      await expect(getUserByEmail("user@example.com")).rejects.toThrow(
        "Error fetching user by email"
      );
    });
  });

  describe("getUserByUsername", () => {
    it("should return user when username exists", async () => {
      const mockUser = {
        _id: "user123",
        username: "testuser",
        email: "user@example.com",
      };
      mockUserFindOne.mockResolvedValue(mockUser);

      const result = await getUserByUsername("testuser");

      expect(mockUserFindOne).toHaveBeenCalledWith({
        username: "testuser",
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if username does not exist", async () => {
      mockUserFindOne.mockResolvedValue(null);

      const result = await getUserByUsername("nonexistentuser");

      expect(result).toBeNull();
    });

    it.each([null, undefined])(
      "should throw error if username is %s",
      async (username) => {
        await expect(getUserByUsername(username)).rejects.toThrow(
          "Username is required"
        );
      }
    );

    it("should handle database errors", async () => {
      mockUserFindOne.mockRejectedValue(new Error("Database error"));

      await expect(getUserByUsername("testuser")).rejects.toThrow(
        "Error fetching user by username"
      );
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
        ...updateData,
        email: "user@example.com",
      };
      mockUserFindByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await updateUser("user123", updateData);

      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        updateData,
        { new: true }
      );
      expect(result).toEqual(updatedUser);
    });

    it("should filter out non-whitelisted fields", async () => {
      const updateData = {
        first_name: "Jane",
        email: "hacker@example.com",
        is_admin: true,
        password: "newpassword",
      };
      mockUserFindByIdAndUpdate.mockResolvedValue({
        _id: "user123",
        first_name: "Jane",
      });

      await updateUser("user123", updateData);

      const callArgs = mockUserFindByIdAndUpdate.mock.calls[0][1];
      expect(callArgs).toHaveProperty("first_name");
      expect(callArgs).not.toHaveProperty("email");
      expect(callArgs).not.toHaveProperty("is_admin");
      expect(callArgs).not.toHaveProperty("password");
    });

    it.each([null, undefined])(
      "should throw error if userId is %s",
      async (userId) => {
        await expect(updateUser(userId, {})).rejects.toThrow(
          "User ID is required"
        );
      }
    );

    it("should handle database errors", async () => {
      mockUserFindByIdAndUpdate.mockRejectedValue(new Error("Update failed"));

      await expect(
        updateUser("user123", { first_name: "Jane" })
      ).rejects.toThrow("Error updating user");
    });
  });

  describe("deleteUser", () => {
    it("should return true on successful deletion", async () => {
      mockUserFindByIdAndDelete.mockResolvedValue({
        _id: "user123",
        username: "testuser",
      });

      const result = await deleteUser("user123");

      expect(mockUserFindByIdAndDelete).toHaveBeenCalledWith("user123");
      expect(result).toBe(true);
    });

    it("should return true even if user not found", async () => {
      mockUserFindByIdAndDelete.mockResolvedValue(null);

      const result = await deleteUser("nonexistentuser");

      expect(result).toBe(true);
    });

    it("should handle database errors", async () => {
      mockUserFindByIdAndDelete.mockRejectedValue(new Error("Delete failed"));

      await expect(deleteUser("user123")).rejects.toThrow(
        "Error deleting user"
      );
    });
  });

  describe("getFavouriteRestaurants", () => {
    const setupPopulateMock = (user) => {
      mockUserFindById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(user),
      });
    };

    it("should return user favourite restaurants", async () => {
      const mockFavourites = [
        { _id: "rest1", name: "Restaurant 1" },
        { _id: "rest2", name: "Restaurant 2" },
      ];
      setupPopulateMock({
        _id: "user123",
        username: "testuser",
        favourite_restaurants: mockFavourites,
      });

      const result = await getFavouriteRestaurants("user123");

      expect(mockUserFindById).toHaveBeenCalledWith("user123");
      expect(result).toEqual(mockFavourites);
    });

    it("should return empty array if no favourites", async () => {
      setupPopulateMock({
        _id: "user123",
        username: "testuser",
        favourite_restaurants: [],
      });

      const result = await getFavouriteRestaurants("user123");

      expect(result).toEqual([]);
    });

    it("should return null if user does not exist", async () => {
      setupPopulateMock(null);

      const result = await getFavouriteRestaurants("nonexistentuser");

      expect(result).toBeNull();
    });

    it.each([null, undefined])(
      "should throw error if userId is %s",
      async (userId) => {
        await expect(getFavouriteRestaurants(userId)).rejects.toThrow(
          "User ID is required"
        );
      }
    );

    it("should handle database errors", async () => {
      mockUserFindById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await expect(getFavouriteRestaurants("user123")).rejects.toThrow(
        "Error fetching favourite restaurants"
      );
    });
  });
});
