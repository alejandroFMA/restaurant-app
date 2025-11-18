export const passwordValidator = (password) => {
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  const isValid = hasMinLength && hasNumber && hasSpecialChar;

  return {
    hasMinLength,
    hasNumber,
    hasSpecialChar,
    isValid,
  };
};
