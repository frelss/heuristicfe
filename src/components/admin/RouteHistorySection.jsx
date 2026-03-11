import React, { useState, useMemo } from "react";
import toast from "../../utils/toast";

const RouteHistorySection = ({ routeHistory, isLoading, error, deleteRouteMutation }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterAlgorithm, setFilterAlgorithm] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 10;

  const algorithmColors = {
    hillClimb: "bg-green-100 text-green-800 border-green-200",
    genetic: "bg-purple-100 text-purple-800 border-purple-200",
    simulatedAnnealing: "bg-blue-100 text-blue-800 border-blue-200",
    none: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const algorithmNames = {
    hillClimb: "Hegymászó",
    genetic: "Genetikus",
    simulatedAnnealing: "Szimulált hűtés",
    none: "Nincs",
  };

  const formatExecutionTime = (ms) => {
    if (!ms || ms <= 0) return "—";
    if (ms < 1000) return `${Math.round(ms)} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
    return `${(ms / 60000).toFixed(1)} perc`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes} perc`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ó ${mins} p` : `${hours} óra`;
  };

  const processedData = useMemo(() => {
    let data = [...routeHistory];

    if (filterAlgorithm !== "all") {
      data = data.filter((route) => (route.algorithmType || "none") === filterAlgorithm);
    }

    data.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "createdAt") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (aVal === null || aVal === undefined) aVal = 0;
      if (bVal === null || bVal === undefined) bVal = 0;

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return data;
  }, [routeHistory, filterAlgorithm, sortField, sortDirection]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const handleDeleteRoute = async (id, routeName) => {
    const name = routeName || `#${id}`;
    const confirmed = await toast.confirmDelete(name);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteRouteMutation.mutateAsync(id);
      toast.success("Az útvonal törölve lett.", "Törlés kész");
    } catch (error) {
      console.error("Failed to delete route:", error);
      toast.error(error?.message || "Hiba az útvonal törlésekor.", "Törlés sikertelen");
    } finally {
      setDeletingId(null);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span className="text-gray-300 ml-1">↕</span>;
    }
    return <span className="text-blue-600 ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const uniqueAlgorithms = useMemo(() => {
    const algos = new Set(routeHistory.map((r) => r.algorithmType || "none"));
    return Array.from(algos);
  }, [routeHistory]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Útvonal Előzmények</h2>
          <p className="text-sm text-gray-500">
            {processedData.length} útvonal {filterAlgorithm !== "all" && `(${algorithmNames[filterAlgorithm] || filterAlgorithm})`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Algoritmus:</label>
          <select
            value={filterAlgorithm}
            onChange={(e) => {
              setFilterAlgorithm(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Összes</option>
            {uniqueAlgorithms.map((algo) => (
              <option key={algo} value={algo}>
                {algorithmNames[algo] || algo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">Hiba az útvonal előzmények betöltésekor: {error.message}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => handleSort("id")}>
                ID <SortIcon field="id" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => handleSort("createdAt")}>
                Dátum <SortIcon field="createdAt" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Útvonal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Algoritmus</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => handleSort("distance")}>
                Távolság <SortIcon field="distance" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase cursor-pointer hover:text-gray-700" onClick={() => handleSort("executionTime")}>
                Futási idő <SortIcon field="executionTime" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-500">Betöltés...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center">
                  <span className="text-4xl mb-2 block">🗺️</span>
                  <p className="text-gray-500">Nincsenek útvonal előzmények</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((route) => {
                const algoType = route.algorithmType || "none";
                const algoColor = algorithmColors[algoType] || algorithmColors.none;

                return (
                  <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-gray-600">#{route.id}</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{route.createdAt ? new Date(route.createdAt).toLocaleDateString("hu-HU") : "—"}</div>
                      <div className="text-xs text-gray-500">{route.createdAt ? new Date(route.createdAt).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }) : ""}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        {route.routeName && (
                          <div className="font-medium text-gray-900 truncate" title={route.routeName}>
                            {route.routeName}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 truncate" title={`${route.startPoint || route.start} → ${route.endPoint || route.end}`}>
                          {route.startPoint || route.start || "?"} → {route.endPoint || route.end || "?"}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${algoColor}`}>{algorithmNames[algoType] || algoType}</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{route.distance ? `${route.distance.toFixed(1)} km` : "—"}</div>
                      <div className="text-xs text-gray-500">{formatDuration(route.duration)}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{formatExecutionTime(route.executionTime)}</div>
                      {route.iterations && <div className="text-xs text-gray-500">{route.iterations} iteráció</div>}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteRoute(route.id, route.routeName)}
                        disabled={deletingId === route.id}
                        className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deletingId === route.id ? <span className="animate-spin mr-1">⏳</span> : <span className="mr-1">🗑️</span>}
                        Törlés
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, processedData.length)} / {processedData.length}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              ««
            </button>
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              «
            </button>

            <span className="px-4 py-1.5 text-sm font-medium">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteHistorySection;
