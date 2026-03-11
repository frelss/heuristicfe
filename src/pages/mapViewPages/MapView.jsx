import React, { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useSearchParams } from "react-router";

import MapSidebar from "../../components/map/MapSidebar";
import { RouteDetailsModal, SaveRouteModal } from "../../components";

import { markerIcons, markerTypeInfo, createNumberedWaypointIcon, createDualNumberedIcon } from "../../utils/markerIcons";
import slovakiaCities from "../../utils/slovakCities";
import { generateSmartRouteAdvanced, addSmartWaypoint } from "../../components/map/SmartRouteGenerator";
import toast from "../../utils/toast";

import { useCalculateRoute, useGetRouteById } from "../../api/useRoute";

function MapClickHandler({ onMapClick, enabled }) {
  useMapEvents({
    click: (e) => {
      if (enabled) onMapClick(e);
    },
  });
  return null;
}

function MapFocusController({ route, startPoint, endPoint, waypoints }) {
  const map = useMap();

  useEffect(() => {
    if (route?.path?.length > 0) {
      const bounds = L.latLngBounds(route.path);
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 15 });
    } else if (startPoint && endPoint) {
      const points = [startPoint, endPoint, ...waypoints];
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [map, route, startPoint, endPoint, waypoints]);

  return null;
}

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 z-[1000] text-xs">
      <h4 className="font-bold mb-2 text-gray-800">Jelmagyarázat</h4>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Kezdőpont</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Célpont</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Útpont</span>
        </div>
      </div>
    </div>
  );
}

