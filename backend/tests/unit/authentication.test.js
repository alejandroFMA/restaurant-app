import { jest } from "@jest/globals";

const mockVerify = jest.fn();
const mockReviewFindById = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockVerify,
  },
}));

jest.unstable_mockModule("../../schema/Review.schema.js", () => ({
  default: {
    findById: mockReviewFindById,
  },
}));

const { authorize, ownerOrAdmin } = await import(
  "../../middleware/authentication.js"
);

describe("Authentication Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: {},
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("authorize", () => {
    it("should allow access with valid token", () => {
      const middleware = authorize();
      const token = "valid-token";
      const decoded = {
        id: "user123",
        username: "testuser",
        is_admin: false,
      };

      req.headers.authorization = `Bearer ${token}`;
      mockVerify.mockReturnValue(decoded);

      middleware(req, res, next);

      expect(mockVerify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(req.user.id).toBe("user123");
      expect(req.user.is_admin).toBe(false);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should normalize token payload fields", () => {
      const middleware = authorize();
      const token = "valid-token";
      const decoded = { userId: "user123", isAdmin: true };

      req.headers.authorization = `Bearer ${token}`;
      mockVerify.mockReturnValue(decoded);

      middleware(req, res, next);

      expect(req.user.id).toBe("user123");
      expect(req.user.is_admin).toBe(true);
      expect(next).toHaveBeenCalled();
    });

    it.each([
      ["authorization header is missing", {}],
      [
        "authorization header does not start with Bearer",
        { authorization: "Basic some-token" },
      ],
    ])("should deny access when %s", (_, headers) => {
      const middleware = authorize();
      req.headers = headers;

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Not Authorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it.each([
      [
        "invalid",
        () => {
          throw new Error("Invalid token");
        },
      ],
      [
        "expired",
        () => {
          const e = new Error("jwt expired");
          e.name = "TokenExpiredError";
          throw e;
        },
      ],
    ])("should deny access when token is %s", (_, verifyImpl) => {
      const middleware = authorize();
      req.headers.authorization = "Bearer token";
      mockVerify.mockImplementation(verifyImpl);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid Token" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should deny access when non-admin user tries to access admin route", () => {
      const middleware = authorize("admin");
      const token = "valid-token";
      const decoded = {
        id: "user123",
        username: "testuser",
        is_admin: false,
      };

      req.headers.authorization = `Bearer ${token}`;
      mockVerify.mockReturnValue(decoded);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Forbidden: admin only",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow access when admin user accesses admin route", () => {
      const middleware = authorize("admin");
      const token = "valid-token";
      const decoded = { id: "admin123", username: "admin", is_admin: true };

      req.headers.authorization = `Bearer ${token}`;
      mockVerify.mockReturnValue(decoded);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("ownerOrAdmin", () => {
    it.each([
      ["body.userId", { body: { userId: "user123" } }],
      ["params.userId", { params: { userId: "user123" } }],
    ])("should allow access when user is owner via %s", async (_, reqData) => {
      req.user = { id: "user123", is_admin: false };
      Object.assign(req, reqData);

      await ownerOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should allow access when user is admin", async () => {
      req.user = { id: "admin123", is_admin: true };
      req.body.userId = "user456";

      await ownerOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should deny access when user is not owner and not admin", async () => {
      req.user = { id: "user123", is_admin: false };
      req.body.userId = "user456";

      await ownerOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized: You can only modify your own resources",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should prioritize body.userId over params.userId", async () => {
      req.user = { id: "user123", is_admin: false };
      req.body.userId = "user123";
      req.params.userId = "user456";

      await ownerOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should fetch review and verify owner when reviewId is provided", async () => {
      const mockReview = {
        _id: "review123",
        user: "user123",
        restaurant: "rest123",
      };

      req.user = { id: "user123", is_admin: false };
      req.params.reviewId = "review123";
      req.body = {};
      req.params.userId = undefined;
      mockReviewFindById.mockResolvedValue(mockReview);

      await ownerOrAdmin(req, res, next);

      expect(mockReviewFindById).toHaveBeenCalledWith("review123");
      expect(next).toHaveBeenCalled();
    });

    it("should deny access if review not found", async () => {
      req.user = { id: "user123", is_admin: false };
      req.params.reviewId = "nonexistent";
      req.body = {};
      req.params.userId = undefined;
      mockReviewFindById.mockResolvedValue(null);

      await ownerOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Resource not found" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should deny access if user is not review owner", async () => {
      const mockReview = {
        _id: "review123",
        user: "otheruser",
        restaurant: "rest123",
      };

      req.user = { id: "user123", is_admin: false };
      req.params.reviewId = "review123";
      req.body = {};
      req.params.userId = undefined;
      mockReviewFindById.mockResolvedValue(mockReview);

      await ownerOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorized: You can only modify your own resources",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should allow admin to modify any review", async () => {
      const mockReview = {
        _id: "review123",
        user: "otheruser",
        restaurant: "rest123",
      };

      req.user = { id: "admin123", is_admin: true };
      req.params.reviewId = "review123";
      req.body = {};
      req.params.userId = undefined;
      mockReviewFindById.mockResolvedValue(mockReview);

      await ownerOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.user = { id: "user123", is_admin: false };
      req.params.reviewId = "review123";
      req.body = {};
      req.params.userId = undefined;
      mockReviewFindById.mockRejectedValue(new Error("Database error"));

      await ownerOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
