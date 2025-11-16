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
      req.user = decoded;

      if (requiredRole === "admin" && !req.user.is_admin) {
        return res.status(403).json({ error: "Forbidden: admin only" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid Token" });
    }
  };
};

const ownerOrAdmin = (req, res, next) => {
  const userId = req.user.id;
  const resourceUserId = req.body.userId || req.params.userId;

  if (req.user.is_admin || userId === resourceUserId) {
    return next();
  }

  return res.status(403).json({
    error: "Unauthorized: You can only modify your own resources",
  });
};

export { authorize, ownerOrAdmin };
