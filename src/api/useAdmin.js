import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password) => {
      const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("isAdmin", "true");
        queryClient.invalidateQueries();
      }
    },
  });
};

export const useAdminLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return { success: true };

      const response = await fetch(`${API_BASE_URL}/auth/admin/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      return await response.json().catch(() => ({ success: true }));
    },
    onSuccess: () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdmin");
      queryClient.clear();
    },
  });
};

export const useVerifyAdminToken = () => {
  return useQuery({
    queryKey: ["adminTokenVerification"],
    queryFn: async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No token available");
      }

      const response = await fetch(`${API_BASE_URL}/auth/admin/verify`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Token verification failed");
      }

      return await response.json();
    },
    retry: false,
    enabled: !!localStorage.getItem("adminToken"),
    onError: () => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("isAdmin");
    },
  });
};

export const useGetRouteHistory = () => {
  return useQuery({
    queryKey: ["routeHistory"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/routes/history`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("Failed to fetch route history");
      }

      return await response.json();
    },
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    enabled: !!localStorage.getItem("adminToken"),
  });
};

export const useDeleteRouteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeId) => {
      const response = await fetch(`${API_BASE_URL}/admin/routes/${routeId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("Failed to delete route");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routeHistory"] });
    },
  });
};

export const useGetAlgorithmStatsAdmin = () => {
  return useQuery({
    queryKey: ["adminAlgorithmStats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/algorithms/stats`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("Failed to fetch algorithm stats");
      }

      return await response.json();
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: !!localStorage.getItem("adminToken"),
  });
};

export const useGetSystemStatus = () => {
  return useQuery({
    queryKey: ["systemStatus"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/system/status`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("Failed to fetch system status");
      }

      return await response.json();
    },
    staleTime: 30 * 1000,
    cacheTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled: !!localStorage.getItem("adminToken"),
  });
};

export const useGetSystemMetrics = () => {
  return useQuery({
    queryKey: ["systemMetrics"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/system/metrics`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("Failed to fetch system metrics");
      }

      return await response.json();
    },
    staleTime: 10 * 1000,
    cacheTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    enabled: !!localStorage.getItem("adminToken"),
  });
};

export const useGetSystemLogs = () => {
  return useQuery({
    queryKey: ["systemLogs"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/system/logs?limit=50`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("Failed to fetch system logs");
      }

      return await response.json();
    },
    staleTime: 15 * 1000,
    cacheTime: 2 * 60 * 1000,
    refetchInterval: 20 * 1000,
    enabled: !!localStorage.getItem("adminToken"),
  });
};

export const useManualSystemCheck = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/system/check`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("Manual system check failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemStatus"] });
      queryClient.invalidateQueries({ queryKey: ["systemMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["systemLogs"] });
    },
  });
};

export const useRestartAPI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/system/restart`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("API restart failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export const useGetAdminDashboard = () => {
  return useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("isAdmin");
          throw new Error("Authentication expired");
        }
        throw new Error("Failed to fetch admin dashboard data");
      }

      return await response.json();
    },
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    enabled: !!localStorage.getItem("adminToken"),
  });
};

export const useClearAdminCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/admin/cache/clear`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Cache clear failed");

      queryClient.invalidateQueries({ queryKey: ["routeHistory"] });
      queryClient.invalidateQueries({ queryKey: ["adminAlgorithmStats"] });
      queryClient.invalidateQueries({ queryKey: ["systemStatus"] });
      queryClient.invalidateQueries({ queryKey: ["systemMetrics"] });
      queryClient.invalidateQueries({ queryKey: ["systemLogs"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });

      return await response.json();
    },
  });
};