function MapModeIndicator({ mode }) {
  return (
    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-xl shadow-lg px-3 py-2 z-[1000]">
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2.5 h-2.5 rounded-full ${mode === "click" ? "bg-green-500" : "bg-blue-500"}`}></div>
        <span className="font-medium">{mode === "click" ? "Térkép kattintás" : "Címkeresés"}</span>
      </div>
    </div>
  );
}

const MapView = () => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [startPointName, setStartPointName] = useState(null);
  const [endPointName, setEndPointName] = useState(null);
  const [waypointNames, setWaypointNames] = useState([]);

  const [pointSelectionMode, setPointSelectionMode] = useState("search");
  const [transportMode, setTransportMode] = useState("car");
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [routeStrategy, setRouteStrategy] = useState("mixed");

  const [selectedAlgorithm, setSelectedAlgorithm] = useState("none");
  const [algorithmParams, setAlgorithmParams] = useState({});

  const [route, setRoute] = useState(null);
  const [routeStyle] = useState({ color: "#3B82F6", weight: 5, opacity: 0.7 });
  const [currentRouteRequest, setCurrentRouteRequest] = useState(null);

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [searchParams] = useSearchParams();

  const calculateRouteMutation = useCalculateRoute();
  const getRouteByIdMutation = useGetRouteById();

  useEffect(() => {
    const routeId = searchParams.get("routeId");
    if (routeId) loadSavedRoute(routeId);
  }, [searchParams]);

  const handleMapClick = useCallback(
    (e) => {
      if (pointSelectionMode !== "click") return;
      const { lat, lng } = e.latlng;

      if (!startPoint) {
        setStartPoint([lat, lng]);
        setStartPointName(null);
        toast.info("Kezdőpont beállítva");
      } else if (!endPoint) {
        setEndPoint([lat, lng]);
        setEndPointName(null);
        toast.info("Célpont beállítva");
      } else {
        setWaypoints((prev) => [...prev, [lat, lng]]);
        setWaypointNames((prev) => [...prev, null]);
        toast.info(`${waypoints.length + 1}. útpont hozzáadva`);
      }
    },
    [startPoint, endPoint, pointSelectionMode, waypoints.length],
  );

  const handleLocationSelect = (type, location, name = null) => {
    if (pointSelectionMode !== "search") return;

    if (type === "start") {
      setStartPoint(location);
      setStartPointName(name);
    } else if (type === "end") {
      setEndPoint(location);
      setEndPointName(name);
    }

    if (route) setRoute(null);
  };

  const clearStartPoint = () => {
    setStartPoint(null);
    setStartPointName(null);
    if (route) setRoute(null);
  };

  const clearEndPoint = () => {
    setEndPoint(null);
    setEndPointName(null);
    if (route) setRoute(null);
  };

  const clearWaypoint = (index) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
    setWaypointNames((prev) => prev.filter((_, i) => i !== index));
    if (route) setRoute(null);
  };

  const clearAllPoints = () => {
    setStartPoint(null);
    setEndPoint(null);
    setStartPointName(null);
    setEndPointName(null);
    setWaypoints([]);
    setWaypointNames([]);
    setRoute(null);
    toast.info("Minden pont törölve");
  };

  const addWaypoint = (location, name = null) => {
    setWaypoints((prev) => [...prev, location]);
    setWaypointNames((prev) => [...prev, name]);
    if (route) setRoute(null);
  };

  const removeWaypoint = (index) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
    setWaypointNames((prev) => prev.filter((_, i) => i !== index));
    if (route) setRoute(null);
  };

  const clearAllWaypoints = () => {
    setWaypoints([]);
    setWaypointNames([]);
    if (route) setRoute(null);
  };

  const generateSmartRoute = (waypointCount) => {
    const result = generateSmartRouteAdvanced(waypointCount, slovakiaCities, setStartPoint, setEndPoint, setWaypoints, setRoute, routeStrategy, setWaypointNames);

    if (result) {
      setStartPointName(result.start?.name || null);
      setEndPointName(result.end?.name || null);
    }
  };

  const addOneSmartWaypoint = () => {
    addSmartWaypoint(startPoint, endPoint, waypoints, waypointNames, slovakiaCities, setWaypoints, setWaypointNames, setRoute);
  };

  const handleFindRoute = async () => {
    if (!startPoint || !endPoint) {
      toast.warning("Válassz kezdő és végpontot!");
      return;
    }

    try {
      const coordinates = [[startPoint[1], startPoint[0]], ...waypoints.map((w) => [w[1], w[0]]), [endPoint[1], endPoint[0]]];

      const requestData = {
        coordinates,
        algorithm: selectedAlgorithm,
        algorithmParams,
        transportMode,
        avoidHighways,
        avoidTolls,
      };

      const result = await calculateRouteMutation.mutateAsync(requestData);

      setRoute({
        path: result.coordinates || [startPoint, ...waypoints, endPoint],
        distance: result.distance || 0,
        duration: result.duration || 0,
        algorithmStats: result.algorithmStats || { executionTime: 0, memoryUsage: "0MB", iterations: 0 },
        comparison: result.comparison,
        algorithmDetails: result.algorithmDetails,
        optimizationLog: result.optimizationLog,
        originalWaypointOrder: result.originalWaypointOrder,
        optimizedWaypointOrder: result.optimizedWaypointOrder,
      });

      setCurrentRouteRequest({
        ...requestData,
        waypoints,
        startPointName: startPointName || "Kezdőpont",
        endPointName: endPointName || "Célpont",
      });

      const improvement = result.comparison?.distanceImprovement;
      if (improvement && improvement > 0) {
        toast.success(`Útvonal kiszámítva! ${improvement.toFixed(1)}% javulás`);
      } else {
        toast.success(`Útvonal kiszámítva: ${result.distance} km`);
      }
    } catch (error) {
      console.error("Route calculation failed:", error);

      const errorMessage = error.message || "Ismeretlen hiba";
      if (errorMessage.includes("routable point")) {
        toast.error("Egy vagy több pont nem található út közelében. Próbálj más pontokat!");
      } else {
        toast.error("Hiba történt az útvonal számítása közben.");
      }
    }
  };

  const loadSavedRoute = async (routeId) => {
    try {
      const saved = await getRouteByIdMutation.mutateAsync(routeId);

      if (saved.coordinates?.length >= 2) {
        setStartPoint([saved.coordinates[0][0], saved.coordinates[0][1]]);
        setEndPoint([saved.coordinates[saved.coordinates.length - 1][0], saved.coordinates[saved.coordinates.length - 1][1]]);
      }

      setStartPointName(saved.startPointName || null);
      setEndPointName(saved.endPointName || null);

      if (Array.isArray(saved.waypoints)) {
        const converted = saved.waypoints
          .map((wp) => {
            if (Array.isArray(wp) && wp.length >= 2) return wp;
            if (wp?.latitude !== undefined) return [wp.latitude, wp.longitude];
            return null;
          })
          .filter(Boolean);
        setWaypoints(converted);

        const names = saved.waypoints.map((wp) => wp?.name || null);
        setWaypointNames(names);
      }

      setSelectedAlgorithm(saved.algorithmType || "none");
      setTransportMode(saved.transportMode || "car");
      setAvoidHighways(!!saved.avoidHighways);
      setAvoidTolls(!!saved.avoidTolls);

      if (saved.coordinates?.length > 0) {
        const stats = saved.statistics || {};

        let optimizationLog = stats.optimizationLog || [];
        if (typeof optimizationLog === "string") {
          try {
            optimizationLog = JSON.parse(optimizationLog);
          } catch (e) {
            console.error("Failed to parse optimizationLog:", e);
            optimizationLog = [];
          }
        }

        let originalWaypointOrder = stats.originalWaypointOrder || [];
        if (typeof originalWaypointOrder === "string") {
          try {
            originalWaypointOrder = JSON.parse(originalWaypointOrder);
          } catch (e) {
            console.error("Failed to parse originalWaypointOrder:", e);
            originalWaypointOrder = [];
          }
        }

        let optimizedWaypointOrder = stats.optimizedWaypointOrder || [];
        if (typeof optimizedWaypointOrder === "string") {
          try {
            optimizedWaypointOrder = JSON.parse(optimizedWaypointOrder);
          } catch (e) {
            console.error("Failed to parse optimizedWaypointOrder:", e);
            optimizedWaypointOrder = [];
          }
        }

        let algorithmDetails = stats.algorithmDetails || null;
        if (typeof algorithmDetails === "string") {
          try {
            algorithmDetails = JSON.parse(algorithmDetails);
          } catch (e) {
            console.error("Failed to parse algorithmDetails:", e);
            algorithmDetails = null;
          }
        }

        let comparison = stats.comparison || null;
        if (typeof comparison === "string") {
          try {
            comparison = JSON.parse(comparison);
          } catch (e) {
            console.error("Failed to parse comparison:", e);
            comparison = null;
          }
        }

        const algorithmStats = {
          executionTime: stats.executionTimeMs || 0,
          memoryUsage: stats.memoryUsage || "N/A",
          iterations: stats.iterations || 0,
          originalDistance: stats.originalDistance,
          optimizedDistance: stats.optimizedDistance,
          improvementPercent: stats.improvementPercent,
        };

        const routeState = {
          path: saved.coordinates,
          distance: saved.totalDistance ?? 0,
          duration: saved.totalDuration ?? 0,
          algorithmStats: algorithmStats,
          comparison: comparison,
          algorithmDetails: algorithmDetails,
          optimizationLog: optimizationLog,
          originalWaypointOrder: originalWaypointOrder,
          optimizedWaypointOrder: optimizedWaypointOrder,
        };

        setRoute(routeState);
      }

      toast.success(`"${saved.routeName || "Útvonal"}" betöltve`);
    } catch (error) {
      console.error("Failed to load saved route:", error);
      toast.error("Hiba történt a mentett útvonal betöltésekor.");
    }
  };

  const formatCoordinates = (coords) => {
    if (!coords) return "?";
    if (Array.isArray(coords) && coords.length >= 2) {
      return `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
    }
    return "?";
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">
      <div className="flex-1 relative">
        <MapContainer center={[48.14816, 17.10674]} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />

          <MapClickHandler onMapClick={handleMapClick} enabled={pointSelectionMode === "click"} />
          <MapFocusController route={route} startPoint={startPoint} endPoint={endPoint} waypoints={waypoints} />

          {startPoint && (
            <Marker position={startPoint} icon={markerIcons.start}>
              <Popup>
                <div className="text-center p-2">
                  {startPointName && <p className="font-bold text-green-700">{startPointName}</p>}
                  <p className="text-sm text-green-600">{markerTypeInfo.start.label}</p>
                  <p className="text-xs text-gray-500 my-2">{formatCoordinates(startPoint)}</p>
                  <button onClick={clearStartPoint} className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600">
                    Törlés
                  </button>
                </div>
              </Popup>
            </Marker>
          )}

          {endPoint && (
            <Marker position={endPoint} icon={markerIcons.end}>
              <Popup>
                <div className="text-center p-2">
                  {endPointName && <p className="font-bold text-red-700">{endPointName}</p>}
                  <p className="text-sm text-red-600">{markerTypeInfo.end.label}</p>
                  <p className="text-xs text-gray-500 my-2">{formatCoordinates(endPoint)}</p>
                  <button onClick={clearEndPoint} className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600">
                    Törlés
                  </button>
                </div>
              </Popup>
            </Marker>
          )}

          {waypoints.map((waypoint, index) => {
            const position = Array.isArray(waypoint) ? waypoint : [waypoint.latitude, waypoint.longitude];
            const icon = route?.optimizedWaypointOrder ? createDualNumberedIcon(index, route.optimizedWaypointOrder.indexOf(index)) : createNumberedWaypointIcon(index + 1, false);

            return (
              <Marker key={index} position={position} icon={icon}>
                <Popup>
                  <div className="text-center p-2">
                    {waypointNames[index] && <p className="font-bold text-blue-700">{waypointNames[index]}</p>}
                    <p className="text-sm text-blue-600">Útpont {index + 1}</p>
                    <p className="text-xs text-gray-500 my-2">{formatCoordinates(position)}</p>
                    <button onClick={() => clearWaypoint(index)} className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600">
                      Törlés
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {route && <Polyline positions={route.path} pathOptions={routeStyle} />}
        </MapContainer>

        <MapLegend />
        <MapModeIndicator mode={pointSelectionMode} />
      </div>

      <MapSidebar
        pointSelectionMode={pointSelectionMode}
        onModeChange={setPointSelectionMode}
        transportMode={transportMode}
        onTransportModeChange={setTransportMode}
        avoidHighways={avoidHighways}
        onAvoidHighwaysChange={setAvoidHighways}
        avoidTolls={avoidTolls}
        onAvoidTollsChange={setAvoidTolls}
        startPoint={startPoint}
        startPointName={startPointName}
        endPoint={endPoint}
        endPointName={endPointName}
        waypoints={waypoints}
        waypointNames={waypointNames}
        onLocationSelect={handleLocationSelect}
        onAddWaypoint={addWaypoint}
        onRemoveWaypoint={removeWaypoint}
        onClearAllWaypoints={clearAllWaypoints}
        onClearAllPoints={clearAllPoints}
        routeStrategy={routeStrategy}
        onRouteStrategyChange={setRouteStrategy}
        onGenerateRoute={generateSmartRoute}
        onAddOneWaypoint={addOneSmartWaypoint}
        selectedAlgorithm={selectedAlgorithm}
        onSelectAlgorithm={setSelectedAlgorithm}
        onAlgorithmParamsChange={setAlgorithmParams}
        onFindRoute={handleFindRoute}
        isCalculating={calculateRouteMutation.isPending}
        route={route}
        onShowRouteModal={() => setShowRouteModal(true)}
        onSaveRoute={() => setShowSaveModal(true)}
      />

      {showSaveModal && <SaveRouteModal route={route} routeRequest={currentRouteRequest} isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />}

      {showRouteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <RouteDetailsModal route={route} isOpen={showRouteModal} onClose={() => setShowRouteModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
