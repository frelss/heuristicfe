import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://heuristicbe.onrender.com/api";

export const useSubmitBugReport = () => {
  return useMutation({
    mutationFn: async (bugReportData) => {
      const response = await fetch(`${API_BASE_URL}/bugs/report`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bugReportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hiba a bejelentés küldésekor");
      }

      return await response.json();
    },
  });
};

export const useGetAllBugReports = () => {
  return useQuery({
    queryKey: ["bugReports", "all"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/all`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bug reports");
      }

      return await response.json();
    },
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};

export const useGetBugReportsByStatus = (status) => {
  return useQuery({
    queryKey: ["bugReports", "status", status],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/status/${status}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bug reports by status");
      }

      return await response.json();
    },
    enabled: !!status && status !== "all",
    staleTime: 30 * 1000,
  });
};

export const useGetActiveBugReports = () => {
  return useQuery({
    queryKey: ["bugReports", "active"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/active`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch active bug reports");
      }

      return await response.json();
    },
    staleTime: 30 * 1000,
  });
};

export const useGetHighPriorityReports = () => {
  return useQuery({
    queryKey: ["bugReports", "highPriority"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/high-priority`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch high priority bug reports");
      }

      return await response.json();
    },
    staleTime: 30 * 1000,
  });
};

export const useGetBugReportById = (id) => {
  return useQuery({
    queryKey: ["bugReports", "detail", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bug report details");
      }

      return await response.json();
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};

export const useUpdateBugReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/${id}/status`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hiba a státusz frissítésekor");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    },
  });
};

export const useUpdateAdminNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }) => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/${id}/notes`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hiba az admin jegyzet frissítésekor");
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bugReports", "detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    },
  });
};

export const useDeleteBugReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hiba a hibabejelentés törlésekor");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    },
  });
};

export const useSearchBugReports = () => {
  return useMutation({
    mutationFn: async (searchTerm) => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/search?q=${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      return await response.json();
    },
  });
};

export const useGetBugReportStats = () => {
  return useQuery({
    queryKey: ["bugReports", "stats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bugs/admin/stats`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bug report statistics");
      }

      return await response.json();
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useGetBugReportEnums = () => {
  return useQuery({
    queryKey: ["bugReports", "enums"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/bugs/enums`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bug report enums");
      }

      return await response.json();
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });
};
