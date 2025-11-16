import {
  isValidEmail,
  isPasswordValid,
} from "../../../utils/checkUserFields.js";

describe("Validation Helpers", () => {
  describe("isValidEmail", () => {
    it.each([
      "user@example.com",
      "user@mail.example.com",
      "user.name+tag@example.co.uk",
      "user123@example456.com",
      "user_name@example.com",
    ])("should accept valid email: %s", (email) => {
      expect(isValidEmail(email)).toBe(true);
    });

    it.each([
      ["userexample.com", "without @"],
      ["user@", "without domain"],
      ["@example.com", "without local part"],
      ["user @example.com", "with space"],
      ["user@example", "without TLD"],
      ["", "empty string"],
      [null, "null"],
      [undefined, "undefined"],
    ])("should reject invalid email %s", (email, description) => {
      expect(isValidEmail(email)).toBe(false);
    });
  });

  describe("isPasswordValid", () => {
    it.each([
      "SecurePass123!",
      "MyP@ssw0rd",
      "VeryL0ngP@ssw0rdWith123Numbers",
      "Pass123!!##@@",
      "Test$ecure1Pass",
      "Pass1!ab",
      "Pass1!!!!",
      "Pass12345!",
      "aaaaaaaa1!",
    ])("should accept valid password: %s", (password) => {
      expect(isPasswordValid(password)).toBe(true);
    });

    it.each([
      ["Pass1!", "shorter than 8 characters"],
      ["SecurePass!", "without number"],
      ["SecurePass123", "without special character"],
      ["12345678", "only numbers"],
      ["abcdefghij", "only letters"],
      ["Pass 123!", "with space"],
      ["", "empty string"],
      [null, "null"],
      [undefined, "undefined"],
      ["Pass1!a", "7 characters"],
    ])("should reject weak password %s", (password, description) => {
      expect(isPasswordValid(password)).toBe(false);
    });
  });
});
