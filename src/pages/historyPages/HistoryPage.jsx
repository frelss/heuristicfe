import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { useGetSavedRoutes, useDeleteRoute, useSearchRoutes } from "../../api/useRoute";
import toast from "../../utils/toast";

const HistoryPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterAlgorithm, setFilterAlgorithm] = useState("all");
  const [filterTransport, setFilterTransport] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const [viewMode, setViewMode] = useState("cards");

  const getSavedRoutesMutation = useGetSavedRoutes();
  const deleteRouteMutation = useDeleteRoute();
  const searchRoutesMutation = useSearchRoutes();

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const result = await getSavedRoutesMutation.mutateAsync();
      const routesData = Array.isArray(result) ? result : [];
      setRoutes(routesData);
    } catch (error) {
      console.error("Failed to load routes:", error);
      setRoutes([]);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadRoutes();
      return;
    }

    setLoading(true);
    try {
      const result = await searchRoutesMutation.mutateAsync(searchTerm);
      const routesData = Array.isArray(result) ? result : [];
      setRoutes(routesData);
    } catch (error) {
      console.error("Search failed:", error);
      setRoutes([]);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    loadRoutes();
  };

  const handleDeleteRoute = async (route) => {
    const name = route?.routeName || `Útvonal #${route?.id}`;

    const confirmed = await toast.confirmDelete(name);
    if (!confirmed) return;

    try {
      await deleteRouteMutation.mutateAsync(route.id);
      setRoutes((prev) => prev.filter((r) => r.id !== route.id));
      toast.success("Az útvonal törölve lett.", "Törlés kész");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error?.message || "Nem sikerült törölni az útvonalat.", "Törlés sikertelen");
    }
  };

  const exportRoute = (route) => {
    const routeData = JSON.stringify(route, null, 2);
    const blob = new Blob([routeData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${route.routeName || `utvonal-${route.id}`}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const filteredRoutes = useMemo(() => {
    let result = [...routes];

    if (filterAlgorithm !== "all") {
      result = result.filter((r) => (r.algorithmType || "none") === filterAlgorithm);
    }

    if (filterTransport !== "all") {
      result = result.filter((r) => (r.transportMode || "car") === filterTransport);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
        case "date-asc":
          return new Date(a.createdDate || 0) - new Date(b.createdDate || 0);
        case "distance-desc":
          return (b.totalDistance || 0) - (a.totalDistance || 0);
        case "distance-asc":
          return (a.totalDistance || 0) - (b.totalDistance || 0);
        case "name":
          return (a.routeName || "").localeCompare(b.routeName || "");
        default:
          return 0;
      }
    });

    return result;
  }, [routes, filterAlgorithm, filterTransport, sortBy]);

  const stats = useMemo(() => {
    const algorithms = {};
    const transports = {};

    routes.forEach((r) => {
      const algo = r.algorithmType || "none";
      const trans = r.transportMode || "car";
      algorithms[algo] = (algorithms[algo] || 0) + 1;
      transports[trans] = (transports[trans] || 0) + 1;
    });

    return { algorithms, transports, total: routes.length };
  }, [routes]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Most";
    if (diffMins < 60) return `${diffMins} perce`;
    if (diffHours < 24) return `${diffHours} órája`;
    if (diffDays < 7) return `${diffDays} napja`;
    return "";
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return "—";
    const mins = Math.round(minutes);
    if (mins < 60) return `${mins} perc`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}ó ${remainingMins}p` : `${hours} óra`;
  };

  const algorithmInfo = {
    genetic: { name: "Genetikus", icon: "", color: "purple" },
    hillClimb: { name: "Hegymászó", icon: "", color: "green" },
    simulatedAnnealing: { name: "Szim. hűtés", icon: "", color: "blue" },
    none: { name: "Nincs", icon: "", color: "gray" },
  };

  const transportInfo = {
    car: { name: "Autó", icon: "" },
    bike: { name: "Bicikli", icon: "" },
    walk: { name: "Gyalog", icon: "" },
  };

  const getAlgorithmStyle = (algo) => {
    const info = algorithmInfo[algo] || algorithmInfo.none;
    const styles = {
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      green: "bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      gray: "bg-gray-100 text-gray-600 border-gray-200",
    };
    return styles[info.color] || styles.gray;
  };

  const RouteCard = ({ route }) => {
    const algo = algorithmInfo[route.algorithmType] || algorithmInfo.none;
    const transport = transportInfo[route.transportMode] || transportInfo.car;
    const relativeDate = formatRelativeDate(route.createdDate);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className={`h-1.5 ${algo.color === "purple" ? "bg-purple-500" : algo.color === "green" ? "bg-green-500" : algo.color === "blue" ? "bg-blue-500" : "bg-gray-400"}`}></div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate" title={route.routeName}>
                {route.routeName || `Útvonal #${route.id}`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(route.createdDate)}
                {relativeDate && <span className="ml-1 text-gray-400">({relativeDate})</span>}
              </p>
            </div>
            <span className="text-xl ml-2">{transport.icon}</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center text-sm">
              <span className="text-green-500 mr-2">●</span>
              <span className="text-gray-700 truncate">{route.startPointName || "Kezdőpont"}</span>
            </div>
            {route.waypointCount > 0 && (
              <div className="flex items-center text-xs text-gray-500 ml-5 my-1">
                <span className="mr-1">↓</span>
                {route.waypointCount} útpont
              </div>
            )}
            <div className="flex items-center text-sm">
              <span className="text-red-500 mr-2">●</span>
              <span className="text-gray-700 truncate">{route.endPointName || "Célpont"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-800">{route.totalDistance ? route.totalDistance.toFixed(1) : "0"} km</p>
              <p className="text-xs text-gray-500">Távolság</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-lg font-bold text-gray-800">{formatDuration(route.totalDuration)}</p>
              <p className="text-xs text-gray-500">Időtartam</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getAlgorithmStyle(route.algorithmType)}`}>
              <span className="mr-1">{algo.icon}</span>
              {algo.name}
            </span>
          </div>

          <div className="flex gap-2">
            <Link to={`/map?routeId=${route.id}`} className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg text-center transition-colors">
              Megnyitás
            </Link>
            <button onClick={() => exportRoute(route)} className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Exportálás">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button onClick={() => handleDeleteRoute(route)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Törlés">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mentett útvonalak</h1>
          <p className="text-gray-500 mt-1">{stats.total} útvonal összesen</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Útvonal keresése..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchTerm && (
                  <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div>
              <select value={filterAlgorithm} onChange={(e) => setFilterAlgorithm(e.target.value)} className="w-full lg:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="all">Összes algoritmus</option>
                <option value="genetic">Genetikus</option>
                <option value="hillClimb">Hegymászó</option>
                <option value="simulatedAnnealing">Szim. hűtés</option>
              </select>
            </div>

            <div>
              <select value={filterTransport} onChange={(e) => setFilterTransport(e.target.value)} className="w-full lg:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="all">Összes közlekedés</option>
                <option value="car">Autó</option>
                <option value="bike">Bicikli</option>
                <option value="walk">Gyalog</option>
              </select>
            </div>

            <div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full lg:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="date-desc">Legújabb elöl</option>
                <option value="date-asc">Legrégebbi elöl</option>
                <option value="distance-desc">Leghosszabb elöl</option>
                <option value="distance-asc">Legrövidebb elöl</option>
                <option value="name">Név szerint</option>
              </select>
            </div>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("cards")} className={`px-3 py-2 ${viewMode === "cards" ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`} title="Kártya nézet">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button onClick={() => setViewMode("table")} className={`px-3 py-2 ${viewMode === "table" ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`} title="Táblázat nézet">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {(filterAlgorithm !== "all" || filterTransport !== "all" || searchTerm) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">Aktív szűrők:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  "{searchTerm}"
                  <button onClick={clearSearch} className="ml-1 hover:text-blue-900">
                    ×
                  </button>
                </span>
              )}
              {filterAlgorithm !== "all" && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  {algorithmInfo[filterAlgorithm]?.name}
                  <button onClick={() => setFilterAlgorithm("all")} className="ml-1 hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
              {filterTransport !== "all" && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  {transportInfo[filterTransport]?.name}
                  <button onClick={() => setFilterTransport("all")} className="ml-1 hover:text-green-900">
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setFilterAlgorithm("all");
                  setFilterTransport("all");
                  clearSearch();
                }}
                className="text-xs text-gray-500 hover:text-gray-700 ml-2"
              >
                Összes törlése
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-3 text-gray-500">Útvonalak betöltése...</span>
          </div>
        ) : filteredRoutes.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {filteredRoutes.length} útvonal{filteredRoutes.length !== routes.length && ` (${routes.length}-ból szűrve)`}
            </p>

            {viewMode === "cards" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRoutes.map((route) => (
                  <RouteCard key={route.id} route={route} />
                ))}
              </div>
            )}

            {viewMode === "table" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Név</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Útvonal</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Algoritmus</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Táv / Idő</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dátum</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Műveletek</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRoutes.map((route) => {
                        const algo = algorithmInfo[route.algorithmType] || algorithmInfo.none;
                        const transport = transportInfo[route.transportMode] || transportInfo.car;

                        return (
                          <tr key={route.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span>{transport.icon}</span>
                                <span className="font-medium text-gray-900 truncate max-w-[150px]">{route.routeName || `#${route.id}`}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <span className="text-gray-700">{route.startPointName || "?"}</span>
                                <span className="text-gray-400 mx-1">→</span>
                                <span className="text-gray-700">{route.endPointName || "?"}</span>
                                {route.waypointCount > 0 && <span className="text-xs text-blue-600 ml-1">+{route.waypointCount}</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getAlgorithmStyle(route.algorithmType)}`}>
                                {algo.icon} {algo.name}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <span className="font-medium">{route.totalDistance?.toFixed(1) || 0} km</span>
                                <span className="text-gray-400 mx-1">·</span>
                                <span className="text-gray-500">{formatDuration(route.totalDuration)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(route.createdDate)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Link to={`/map?routeId=${route.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Megnyitás">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </Link>
                                <button onClick={() => exportRoute(route)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Export">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </button>
                                <button onClick={() => handleDeleteRoute(route)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Törlés">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <span className="text-5xl mb-4 block">🗺️</span>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{searchTerm || filterAlgorithm !== "all" || filterTransport !== "all" ? "Nincs találat" : "Nincsenek mentett útvonalak"}</h2>
            <p className="text-gray-500 mb-6">{searchTerm || filterAlgorithm !== "all" || filterTransport !== "all" ? "Próbálj más szűrési feltételeket." : "Mentsd el az első útvonaladat a térkép oldalon."}</p>
            <Link to="/map" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              🗺️ Ugrás a térképre
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
