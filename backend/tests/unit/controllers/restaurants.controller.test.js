import { jest } from "@jest/globals";

const mockCreateRestaurant = jest.fn();
const mockFetchRestaurantById = jest.fn();
const mockFetchAllRestaurants = jest.fn();
const mockFetchRestaurantByName = jest.fn();
const mockFetchTopRestaurants = jest.fn();
const mockUpdateRestaurantById = jest.fn();
const mockDeleteRestaurantById = jest.fn();
const mockGeocodeAddress = jest.fn();

jest.unstable_mockModule(
  "../../../repository/restaurants.repository.js",
  () => ({
    createRestaurant: mockCreateRestaurant,
    fetchRestaurantById: mockFetchRestaurantById,
    fetchAllRestaurants: mockFetchAllRestaurants,
    fetchRestaurantByName: mockFetchRestaurantByName,
    fetchTopRestaurants: mockFetchTopRestaurants,
    updateRestaurantById: mockUpdateRestaurantById,
    deleteRestaurantById: mockDeleteRestaurantById,
  })
);

jest.unstable_mockModule("../../../utils/geocoding.js", () => ({
  geocodeAddress: mockGeocodeAddress,
}));

const {
  createRestaurant,
  getRestaurantById,
  getAllRestaurants,
  getRestaurantByName,
  getTopRestaurants,
  updateRestaurant,
  deleteRestaurant,
} = await import("../../../controllers/restaurants.controller.js");

