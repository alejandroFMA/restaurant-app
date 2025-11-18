import { jest } from "@jest/globals";

const mockCreateUser = jest.fn();
const mockFetchUserByEmail = jest.fn();
const mockFetchUserByUsername = jest.fn();
const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();

jest.unstable_mockModule("../../../repository/users.repository.js", () => ({
  createUser: mockCreateUser,
  fetchUserByEmail: mockFetchUserByEmail,
  fetchUserByUsername: mockFetchUserByUsername,
}));

jest.unstable_mockModule("../../../utils/encryptPassword.js", () => ({
  hashPassword: mockHashPassword,
  comparePassword: mockComparePassword,
}));

const { register, login } = await import(
  "../../../controllers/auth.controller.js"
);

describe("Auth Controller", () => {
  let req, res, next;

  const validUserData = {
    username: "newuser",
    email: "user@example.com",
    password: "SecurePass123!",
    first_name: "John",
    last_name: "Doe",
  };

  const mockSavedUser = {
    _id: "user123",
    id: "user123",
    username: "newuser",
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    is_admin: false,
    password: "hashed_password",
    toObject: jest.fn(() => {
      const obj = {
        _id: "user123",
        id: "user123",
        username: "newuser",
        email: "user@example.com",
        first_name: "John",
        last_name: "Doe",
        is_admin: false,
      };
      return obj;
    }),
  };

  const setupSuccessfulRegistration = () => {
    mockFetchUserByUsername.mockResolvedValue(null);
    mockFetchUserByEmail.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue("hashed_password");
    mockCreateUser.mockResolvedValue(mockSavedUser);
  };

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register user with valid data", async () => {
      req.body = validUserData;
      setupSuccessfulRegistration();

      await register(req, res, next);

      expect(mockFetchUserByUsername).toHaveBeenCalledWith("newuser");
      expect(mockFetchUserByEmail).toHaveBeenCalledWith("user@example.com");
      expect(mockHashPassword).toHaveBeenCalledWith("SecurePass123!");
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: "newuser",
        email: "user@example.com",
        password: "hashed_password",
        first_name: "John",
        last_name: "Doe",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User registered successfully",
        })
      );
      expect(res.json.mock.calls[0][0].user.password).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject duplicate username", async () => {
      req.body = validUserData;
      mockFetchUserByUsername.mockResolvedValue({ username: "existinguser" });
      mockFetchUserByEmail.mockResolvedValue(null);

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Username or email already exists",
          statusCode: 409,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject duplicate email", async () => {
      req.body = validUserData;
      mockFetchUserByUsername.mockResolvedValue(null);
      mockFetchUserByEmail.mockResolvedValue({ email: "existing@example.com" });

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Username or email already exists",
          statusCode: 409,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.body = validUserData;
      mockFetchUserByUsername.mockResolvedValue(null);
      mockFetchUserByEmail.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue("hashed_password");
      mockCreateUser.mockRejectedValue(new Error("Database error"));

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const validLoginData = {
      email: "user@example.com",
      password: "SecurePass123!",
    };

    const mockUser = {
      _id: "user123",
      id: "user123",
      username: "testuser",
      email: "user@example.com",
      password: "hashed_password",
      is_admin: false,
    };

    const setupSuccessfulLogin = () => {
      mockFetchUserByEmail.mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(true);
    };

    it("should login user with valid credentials and return token", async () => {
      req.body = validLoginData;
      setupSuccessfulLogin();

      await login(req, res, next);

      expect(mockFetchUserByEmail).toHaveBeenCalledWith("user@example.com");
      expect(mockComparePassword).toHaveBeenCalledWith(
        "SecurePass123!",
        "hashed_password"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          token: expect.any(String),
        })
      );
      const response = res.json.mock.calls[0][0];
      expect(response.user.password).toBeUndefined();
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject login when user does not exist", async () => {
      req.body = validLoginData;
      mockFetchUserByEmail.mockResolvedValue(null);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid email or password",
          statusCode: 401,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject login when password does not match", async () => {
      req.body = validLoginData;
      mockFetchUserByEmail.mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(false);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid email or password",
          statusCode: 401,
        })
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      req.body = validLoginData;
      mockFetchUserByEmail.mockRejectedValue(new Error("Database error"));

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
