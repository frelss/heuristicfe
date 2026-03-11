import { useMutation, useQuery } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://heuristicbe.onrender.com/api";

export const useTestBackend = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Backend test failed");
      }

      return await response.text();
    },
  });
};

export const useGeocode = () => {
  return useMutation({
    mutationFn: async (searchTerm) => {
      const response = await fetch(`${API_BASE_URL}/geocode?query=${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useCalculateRoute = () => {
  return useMutation({
    mutationFn: async ({ coordinates, algorithm, algorithmParams, transportMode, avoidHighways, avoidTolls }) => {
      console.log("Calculating route with:", { coordinates, algorithm, algorithmParams, transportMode, avoidHighways, avoidTolls });

      const requestBody = {
        coordinates,
        algorithm,
        algorithmParams: algorithmParams || {},
        transportMode,
        avoidHighways,
        avoidTolls,
      };

      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      const response = await fetch(`${API_BASE_URL}/calculate-route`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend API Error:", errorText);
        console.error("Response status:", response.status);
        console.error("Response headers:", response.headers);
        throw new Error(`Route calculation failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useSaveRoute = () => {
  return useMutation({
    mutationFn: async (routeData) => {
      const response = await fetch(`${API_BASE_URL}/routes/save`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Save route API Error:", errorText);
        throw new Error(`Save route failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useGetSavedRoutes = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/routes/list`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch saved routes");
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useGetRouteById = () => {
  return useMutation({
    mutationFn: async (routeId) => {
      const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch route details");
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useDeleteRoute = () => {
  return useMutation({
    mutationFn: async (routeId) => {
      const response = await fetch(`${API_BASE_URL}/routes/${routeId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete route");
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useSearchRoutes = () => {
  return useMutation({
    mutationFn: async (searchTerm) => {
      const response = await fetch(`${API_BASE_URL}/routes/search?q=${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useAlgorithmPerformance = () => {
  return useQuery({
    queryKey: ["algorithmPerformance"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/algorithms/performance`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch algorithm performance");
      }

      return await response.json();
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useCompareAlgorithms = () => {
  return useMutation({
    mutationFn: async ({ algorithms = ["hillClimb", "genetic", "simulatedAnnealing"], metric = "overall" }) => {
      const algorithmsParam = Array.isArray(algorithms) ? algorithms.join(",") : algorithms;
      const response = await fetch(`${API_BASE_URL}/algorithms/compare?algorithms=${encodeURIComponent(algorithmsParam)}&metric=${encodeURIComponent(metric)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to compare algorithms");
      }

      return await response.json();
    },
  });
};

export const useAlgorithmRankings = () => {
  return useMutation({
    mutationFn: async (criteria = "overall") => {
      const response = await fetch(`${API_BASE_URL}/algorithms/rankings?criteria=${encodeURIComponent(criteria)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch algorithm rankings");
      }

      return await response.json();
    },
  });
};

export const usePerformanceTrends = () => {
  return useMutation({
    mutationFn: async ({ algorithm, days = 30 }) => {
      const response = await fetch(`${API_BASE_URL}/algorithms/trends/${encodeURIComponent(algorithm)}?days=${days}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch performance trends");
      }

      return await response.json();
    },
  });
};

export const useDetailedAlgorithmStats = () => {
  return useMutation({
    mutationFn: async (algorithm) => {
      const response = await fetch(`${API_BASE_URL}/algorithms/stats/${encodeURIComponent(algorithm)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch detailed algorithm stats");
      }

      return await response.json();
    },
  });
};

export const useUsageStats = () => {
  return useQuery({
    queryKey: ["usageStats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/algorithms/usage-stats`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch usage stats");
      }

      return await response.json();
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useBestAlgorithm = () => {
  return useMutation({
    mutationFn: async (criteria = "overall") => {
      const response = await fetch(`${API_BASE_URL}/algorithms/best?criteria=${encodeURIComponent(criteria)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch best algorithm");
      }

      return await response.json();
    },
  });
};
