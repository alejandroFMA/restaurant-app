const isValidEmail = (email) => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

const isPasswordValid = (password) => {
  if (!password) return false;

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
};

const isValidLatLng = (latlng) => {
  if (!latlng) return false;
  if (typeof latlng !== "object") return false;
  if (typeof latlng.lat !== "number" || typeof latlng.lng !== "number")
    return false;
  return true;
};
export { isValidEmail, isPasswordValid, isValidLatLng };
