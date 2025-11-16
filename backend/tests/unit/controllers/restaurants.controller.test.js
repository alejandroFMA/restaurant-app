import { jest } from "@jest/globals";

const mockRestaurantFindById = jest.fn();
const mockRestaurantFind = jest.fn();
const mockRestaurantFindOne = jest.fn();
const mockRestaurantFindByIdAndUpdate = jest.fn();
const mockRestaurantFindByIdAndDelete = jest.fn();
const mockRestaurantCreate = jest.fn();

const mockRestaurantModel = {
  findById: (id) => mockRestaurantFindById(id),
  find: () => mockRestaurantFind(),
  findOne: (query) => mockRestaurantFindOne(query),
  findByIdAndUpdate: (id, data, options) =>
    mockRestaurantFindByIdAndUpdate(id, data, options),
  findByIdAndDelete: (id) => mockRestaurantFindByIdAndDelete(id),
  create: (data) => mockRestaurantCreate(data),
};

jest.unstable_mockModule("../../../models/Restaurant.model.js", () => ({
  default: mockRestaurantModel,
}));

const {
  createRestaurant,
  fetchRestaurantById,
  fetchAllRestaurants,
  fetchRestaurantByName,
  fetchTopRestaurants,
  updateRestaurant,
  deleteRestaurant,
} = await import("../../../controllers/restaurants.controller.js");

