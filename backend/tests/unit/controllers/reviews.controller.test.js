import { jest } from "@jest/globals";

const mockCreateReview = jest.fn();
const mockFetchReviewById = jest.fn();
const mockFetchAllReviewsForRestaurant = jest.fn();
const mockFetchAllReviewsByUser = jest.fn();
const mockUpdateReviewById = jest.fn();
const mockDeleteReviewById = jest.fn();
const mockUpdateRestaurantAvgRating = jest.fn();

jest.unstable_mockModule("../../../repository/reviews.repository.js", () => ({
  createReview: mockCreateReview,
  fetchReviewById: mockFetchReviewById,
  fetchAllReviewsForRestaurant: mockFetchAllReviewsForRestaurant,
  fetchAllReviewsByUser: mockFetchAllReviewsByUser,
  updateReviewById: mockUpdateReviewById,
  deleteReviewById: mockDeleteReviewById,
}));

jest.unstable_mockModule("../../../service/ReviewService.js", () => ({
  updateRestaurantAvgRating: mockUpdateRestaurantAvgRating,
}));

const {
  createReview,
  getReviewById,
  getReviewsForRestaurant,
  getReviewsByUser,
  updateReview,
  deleteReview,
} = await import("../../../controllers/reviews.controller.js");

describe("Reviews Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
    mockUpdateRestaurantAvgRating.mockResolvedValue();
  });

  describe("createReview", () => {
    it("should create review with full data", async () => {
      const mockReview = {
        _id: "review789",
        id: "review789",
        user: "user123",
        restaurant: "restaurant456",
        rating: 5,
        review: "Great food and service!",
      };
      req.user = { id: "user123" };
      req.body = {
        restaurant: "restaurant456",
        rating: 5,
        review: "Great food and service!",
      };
      mockCreateReview.mockResolvedValue(mockReview);

      await createReview(req, res);

      expect(mockCreateReview).toHaveBeenCalledWith({
        user: "user123",
        restaurant: "restaurant456",
        rating: 5,
        review: "Great food and service!",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it("should create review with only required fields", async () => {
      const mockReview = {
        _id: "review789",
        id: "review789",
        user: "user123",
        restaurant: "restaurant456",
        rating: 4,
      };
      req.user = { id: "user123" };
      req.body = {
        restaurant: "restaurant456",
        rating: 4,
      };
      mockCreateReview.mockResolvedValue(mockReview);

      await createReview(req, res);

      expect(mockCreateReview).toHaveBeenCalledWith({
        user: "user123",
        restaurant: "restaurant456",
        rating: 4,
        review: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it("should return 400 when user is missing", async () => {
      req.user = {};
      req.body = {
        restaurant: "restaurant456",
        rating: 5,
      };

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User, restaurant, and rating are required",
      });
    });

    it("should return 400 when restaurant is missing", async () => {
      req.user = { id: "user123" };
      req.body = {
        rating: 5,
      };

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User, restaurant, and rating are required",
      });
    });

    it("should return 400 when rating is missing", async () => {
      req.user = { id: "user123" };
      req.body = {
        restaurant: "restaurant456",
      };

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User, restaurant, and rating are required",
      });
    });

    it("should handle database errors", async () => {
      req.user = { id: "user123" };
      req.body = {
        restaurant: "restaurant456",
        rating: 5,
      };
      mockCreateReview.mockRejectedValue(new Error("Database error"));

      await createReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("getReviewById", () => {
    it("should return review when ID is valid", async () => {
      const mockReview = {
        _id: "review123",
        id: "review123",
        user: "user123",
        restaurant: "restaurant456",
        rating: 5,
        review: "Great!",
      };
      req.params.reviewId = "review123";
      mockFetchReviewById.mockResolvedValue(mockReview);

      await getReviewById(req, res);

      expect(mockFetchReviewById).toHaveBeenCalledWith("review123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReview);
    });

    it("should return 400 if reviewId is not provided", async () => {
      req.params.reviewId = undefined;

      await getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Review ID is required",
      });
    });

    it("should handle database errors", async () => {
      req.params.reviewId = "review123";
      mockFetchReviewById.mockRejectedValue(new Error("Database error"));

      await getReviewById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("getReviewsForRestaurant", () => {
    it("should return reviews for restaurant", async () => {
      const mockReviews = [
        {
          _id: "review1",
          id: "review1",
          user: "user123",
          restaurant: "restaurant456",
          rating: 5,
        },
        {
          _id: "review2",
          id: "review2",
          user: "user456",
          restaurant: "restaurant456",
          rating: 4,
        },
      ];
      req.params.restaurantId = "restaurant456";
      mockFetchAllReviewsForRestaurant.mockResolvedValue(mockReviews);

      await getReviewsForRestaurant(req, res);

      expect(mockFetchAllReviewsForRestaurant).toHaveBeenCalledWith(
        "restaurant456"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should return empty array if no reviews exist", async () => {
      req.params.restaurantId = "restaurant456";
      mockFetchAllReviewsForRestaurant.mockResolvedValue([]);

      await getReviewsForRestaurant(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return 400 if restaurantId is not provided", async () => {
      req.params.restaurantId = undefined;

      await getReviewsForRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Restaurant ID is required",
      });
    });

    it("should handle database errors", async () => {
      req.params.restaurantId = "restaurant456";
      mockFetchAllReviewsForRestaurant.mockRejectedValue(
        new Error("Database error")
      );

      await getReviewsForRestaurant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("getReviewsByUser", () => {
    it("should return reviews by user", async () => {
      const mockReviews = [
        {
          _id: "review1",
          id: "review1",
          user: "user123",
          restaurant: "restaurant456",
          rating: 5,
        },
        {
          _id: "review2",
          id: "review2",
          user: "user123",
          restaurant: "restaurant789",
          rating: 4,
        },
      ];
      req.params.userId = "user123";
      mockFetchAllReviewsByUser.mockResolvedValue(mockReviews);

      await getReviewsByUser(req, res);

      expect(mockFetchAllReviewsByUser).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReviews);
    });

    it("should return empty array if no reviews exist", async () => {
      req.params.userId = "user123";
      mockFetchAllReviewsByUser.mockResolvedValue([]);

      await getReviewsByUser(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return 400 if userId is not provided", async () => {
      req.params.userId = undefined;

      await getReviewsByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User ID is required",
      });
    });

    it("should handle database errors", async () => {
      req.params.userId = "user123";
      mockFetchAllReviewsByUser.mockRejectedValue(new Error("Database error"));

      await getReviewsByUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("updateReview", () => {
    it("should update review with valid data", async () => {
      const updateData = { rating: 4, review: "Updated review" };
      const updatedReview = {
        _id: "review123",
        id: "review123",
        user: "user123",
        restaurant: "restaurant456",
        ...updateData,
      };
      req.params.reviewId = "review123";
      req.body = updateData;
      mockUpdateReviewById.mockResolvedValue(updatedReview);

      await updateReview(req, res);

      expect(mockUpdateReviewById).toHaveBeenCalledWith(
        "review123",
        updateData
      );
      expect(mockUpdateRestaurantAvgRating).toHaveBeenCalledWith(
        "restaurant456"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedReview);
    });

    it("should return 404 if review not found", async () => {
      req.params.reviewId = "nonexistent";
      req.body = { rating: 4 };
      mockUpdateReviewById.mockResolvedValue(null);

      await updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Review not found" });
    });

    it("should return 400 if reviewId is not provided", async () => {
      req.params.reviewId = undefined;
      req.body = { rating: 4 };

      await updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Review ID is required",
      });
    });

    it("should handle database errors", async () => {
      req.params.reviewId = "review123";
      req.body = { rating: 4 };
      mockUpdateReviewById.mockRejectedValue(new Error("Update failed"));

      await updateReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Update failed" });
    });
  });

  describe("deleteReview", () => {
    it("should delete review and return success message", async () => {
      const deletedReview = {
        _id: "review123",
        id: "review123",
        user: "user123",
        restaurant: "restaurant456",
        rating: 5,
      };
      req.params.reviewId = "review123";
      mockDeleteReviewById.mockResolvedValue(deletedReview);

      await deleteReview(req, res);

      expect(mockDeleteReviewById).toHaveBeenCalledWith("review123");
      expect(mockUpdateRestaurantAvgRating).toHaveBeenCalledWith(
        "restaurant456"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Review deleted successfully",
      });
    });

    it("should return 404 if review not found", async () => {
      req.params.reviewId = "nonexistent";
      mockDeleteReviewById.mockResolvedValue(null);

      await deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Review not found" });
    });

    it("should return 400 if reviewId is not provided", async () => {
      req.params.reviewId = undefined;

      await deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Review ID is required",
      });
    });

    it("should handle database errors", async () => {
      req.params.reviewId = "review123";
      mockDeleteReviewById.mockRejectedValue(new Error("Delete failed"));

      await deleteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Delete failed" });
    });
  });
});
