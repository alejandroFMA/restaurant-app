import { jest } from "@jest/globals";

const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();
const mockUserFindById = jest.fn();
const mockUserFind = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();
const mockUserFindByIdAndDelete = jest.fn();
const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();
const mockIsValidEmail = jest.fn();
const mockIsPasswordValid = jest.fn();
const mockJwtSign = jest.fn();

const mockUserModel = {
  findOne: (query) => {
    const result = mockUserFindOne(query);

    let promise;
    if (result && typeof result.then === "function") {
      promise = result;
    } else {
      promise = Promise.resolve(result);
    }
    promise.select = jest.fn((field) => {
      return promise;
    });

    return promise;
  },
  create: mockUserCreate,
  findById: (id) => mockUserFindById(id),
  find: () => mockUserFind(),
  findByIdAndUpdate: (id, data, options) =>
    mockUserFindByIdAndUpdate(id, data, options),
  findByIdAndDelete: (id) => mockUserFindByIdAndDelete(id),
};

jest.unstable_mockModule("../../../models/User.model.js", () => ({
  default: mockUserModel,
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
    toObject: jest.fn(function () {
      return { ...this };
    }),
  };

  const setupSuccessfulRegistration = () => {
    mockIsValidEmail.mockReturnValue(true);
    mockIsPasswordValid.mockReturnValue(true);
    const nullPromise = Promise.resolve(null);
    mockUserFindOne.mockReturnValue(nullPromise);
    mockHashPassword.mockResolvedValue("hashed_password");
    mockUserCreate.mockResolvedValue(mockSavedUser);
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
      expect(mockHashPassword).toHaveBeenCalledWith("SecurePass123!");
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

    it.each([
      ["username", { username: "existinguser" }],
      ["email", { email: "existing@example.com" }],
    ])("should reject duplicate %s", async (field, existingUser) => {
      req.body = validUserData;
      mockIsValidEmail.mockReturnValue(true);
      mockIsPasswordValid.mockReturnValue(true);
      const userPromise = Promise.resolve(existingUser);
      mockUserFindOne.mockReturnValue(userPromise);

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
      const nullPromise = Promise.resolve(null);
      mockUserFindOne.mockReturnValue(nullPromise);
      mockHashPassword.mockResolvedValue("hashed_password");
      mockUserCreate.mockRejectedValue(new Error("Database error"));

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
      const userPromise = Promise.resolve(mockUser);
      mockUserFindOne.mockReturnValue(userPromise);
      mockComparePassword.mockResolvedValue(true);
    };

    it("should login user with valid credentials and return token", async () => {
      req.body = validLoginData;
      setupSuccessfulLogin();

      await login(req, res);

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

    it.each([["email"], ["password"]])(
      "should reject login when %s is missing",
      async (field) => {
        req.body = { ...validLoginData };
        delete req.body[field];

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Email and password are required",
        });
      }
    );

    it.each([
      ["user does not exist", null, true],
      ["password does not match", mockUser, false],
    ])("should reject login when %s", async (_, user, passwordValid) => {
      req.body = validLoginData;
      if (user === null) {
        const nullPromise = Promise.resolve(null);
        mockUserFindOne.mockReturnValue(nullPromise);
      } else {
        const userPromise = Promise.resolve(user);
        mockUserFindOne.mockReturnValue(userPromise);
      }
      mockComparePassword.mockResolvedValue(passwordValid);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });

    it("should handle database errors", async () => {
      req.body = validLoginData;
      mockUserFindOne.mockReturnValue(
        Promise.reject(new Error("Database error"))
      );

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
