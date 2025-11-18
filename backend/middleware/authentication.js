import jwt from "jsonwebtoken";

const authorize = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new Error("Not Authorized");
      error.statusCode = 401;
      return next(error);
    }

    const token = authHeader.split(" ")[1];

    if (!process.env.JWT_SECRET) {
      const error = new Error("JWT_SECRET is not set");
      error.statusCode = 500;
      return next(error);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id || decoded.userId,
        is_admin:
          decoded.is_admin !== undefined ? decoded.is_admin : decoded.isAdmin,
      };

      if (requiredRole === "admin" && !req.user.is_admin) {
        const error = new Error("Forbidden: admin only");
        error.statusCode = 403;
        return next(error);
      }

      next();
    } catch (error) {
      error.statusCode = 401;
      return next(error);
    }
  };
};

const ownerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      const error = new Error("Not Authorized: User not authenticated");
      error.statusCode = 401;
      return next(error);
    }

    const userId = req.user.id;
    const reviewId = req.params.reviewId;

    let resourceUserId = req.body?.userId || req.params.userId;

    if (reviewId) {
      const Review = (await import("../schema/Review.schema.js")).default;
      const review = await Review.findById(reviewId);

      if (!review) {
        const error = new Error("Resource not found");
        error.statusCode = 404;
        return next(error);
      }

      resourceUserId = review.user.toString();
    }

    if (req.user.is_admin || userId === resourceUserId) {
      return next();
    }

    const error = new Error(
      "Unauthorized: You can only modify your own resources"
    );
    error.statusCode = 403;
    return next(error);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    return next(error);
  }
};

export { authorize, ownerOrAdmin };
