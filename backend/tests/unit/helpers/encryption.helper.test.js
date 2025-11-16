import {
  hashPassword,
  comparePassword,
} from "../../../utils/encryptPassword.js";

describe("Encryption Helpers", () => {
  describe("hashPassword", () => {
    it("should hash password and return different string", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).not.toEqual(password);
      expect(typeof hashedPassword).toBe("string");
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it("should hash same password to different values each time", async () => {
      const password = "TestPassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toEqual(hash2);
      expect(hash1).not.toEqual(password);
      expect(hash2).not.toEqual(password);
    });

    it("should return bcrypt-formatted hash", async () => {
      const password = "SecurePass123!";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    });
  });

  describe("comparePassword", () => {
    let hashedPassword;
    const originalPassword = "TestPassword123!";

    beforeAll(async () => {
      hashedPassword = await hashPassword(originalPassword);
    });

    it("should return true when password matches hash", async () => {
      const result = await comparePassword(originalPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it("should return true for different hashes of same password", async () => {
      const newHash = await hashPassword(originalPassword);
      const result = await comparePassword(originalPassword, newHash);
      expect(result).toBe(true);
    });

    it.each(["SecurePass123!", "AnotherP@ss999", "Test$Password2023"])(
      "should return true for password: %s",
      async (password) => {
        const hash = await hashPassword(password);
        const result = await comparePassword(password, hash);
        expect(result).toBe(true);
      }
    );

    it("should correctly verify password in realistic workflow", async () => {
      const userPassword = "SecureLogin123!";
      const stored = await hashPassword(userPassword);
      const isValid = await comparePassword(userPassword, stored);

      expect(isValid).toBe(true);
    });

    it("should handle multiple users with different passwords", async () => {
      const user1Pwd = "User1Pass123!";
      const user2Pwd = "User2Pass456!";

      const user1Hash = await hashPassword(user1Pwd);
      const user2Hash = await hashPassword(user2Pwd);

      expect(await comparePassword(user1Pwd, user1Hash)).toBe(true);
      expect(await comparePassword(user2Pwd, user2Hash)).toBe(true);
      expect(await comparePassword(user1Pwd, user2Hash)).toBe(false);
      expect(await comparePassword(user2Pwd, user1Hash)).toBe(false);
    });
  });
});
