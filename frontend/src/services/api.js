import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Auth API Calls
export async function loginUser(credentials) {
  try {
    const res = await apiClient.post("/auth/login", credentials);
    if (res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
    }
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to log in. Please check backend API server.");
  }
}

export async function registerUser(userData) {
  try {
    const res = await apiClient.post("/auth/register", userData);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to register. Please check backend API server.");
  }
}

export async function verifyOtpApi({ email, otpCode }) {
  try {
    const res = await apiClient.post("/auth/verify-otp", { email, otpCode });
    if (res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
    }
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Invalid or expired OTP code!");
  }
}

export async function resendOtpApi({ email }) {
  try {
    const res = await apiClient.post("/auth/resend-otp", { email });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to resend OTP.");
  }
}

export async function updateUserProfile(profileData) {
  try {
    const res = await apiClient.put("/auth/profile", profileData);
    if (res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
    }
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to update profile.");
  }
}

// Ideas API Calls
export async function fetchAllIdeas() {
  try {
    const res = await apiClient.get("/ideas");
    return res.data;
  } catch (err) {
    console.warn("Backend API offline, reading from local fallback:", err.message);
    const cached = localStorage.getItem("idea360SubmittedIdeas");
    return cached ? JSON.parse(cached) : [];
  }
}

export async function postNewIdea(ideaData) {
  try {
    const res = await apiClient.post("/ideas", ideaData);
    return res.data;
  } catch (err) {
    console.warn("Backend API notice, saving to local fallback:", err.message);
    return null;
  }
}

export async function patchIdeaStatus(id, status, evaluatorNotes = "") {
  try {
    const res = await apiClient.patch(`/ideas/${id}/status`, { status, evaluatorNotes });
    return res.data;
  } catch (err) {
    console.warn("Backend API notice, updating local fallback:", err.message);
    return null;
  }
}