describe("Restaurants Controller", () => {
  const validRestaurantData = {
    name: "Test Restaurant",
    neighborhood: "Downtown",
    address: "123 Main St",
    latlng: { lat: 40.7128, lng: -74.006 },
    image: "https://example.com/image.jpg",
    cuisine_type: "Italian",
    operating_hours: { Monday: "9am-10pm" },
    photograph: "test.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createRestaurant", () => {
    it("should create restaurant with all required fields", async () => {
      const mockCreated = { _id: "rest123", ...validRestaurantData };
      mockRestaurantCreate.mockResolvedValue(mockCreated);

      const result = await createRestaurant(validRestaurantData);

      expect(result).toEqual(mockCreated);
      expect(mockRestaurantCreate).toHaveBeenCalled();
    });

    it.each([
      ["name"],
      ["neighborhood"],
      ["address"],
      ["latlng"],
      ["image"],
      ["cuisine_type"],
      ["operating_hours"],
      ["photograph"],
    ])("should throw error when %s is missing", async (field) => {
      const invalidData = { ...validRestaurantData };
      delete invalidData[field];

      await expect(createRestaurant(invalidData)).rejects.toThrow(
        "All restaurant fields are required"
      );
    });

    it("should handle database errors", async () => {
      mockRestaurantCreate.mockRejectedValue(new Error("Database error"));

      await expect(createRestaurant(validRestaurantData)).rejects.toThrow(
        "Error creating restaurant"
      );
    });
  });

  describe("fetchRestaurantById", () => {
    it("should return restaurant when ID is valid", async () => {
      const mockRestaurant = {
        _id: "rest123",
        name: "Test Restaurant",
        neighborhood: "Downtown",
      };
      mockRestaurantFindById.mockResolvedValue(mockRestaurant);

      const result = await fetchRestaurantById("rest123");

      expect(mockRestaurantFindById).toHaveBeenCalledWith("rest123");
      expect(result).toEqual(mockRestaurant);
    });

    it("should throw error if restaurant not found", async () => {
      mockRestaurantFindById.mockResolvedValue(null);

      await expect(fetchRestaurantById("nonexistent")).rejects.toThrow(
        "Restaurant not found"
      );
    });

    it("should throw error if ID is not provided", async () => {
      await expect(fetchRestaurantById(null)).rejects.toThrow(
        "Restaurant ID is required"
      );
    });

    it("should handle database errors", async () => {
      mockRestaurantFindById.mockRejectedValue(new Error("Database error"));

      await expect(fetchRestaurantById("rest123")).rejects.toThrow(
        "Error fetching restaurant"
      );
    });
  });

  describe("fetchAllRestaurants", () => {
    it("should return array of restaurants", async () => {
      const mockRestaurants = [
        { _id: "rest1", name: "Restaurant 1" },
        { _id: "rest2", name: "Restaurant 2" },
      ];
      mockRestaurantFind.mockResolvedValue(mockRestaurants);

      const result = await fetchAllRestaurants();

      expect(mockRestaurantFind).toHaveBeenCalled();
      expect(result).toEqual(mockRestaurants);
    });

    it("should return empty array if no restaurants exist", async () => {
      mockRestaurantFind.mockResolvedValue([]);

      const result = await fetchAllRestaurants();

      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      mockRestaurantFind.mockRejectedValue(new Error("Database error"));

      await expect(fetchAllRestaurants()).rejects.toThrow(
        "Error fetching restaurants"
      );
    });
  });

  describe("fetchRestaurantByName", () => {
    it("should return restaurant when name exists", async () => {
      const mockRestaurant = {
        _id: "rest123",
        name: "Test Restaurant",
        neighborhood: "Downtown",
      };
      mockRestaurantFindOne.mockResolvedValue(mockRestaurant);

      const result = await fetchRestaurantByName("Test Restaurant");

      expect(mockRestaurantFindOne).toHaveBeenCalledWith({
        name: "Test Restaurant",
      });
      expect(result).toEqual(mockRestaurant);
    });

    it("should throw error if restaurant not found", async () => {
      mockRestaurantFindOne.mockResolvedValue(null);

      await expect(fetchRestaurantByName("Nonexistent")).rejects.toThrow(
        "Restaurant not found"
      );
    });

    it("should throw error if name is not provided", async () => {
      await expect(fetchRestaurantByName(null)).rejects.toThrow(
        "Restaurant name is required"
      );
    });

    it("should handle database errors", async () => {
      mockRestaurantFindOne.mockRejectedValue(new Error("Database error"));

      await expect(fetchRestaurantByName("Test")).rejects.toThrow(
        "Error fetching restaurant"
      );
    });
  });

  describe("fechtTopRestaurants", () => {
    const setupTopRestaurantsQuery = (mockRestaurants) => {
      mockRestaurantFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockRestaurants),
        }),
      });
    };

    it("should return top 5 restaurants sorted by rating", async () => {
      const mockTopRestaurants = [
        { _id: "rest1", name: "Best", average_rating: 5 },
        { _id: "rest2", name: "Good", average_rating: 4.5 },
        { _id: "rest3", name: "Nice", average_rating: 4 },
        { _id: "rest4", name: "Ok", average_rating: 3.5 },
        { _id: "rest5", name: "Fair", average_rating: 3 },
      ];
      setupTopRestaurantsQuery(mockTopRestaurants);

      const result = await fetchTopRestaurants();

      expect(result).toEqual(mockTopRestaurants);
    });

    it("should return fewer than 5 if not enough restaurants", async () => {
      const mockTopRestaurants = [
        { _id: "rest1", name: "Best", average_rating: 5 },
        { _id: "rest2", name: "Good", average_rating: 4.5 },
      ];
      setupTopRestaurantsQuery(mockTopRestaurants);

      const result = await fetchTopRestaurants();

      expect(result.length).toBe(2);
    });

    it("should handle database errors", async () => {
      mockRestaurantFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockRejectedValue(new Error("Database error")),
        }),
      });

      await expect(fetchTopRestaurants()).rejects.toThrow(
        "Error fetching top restaurants"
      );
    });
  });

  describe("updateRestaurant", () => {
    it("should update restaurant with valid data", async () => {
      const updateData = { name: "Updated Name", cuisine_type: "French" };
      const updatedRestaurant = {
        _id: "rest123",
        ...updateData,
        neighborhood: "Downtown",
      };
      mockRestaurantFindByIdAndUpdate.mockResolvedValue(updatedRestaurant);

      const result = await updateRestaurant("rest123", updateData);

      expect(mockRestaurantFindByIdAndUpdate).toHaveBeenCalledWith(
        "rest123",
        updateData,
        { new: true }
      );
      expect(result).toEqual(updatedRestaurant);
    });

    it("should throw error if restaurant not found", async () => {
      mockRestaurantFindByIdAndUpdate.mockResolvedValue(null);

      await expect(
        updateRestaurant("nonexistent", { name: "New Name" })
      ).rejects.toThrow("Restaurant not found");
    });

    it("should throw error if ID is not provided", async () => {
      await expect(updateRestaurant(null, {})).rejects.toThrow(
        "Restaurant ID is required"
      );
    });

    it("should handle database errors", async () => {
      mockRestaurantFindByIdAndUpdate.mockRejectedValue(
        new Error("Update failed")
      );

      await expect(
        updateRestaurant("rest123", { name: "New Name" })
      ).rejects.toThrow("Error updating restaurant");
    });
  });

  describe("deleteRestaurant", () => {
    it("should delete restaurant and return it", async () => {
      const deletedRestaurant = {
        _id: "rest123",
        name: "Deleted Restaurant",
      };
      mockRestaurantFindByIdAndDelete.mockResolvedValue(deletedRestaurant);

      const result = await deleteRestaurant("rest123");

      expect(mockRestaurantFindByIdAndDelete).toHaveBeenCalledWith("rest123");
      expect(result).toEqual(deletedRestaurant);
    });

    it("should throw error if restaurant not found", async () => {
      mockRestaurantFindByIdAndDelete.mockResolvedValue(null);

      await expect(deleteRestaurant("nonexistent")).rejects.toThrow(
        "Restaurant not found"
      );
    });

    it("should throw error if ID is not provided", async () => {
      await expect(deleteRestaurant(null)).rejects.toThrow(
        "Restaurant ID is required"
      );
    });

    it("should handle database errors", async () => {
      mockRestaurantFindByIdAndDelete.mockRejectedValue(
        new Error("Delete failed")
      );

      await expect(deleteRestaurant("rest123")).rejects.toThrow(
        "Error deleting restaurant"
      );
    });
  });
});
