import { jest } from "@jest/globals";

const mockUserFindById = jest.fn();
const mockRestaurantFindById = jest.fn();
const mockReviewFindOne = jest.fn();
const mockReviewCreate = jest.fn();
const mockUpdateRestaurantAvgRating = jest.fn();

const mockUserModel = {
  findById: mockUserFindById,
};

const mockRestaurantModel = {
  findById: mockRestaurantFindById,
};

const mockReviewModel = {
  findOne: mockReviewFindOne,
  create: mockReviewCreate,
};

jest.unstable_mockModule("../../../models/User.model.js", () => ({
  default: mockUserModel,
}));

jest.unstable_mockModule("../../../models/Restaurant.model.js", () => ({
  default: mockRestaurantModel,
}));

jest.unstable_mockModule("../../../models/Review.model.js", () => ({
  default: mockReviewModel,
}));

jest.unstable_mockModule("../../../service/ReviewService.js", () => ({
  updateRestaurantAvgRating: mockUpdateRestaurantAvgRating,
}));

const { createReview } = await import(
  "../../../controllers/reviews.controller.js"
);

describe("Reviews Controller", () => {
  const userId = "user123";
  const restaurantId = "restaurant456";
  const mockUser = { _id: userId, username: "testuser" };
  const mockRestaurant = { _id: restaurantId, name: "Test Restaurant" };

  const setupSuccessfulMocks = (reviewData = {}) => {
    mockUserFindById.mockResolvedValue(mockUser);
    mockRestaurantFindById.mockResolvedValue(mockRestaurant);
    mockReviewFindOne.mockResolvedValue(null);
    mockReviewCreate.mockResolvedValue({
      _id: "review789",
      user: userId,
      restaurant: restaurantId,
      ...reviewData,
    });
    mockUpdateRestaurantAvgRating.mockResolvedValue();
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createReview", () => {
    it("should create review with full data", async () => {
      const data = {
        restaurant: restaurantId,
        rating: 5,
        review: "Great food and service!",
      };
      setupSuccessfulMocks({ rating: 5, review: "Great food and service!" });

      const result = await createReview(userId, data);

      expect(mockUserFindById).toHaveBeenCalledWith(userId);
      expect(mockRestaurantFindById).toHaveBeenCalledWith(restaurantId);
      expect(mockReviewFindOne).toHaveBeenCalledWith({
        user: userId,
        restaurant: restaurantId,
      });
      expect(mockReviewCreate).toHaveBeenCalled();
      expect(mockUpdateRestaurantAvgRating).toHaveBeenCalledWith(restaurantId);
      expect(result.rating).toBe(5);
      expect(result.review).toBe("Great food and service!");
    });

    it("should create review with only required fields", async () => {
      const data = { restaurant: restaurantId, rating: 4 };
      setupSuccessfulMocks({ rating: 4 });

      const result = await createReview(userId, data);

      expect(mockReviewCreate).toHaveBeenCalled();
      expect(mockUpdateRestaurantAvgRating).toHaveBeenCalledWith(restaurantId);
      expect(result.rating).toBe(4);
    });

    it.each([
      ["user parameter", null, { restaurant: restaurantId, rating: 5 }],
      ["restaurant", userId, { rating: 5, review: "Great food!" }],
      ["rating", userId, { restaurant: restaurantId, review: "Great!" }],
    ])("should throw error when %s is missing", async (_, user, data) => {
      await expect(createReview(user, data)).rejects.toThrow(
        "User, restaurant, and rating are required"
      );
      if (user) {
        expect(mockUserFindById).not.toHaveBeenCalled();
      }
    });

    it.each([
      ["user", null, mockRestaurant],
      ["restaurant", mockUser, null],
    ])(
      "should throw error when %s does not exist",
      async (_, user, restaurant) => {
        mockUserFindById.mockResolvedValue(user);
        mockRestaurantFindById.mockResolvedValue(restaurant);

        await expect(
          createReview(userId, { restaurant: restaurantId, rating: 5 })
        ).rejects.toThrow(user ? "Restaurant not found" : "User not found");
      }
    );

    it("should reject duplicate review", async () => {
      mockUserFindById.mockResolvedValue(mockUser);
      mockRestaurantFindById.mockResolvedValue(mockRestaurant);
      mockReviewFindOne.mockResolvedValue({
        _id: "existing-review",
        user: userId,
        restaurant: restaurantId,
        rating: 4,
      });

      await expect(
        createReview(userId, { restaurant: restaurantId, rating: 5 })
      ).rejects.toThrow("User has already reviewed this restaurant");
      expect(mockUpdateRestaurantAvgRating).not.toHaveBeenCalled();
    });

    it("should update restaurant average rating after creation", async () => {
      const data = { restaurant: restaurantId, rating: 5 };
      setupSuccessfulMocks({ rating: 5 });

      await createReview(userId, data);

      expect(mockUpdateRestaurantAvgRating).toHaveBeenCalledWith(restaurantId);
      expect(mockUpdateRestaurantAvgRating).toHaveBeenCalledTimes(1);
    });
  });
});
