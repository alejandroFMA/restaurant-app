import jwt from "jsonwebtoken";

const authorize = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not Authorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = {
        id: decoded.id || decoded.userId,
        is_admin:
          decoded.is_admin !== undefined ? decoded.is_admin : decoded.isAdmin,
      };

      if (requiredRole === "admin" && !req.user.is_admin) {
        return res.status(403).json({ error: "Forbidden: admin only" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid Token" });
    }
  };
};

const ownerOrAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resourceUserId = req.body.userId || req.params.userId;
    const reviewId = req.params.reviewId;

    if (reviewId) {
      const Review = (await import("../models/Review.model.js")).default;
      const review = await Review.findById(reviewId);

      if (!review) {
        return res.status(404).json({ error: "Resource not found" });
      }

      if (req.user.is_admin || review.user.toString() === userId) {
        return next();
      }

      return res.status(403).json({
        error: "Unauthorized: You can only modify your own resources",
      });
    }

    if (req.user.is_admin || userId === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      error: "Unauthorized: You can only modify your own resources",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { authorize, ownerOrAdmin };