describe("Restaurants Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

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

  describe("createRestaurant", () => {
    it("should create restaurant with all required fields", async () => {
      const mockCreated = {
        _id: "rest123",
        id: "rest123",
        ...validRestaurantData,
      };
      req.body = {
        name: "Test Restaurant",
        neighborhood: "Downtown",
        address: "123 Main St",
        image: "https://example.com/image.jpg",
        cuisine_type: "Italian",
        operating_hours: { Monday: "9am-10pm" },
        photograph: "test.jpg",
      };
      mockGeocodeAddress.mockResolvedValue({ lat: 40.7128, lng: -74.006 });
      mockCreateRestaurant.mockResolvedValue(mockCreated);

      await createRestaurant(req, res, next);

      expect(mockGeocodeAddress).toHaveBeenCalledWith("123 Main St");
      expect(mockCreateRestaurant).toHaveBeenCalledWith({
        name: "Test Restaurant",
        neighborhood: "Downtown",
        address: "123 Main St",
        latlng: { lat: 40.7128, lng: -74.006 },
        image: "https://example.com/image.jpg",
        cuisine_type: "Italian",
        operating_hours: { Monday: "9am-10pm" },
        photograph: "test.jpg",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreated);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.body = validRestaurantData;
      mockCreateRestaurant.mockRejectedValue(new Error("Database error"));

      await createRestaurant(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getAllRestaurants", () => {
    it("should return array of restaurants", async () => {
      const mockRestaurants = [
        { _id: "rest1", id: "rest1", name: "Restaurant 1" },
        { _id: "rest2", id: "rest2", name: "Restaurant 2" },
      ];
      mockFetchAllRestaurants.mockResolvedValue(mockRestaurants);

      await getAllRestaurants(req, res, next);

      expect(mockFetchAllRestaurants).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRestaurants);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return empty array if no restaurants exist", async () => {
      mockFetchAllRestaurants.mockResolvedValue([]);

      await getAllRestaurants(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockFetchAllRestaurants.mockRejectedValue(new Error("Database error"));

      await getAllRestaurants(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getRestaurantById", () => {
    it("should return restaurant when ID is valid", async () => {
      const mockRestaurant = {
        _id: "rest123",
        id: "rest123",
        name: "Test Restaurant",
        neighborhood: "Downtown",
      };
      req.params.id = "rest123";
      mockFetchRestaurantById.mockResolvedValue(mockRestaurant);

      await getRestaurantById(req, res, next);

      expect(mockFetchRestaurantById).toHaveBeenCalledWith("rest123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRestaurant);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if restaurant not found", async () => {
      req.params.id = "nonexistent";
      mockFetchRestaurantById.mockResolvedValue(null);

      await getRestaurantById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Restaurant not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.id = "rest123";
      mockFetchRestaurantById.mockRejectedValue(new Error("Database error"));

      await getRestaurantById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getAllRestaurants", () => {
    it("should return array of restaurants", async () => {
      const mockRestaurants = [
        { _id: "rest1", id: "rest1", name: "Restaurant 1" },
        { _id: "rest2", id: "rest2", name: "Restaurant 2" },
      ];
      mockFetchAllRestaurants.mockResolvedValue(mockRestaurants);

      await getAllRestaurants(req, res, next);

      expect(mockFetchAllRestaurants).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRestaurants);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return empty array if no restaurants exist", async () => {
      mockFetchAllRestaurants.mockResolvedValue([]);

      await getAllRestaurants(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockFetchAllRestaurants.mockRejectedValue(new Error("Database error"));

      await getAllRestaurants(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getRestaurantByName", () => {
    it("should return restaurant when name exists", async () => {
      const mockRestaurant = {
        _id: "rest123",
        id: "rest123",
        name: "Test Restaurant",
        neighborhood: "Downtown",
      };
      req.params.name = "Test Restaurant";
      mockFetchRestaurantByName.mockResolvedValue(mockRestaurant);

      await getRestaurantByName(req, res, next);

      expect(mockFetchRestaurantByName).toHaveBeenCalledWith("Test Restaurant");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRestaurant);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if restaurant not found", async () => {
      req.params.name = "nonexistent";
      mockFetchRestaurantByName.mockResolvedValue(null);

      await getRestaurantByName(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Restaurant not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.name = "Test Restaurant";
      mockFetchRestaurantByName.mockRejectedValue(new Error("Database error"));

      await getRestaurantByName(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("getTopRestaurants", () => {
    it("should return top restaurants sorted by rating", async () => {
      const mockTopRestaurants = [
        { _id: "rest1", id: "rest1", name: "Best", average_rating: 5 },
        { _id: "rest2", id: "rest2", name: "Good", average_rating: 4.5 },
        { _id: "rest3", id: "rest3", name: "Nice", average_rating: 4 },
        { _id: "rest4", id: "rest4", name: "Ok", average_rating: 3.5 },
        { _id: "rest5", id: "rest5", name: "Fair", average_rating: 3 },
      ];
      mockFetchTopRestaurants.mockResolvedValue(mockTopRestaurants);

      await getTopRestaurants(req, res, next);

      expect(mockFetchTopRestaurants).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTopRestaurants);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return fewer restaurants if not enough exist", async () => {
      const mockTopRestaurants = [
        { _id: "rest1", id: "rest1", name: "Best", average_rating: 5 },
        { _id: "rest2", id: "rest2", name: "Good", average_rating: 4.5 },
      ];
      mockFetchTopRestaurants.mockResolvedValue(mockTopRestaurants);

      await getTopRestaurants(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTopRestaurants);
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      mockFetchTopRestaurants.mockRejectedValue(new Error("Database error"));

      await getTopRestaurants(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("updateRestaurant", () => {
    it("should update restaurant with valid data", async () => {
      const updateData = { name: "Updated Name", cuisine_type: "French" };
      const updatedRestaurant = {
        _id: "rest123",
        id: "rest123",
        ...updateData,
        neighborhood: "Downtown",
      };
      req.params.id = "rest123";
      req.body = updateData;
      mockUpdateRestaurantById.mockResolvedValue(updatedRestaurant);

      await updateRestaurant(req, res, next);

      expect(mockUpdateRestaurantById).toHaveBeenCalledWith(
        "rest123",
        updateData
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedRestaurant);
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if restaurant not found", async () => {
      req.params.id = "nonexistent";
      req.body = { name: "Updated Name" };
      mockUpdateRestaurantById.mockResolvedValue(null);

      await updateRestaurant(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Restaurant not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.id = "rest123";
      req.body = { name: "Updated Name" };
      mockUpdateRestaurantById.mockRejectedValue(new Error("Update failed"));

      await updateRestaurant(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("deleteRestaurant", () => {
    it("should delete restaurant and return success message", async () => {
      const deletedRestaurant = {
        _id: "rest123",
        id: "rest123",
        name: "Deleted Restaurant",
      };
      req.params.id = "rest123";
      mockDeleteRestaurantById.mockResolvedValue(deletedRestaurant);

      await deleteRestaurant(req, res, next);

      expect(mockDeleteRestaurantById).toHaveBeenCalledWith("rest123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Restaurant deleted successfully",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if restaurant not found", async () => {
      req.params.id = "nonexistent";
      mockDeleteRestaurantById.mockResolvedValue(null);

      await deleteRestaurant(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Restaurant not found",
          statusCode: 404,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.params.id = "rest123";
      mockDeleteRestaurantById.mockRejectedValue(new Error("Delete failed"));

      await deleteRestaurant(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
