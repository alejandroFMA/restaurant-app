const errorHandler = (err, req, res, next) => {
  // Solo imprimir errores en desarrollo, no en tests
  if (process.env.NODE_ENV !== "test") {
    console.error(err.stack);
  }

  let status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  }

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  if (err.code === 11000) {
    status = 409;
    message = "Resource already exists";
  }

  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  if (err.errors && Array.isArray(err.errors)) {
    status = 400;
    message = "Validation failed";
    return res.status(status).json({
      success: false,
      message,
      errors: err.errors,
    });
  }

  res.status(status).json({
    success: false,
    message,
  });
};

export default errorHandler;
