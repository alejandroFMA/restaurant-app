import { jest } from "@jest/globals";

// Mock del repository
const mockCreateUser = jest.fn();
const mockFetchUserByEmail = jest.fn();
const mockFetchUserByUsername = jest.fn();
const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();
const mockIsValidEmail = jest.fn();
const mockIsPasswordValid = jest.fn();

jest.unstable_mockModule("../../../repository/users.repository.js", () => ({
  createUser: mockCreateUser,
  fetchUserByEmail: mockFetchUserByEmail,
  fetchUserByUsername: mockFetchUserByUsername,
}));

jest.unstable_mockModule("../../../utils/encryptPassword.js", () => ({
  hashPassword: mockHashPassword,
  comparePassword: mockComparePassword,
}));

jest.unstable_mockModule("../../../utils/checkUserFields.js", () => ({
  isValidEmail: mockIsValidEmail,
  isPasswordValid: mockIsPasswordValid,
}));

const { register, login } = await import(
  "../../../controllers/auth.controller.js"
);

describe("Auth Controller", () => {
  let req, res;

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
    mockIsValidEmail.mockReturnValue(true);
    mockIsPasswordValid.mockReturnValue(true);
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
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register user with valid data", async () => {
      req.body = validUserData;
      setupSuccessfulRegistration();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "User registered successfully",
        })
      );
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
      expect(res.json.mock.calls[0][0].user.password).toBeUndefined();
    });

    it.each([
      ["username"],
      ["email"],
      ["password"],
      ["first_name"],
      ["last_name"],
    ])("should reject registration when %s is missing", async (field) => {
      req.body = { ...validUserData };
      delete req.body[field];

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username, email, and password are required",
      });
    });

    it("should reject invalid email format", async () => {
      req.body = { ...validUserData, email: "invalid-email" };
      mockIsValidEmail.mockReturnValue(false);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email format",
      });
    });

    it("should reject weak password", async () => {
      req.body = { ...validUserData, password: "weak" };
      mockIsValidEmail.mockReturnValue(true);
      mockIsPasswordValid.mockReturnValue(false);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Password must be at least 8 characters long and include a number and a special character",
      });
    });

    it("should reject duplicate username", async () => {
      req.body = validUserData;
      mockIsValidEmail.mockReturnValue(true);
      mockIsPasswordValid.mockReturnValue(true);
      mockFetchUserByUsername.mockResolvedValue({ username: "existinguser" });
      mockFetchUserByEmail.mockResolvedValue(null);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username or email already exists",
      });
    });

    it("should reject duplicate email", async () => {
      req.body = validUserData;
      mockIsValidEmail.mockReturnValue(true);
      mockIsPasswordValid.mockReturnValue(true);
      mockFetchUserByUsername.mockResolvedValue(null);
      mockFetchUserByEmail.mockResolvedValue({ email: "existing@example.com" });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username or email already exists",
      });
    });

    it("should handle database errors", async () => {
      req.body = validUserData;
      mockIsValidEmail.mockReturnValue(true);
      mockIsPasswordValid.mockReturnValue(true);
      mockFetchUserByUsername.mockResolvedValue(null);
      mockFetchUserByEmail.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue("hashed_password");
      mockCreateUser.mockRejectedValue(new Error("Database error"));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Error registering user"),
        })
      );
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

      await login(req, res);

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
    });

    it("should reject login when email is missing", async () => {
      req.body = { ...validLoginData };
      delete req.body.email;

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and password are required",
      });
    });

    it("should reject login when password is missing", async () => {
      req.body = { ...validLoginData };
      delete req.body.password;

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and password are required",
      });
    });

    it("should reject login when user does not exist", async () => {
      req.body = validLoginData;
      mockFetchUserByEmail.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });

    it("should reject login when password does not match", async () => {
      req.body = validLoginData;
      mockFetchUserByEmail.mockResolvedValue(mockUser);
      mockComparePassword.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });

    it("should handle database errors", async () => {
      req.body = validLoginData;
      mockFetchUserByEmail.mockRejectedValue(new Error("Database error"));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining("Error logging in"),
        })
      );
    });
  });
});
