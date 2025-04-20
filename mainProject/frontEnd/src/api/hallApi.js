import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (config) => {
  let token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
  }

  // Kiểm tra token có hợp lệ không
  try {
    jwtDecode(token); // Chỉ kiểm tra định dạng token
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
  }

  const defaultConfig = {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...config.headers,
    },
  };

  try {
    const response = await axios(defaultConfig);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error("Không thể xác thực. Vui lòng đăng nhập lại.");
    }
    throw error;
  }
};

// Get all halls
export const getAllHalls = async () => {
  return makeAuthenticatedRequest({
    method: "GET",
    url: "https://localhost:8443/api/hall/all",
  });
};

// Get hall by ID
export const getHallById = async (hallId) => {
  return makeAuthenticatedRequest({
    method: "GET",
    url: `https://localhost:8443/api/hall/${hallId}`,
  });
};

// Create a new hall
export const createHall = async (hallData) => {
  return makeAuthenticatedRequest({
    method: "POST",
    url: "https://localhost:8443/api/hall/create",
    data: hallData,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Update a hall
export const updateHall = async (hallId, hallData) => {
  return makeAuthenticatedRequest({
    method: "PUT",
    url: `https://localhost:8443/api/hall/update/${hallId}`,
    data: hallData,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Delete a hall
export const deleteHall = async (hallId) => {
  return makeAuthenticatedRequest({
    method: "DELETE",
    url: `https://localhost:8443/api/hall/delete/${hallId}`,
  });
};