import api from "./config";

const login = async (email, password) => {
  const response = await api.post(`/auth/login`, { email, password });
  return response.data;
};

const register = async (user) => {
  const response = await api.post(`/auth/register`, user);
  return response.data;
};

export default { login, register };
