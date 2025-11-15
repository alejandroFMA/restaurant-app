import jwt from "jsonwebtoken";

const authorizedUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not Authorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};

const adminOnly = (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not Authorized" });

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Forbidden: admin only" });
    }
    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: "Authorization error", message: err.message });
  }
};

export { authorizedUser, adminOnly };
