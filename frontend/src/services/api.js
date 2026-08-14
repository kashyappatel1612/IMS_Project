import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor to inject JWT Bearer Token into headers automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API Calls
export async function loginUser(credentials) {
  try {
    const res = await apiClient.post("/auth/login", credentials);
    if (res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
    }
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      (err.message?.includes("Network Error")
        ? "Unable to connect to FastAPI backend server. Please make sure main.py is running."
        : "Failed to log in. Account not found or incorrect credentials.");
    throw new Error(errorMsg);
  }
}

export async function registerUser(userData) {
  try {
    const res = await apiClient.post("/auth/register", userData);
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to register account. Email might already exist.";
    throw new Error(errorMsg);
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
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Invalid or expired OTP code! Please check your email inbox.";
    throw new Error(errorMsg);
  }
}

export async function resendOtpApi({ email }) {
  try {
    const res = await apiClient.post("/auth/resend-otp", { email });
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to resend OTP code.";
    throw new Error(errorMsg);
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
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to update user profile.";
    throw new Error(errorMsg);
  }
}

// Ideas API Calls
export async function fetchAllIdeas() {
  try {
    const res = await apiClient.get("/ideas");
    return res.data;
  } catch (err) {
    console.warn("Backend API notice, reading from local cache:", err.message);
    const cached = localStorage.getItem("idea360SubmittedIdeas");
    return cached ? JSON.parse(cached) : [];
  }
}

export async function fetchMyAssignments() {
  try {
    const res = await apiClient.get("/my-assignments");
    return res.data;
  } catch (err) {
    console.warn("Backend API notice for my-assignments, reading from local cache:", err.message);
    const cached = localStorage.getItem("idea360SubmittedIdeas");
    return cached ? JSON.parse(cached) : [];
  }
}

export async function postNewIdea(ideaData) {
  try {
    const res = await apiClient.post("/ideas", ideaData);
    return res.data;
  } catch (err) {
    console.warn("Backend API notice, saving to local cache:", err.message);
    return null;
  }
}

export async function patchIdeaStatus(id, status, evaluatorNotes = "") {
  try {
    const res = await apiClient.patch(`/ideas/${id}/status`, { status, evaluatorNotes });
    return res.data;
  } catch (err) {
    console.warn("Backend API notice, updating local cache:", err.message);
    return null;
  }
}

export async function updateIdeaAllocationAPI(ideaId, allocationData) {
  try {
    const res = await apiClient.patch(`/ideas/${ideaId}/allocation`, allocationData);
    return res.data;
  } catch (err) {
    console.error("Failed to update allocation on backend:", err.message);
    throw err;
  }
}

// Role-Based Assignment API Calls
export async function fetchUsersByRole(role = "") {
  try {
    const res = await apiClient.get("/users/by-role", { params: { role } });
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch users by role:", err.message);
    return [];
  }
}

export async function createAssignmentAPI(assignmentData) {
  try {
    const res = await apiClient.post("/assignments", assignmentData);
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to assign user to workflow stage.";
    throw new Error(errorMsg);
  }
}

export async function fetchIdeaAssignmentHistory(ideaId) {
  try {
    const res = await apiClient.get(`/idea/${ideaId}/assignment`);
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch assignment history:", err.message);
    return [];
  }
}

export async function fetchNotificationsAPI() {
  try {
    const res = await apiClient.get("/notifications");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch notifications:", err.message);
    return { notifications: [], unreadCount: 0 };
  }
}

// Analysis Reports API Calls
export async function fetchAnalysisReports() {
  try {
    const res = await apiClient.get("/analysis-reports");
    return res.data;
  } catch (err) {
    console.warn("Backend API notice for analysis reports, reading from local cache:", err.message);
    const cached = localStorage.getItem("idea360AnalysisReports");
    return cached ? JSON.parse(cached) : [];
  }
}

export async function postAnalysisReport(reportData) {
  try {
    const res = await apiClient.post("/analysis-reports", reportData);
    return res.data;
  } catch (err) {
    console.warn("Backend API notice for post analysis report, fallback to local cache:", err.message);
    return null;
  }
}

export async function patchAnalysisReportStatus(id, status, pmNotes = "") {
  try {
    const res = await apiClient.patch(`/analysis-reports/${id}/status`, { status, pmNotes });
    return res.data;
  } catch (err) {
    console.warn("Backend API notice for report status patch, fallback to local cache:", err.message);
    return null;
  }
}

// Evaluators API Calls
export async function fetchEvaluators(domain = "", role = "") {
  try {
    const params = {};
    if (domain) params.domain = domain;
    if (role) params.role = role;
    const res = await apiClient.get("/evaluators", { params });
    return res.data;
  } catch (err) {
    console.warn("Backend API notice for evaluators, reading from local cache:", err.message);
    return null;
  }
}

export async function postEvaluator(evaluatorData) {
  try {
    const res = await apiClient.post("/evaluators", evaluatorData);
    return res.data;
  } catch (err) {
    console.warn("Backend API notice for post evaluator:", err.message);
    return null;
  }
}

// User Management API Calls
export async function fetchAdminUsers(params = {}) {
  try {
    const res = await apiClient.get("/admin/users", { params });
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch admin users from backend:", err.message);
    throw err;
  }
}

export async function createAdminUserRBAC(userData) {
  try {
    const res = await apiClient.post("/admin/users", userData);
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to create new user account.";
    throw new Error(errorMsg);
  }
}

export async function updateAdminUserRBAC(userId, userData) {
  try {
    const res = await apiClient.put(`/admin/users/${userId}`, userData);
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to update user details.";
    throw new Error(errorMsg);
  }
}

export async function updateAdminUserStatusRBAC(userId, status) {
  try {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to update account status.";
    throw new Error(errorMsg);
  }
}

export async function updateAdminUserRoleRBAC(userId, role) {
  try {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, { role });
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to update user role.";
    throw new Error(errorMsg);
  }
}

export async function resetAdminUserPasswordRBAC(userId, newPassword) {
  try {
    const res = await apiClient.post(`/admin/users/${userId}/reset-password`, { newPassword });
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to reset user password.";
    throw new Error(errorMsg);
  }
}

export async function deleteAdminUserRBAC(userId) {
  try {
    const res = await apiClient.delete(`/admin/users/${userId}`);
    return res.data;
  } catch (err) {
    const errorMsg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      "Failed to delete user account.";
    throw new Error(errorMsg);
  }
}

export async function fetchAdminDepartments() {
  try {
    const res = await apiClient.get("/admin/departments");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch departments:", err.message);
    return [];
  }
}

