import React, { useState } from "react";
import { useSaveRoute } from "../../api/useRoute";
import toast from "../../utils/toast";

const SaveRouteModal = ({ route, isOpen, onClose, routeRequest }) => {
  const [routeName, setRouteName] = useState("");
  const [saving, setSaving] = useState(false);

  const saveRouteMutation = useSaveRoute();

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!routeName.trim()) {
      toast.warning("Kérlek adj meg egy nevet az útvonalnak!");
      return;
    }

    setSaving(true);

    try {
      const waypointsData = (routeRequest?.waypoints || []).map((wp, index) => ({
        latitude: wp[0],
        longitude: wp[1],
        name: null,
        originalOrder: index,
        optimizedOrder: route?.optimizedWaypointOrder ? route.optimizedWaypointOrder.indexOf(index) : index,
      }));

      const coordinates = (route.path || route.coordinates || []).map((coord) => {
        if (Array.isArray(coord) && coord.length === 2) {
          return [coord[0], coord[1]];
        }
        return coord;
      });

      const saveData = {
        routeName: routeName.trim(),
        startPointName: routeRequest?.startPointName || "Kezdőpont",
        endPointName: routeRequest?.endPointName || "Célpont",
        coordinates: coordinates,
        waypoints: waypointsData,
        algorithmType: routeRequest?.algorithm || "none",
        transportMode: routeRequest?.transportMode || "car",
        avoidHighways: routeRequest?.avoidHighways || false,
        avoidTolls: routeRequest?.avoidTolls || false,
        algorithmParams: routeRequest?.algorithmParams || {},
        routeResult: {
          distance: parseFloat(route.distance) || 0,
          duration: parseInt(route.duration) || 0,
          algorithmStats: route.algorithmStats
            ? {
                executionTime: route.algorithmStats.executionTime,
                memoryUsage: route.algorithmStats.memoryUsage,
                iterations: route.algorithmStats.iterations,
                originalDistance: route.algorithmStats.originalDistance,
                optimizedDistance: route.algorithmStats.optimizedDistance,
                improvementPercent: route.algorithmStats.improvementPercent,
                finalGeneration: route.algorithmStats.finalGeneration,
                bestFitness: route.algorithmStats.bestFitness,
                finalTemperature: route.algorithmStats.finalTemperature,
                acceptedMoves: route.algorithmStats.acceptedMoves,
                rejectedMoves: route.algorithmStats.rejectedMoves,
                restartCount: route.algorithmStats.restartCount,
                localOptimaHits: route.algorithmStats.localOptimaHits,
              }
            : null,
          comparison: route.comparison,
          algorithmDetails: route.algorithmDetails,
          optimizationLog: route.optimizationLog,
          originalWaypointOrder: route.originalWaypointOrder,
          optimizedWaypointOrder: route.optimizedWaypointOrder,
        },
      };

      const result = await saveRouteMutation.mutateAsync(saveData);

      if (result.success) {
        toast.success("Útvonal sikeresen elmentve!");
        setRouteName("");
        onClose();
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Hiba történt a mentés során: " + error.message);
    }

    setSaving(false);
  };

  const handleClose = () => {
    if (!saving) {
      setRouteName("");
      onClose();
    }
  };

  const getTransportIcon = (mode) => {
    switch (mode) {
      case "car":
        return "🚗";
      case "bike":
        return "🚴";
      case "walk":
        return "🚶";
      default:
        return "🚗";
    }
  };

  const getTransportLabel = (mode) => {
    switch (mode) {
      case "car":
        return "Autó";
      case "bike":
        return "Bicikli";
      case "walk":
        return "Gyaloglás";
      default:
        return "Autó";
    }
  };

  const getAlgorithmLabel = (algorithm) => {
    switch (algorithm) {
      case "hillClimb":
        return "Hegymászó algoritmus";
      case "genetic":
        return "Genetikus algoritmus";
      case "simulatedAnnealing":
        return "Szimulált hűtés";
      case "none":
        return "Alapértelmezett";
      default:
        return algorithm || "Alapértelmezett";
    }
  };

  const waypointCount = routeRequest?.waypoints?.length || 0;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white border-2 border-green-500 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900"> Útvonal mentése</h2>
              <p className="text-sm text-gray-600 mt-1">Mentse el az útvonalat későbbi használatra</p>
            </div>
            <button onClick={handleClose} disabled={saving} className="text-gray-400 hover:text-gray-600 hover:bg-white/60 rounded-full p-2 transition-all duration-200 disabled:opacity-50">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label htmlFor="routeName" className="block text-sm font-semibold text-gray-800">
              Útvonal neve
            </label>
            <div className="relative">
              <input
                id="routeName"
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Add meg az útvonal nevét..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={saving}
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center">
              <p className={`text-xs ${routeName.length > 80 ? "text-amber-500" : "text-gray-500"}`}>{routeName.length}/100</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              Útvonal összefoglaló
            </h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg p-3 text-center border border-gray-100 shadow-sm">
                <div className="text-xl font-bold text-blue-600 mb-1">{route.distance}</div>
                <div className="text-xs text-gray-600">km</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-100 shadow-sm">
                <div className="text-xl font-bold text-green-600 mb-1">{route.duration}</div>
                <div className="text-xs text-gray-600">perc</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-100 shadow-sm">
                <div className="text-xl font-bold text-purple-600 mb-1">{waypointCount}</div>
                <div className="text-xs text-gray-600">útpont</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Algoritmus:</span>
                  <span className="font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full text-sm">{getAlgorithmLabel(routeRequest?.algorithm)}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Közlekedési mód:</span>
                  <span className="font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-sm flex items-center">
                    <span className="mr-2">{getTransportIcon(routeRequest?.transportMode)}</span>
                    {getTransportLabel(routeRequest?.transportMode)}
                  </span>
                </div>
              </div>

              {routeRequest?.transportMode === "car" && (routeRequest?.avoidHighways || routeRequest?.avoidTolls) && (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">Elkerülési beállítások:</div>
                  <div className="flex flex-wrap gap-2">
                    {routeRequest?.avoidHighways && <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">🚫 Autópályák</span>}
                    {routeRequest?.avoidTolls && <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">💰 Fizetős utak</span>}
                  </div>
                </div>
              )}

              {route.algorithmStats && route.algorithmStats.improvementPercent > 0 && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Optimalizálás:</span>
                    <span className="font-semibold text-green-700">✨ {route.algorithmStats.improvementPercent.toFixed(1)}% javulás</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Mégse
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !routeName.trim()}
            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mentés...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mentés
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveRouteModal;
