import React from "react";

const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return "N/A";
  const mins = Math.round(minutes);
  if (mins < 60) return `${mins} perc`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  const hoursPart = remainingMins > 0 ? `${hours} óra ${remainingMins} perc` : `${hours} óra`;
  return `${mins} perc (${hoursPart})`;
};

const RouteDetailsModal = ({ route, isOpen, onClose }) => {
  if (!isOpen || !route) return null;

  const { comparison, algorithmDetails, optimizationLog } = route;
  if (optimizationLog) {
    //console.log("First 3 entries:", optimizationLog.slice(0, 3));
  }
  const getExecutionTimePercent = () => {
    const time = route.algorithmStats?.executionTime || 0;
    if (time < 100) return 30;
    if (time < 500) return 50;
    if (time < 1000) return 70;
    if (time < 5000) return 85;
    return 95;
  };

  const getIterationsPercent = () => {
    const iter = route.algorithmStats?.iterations || 0;
    if (iter < 100) return 25;
    if (iter < 500) return 50;
    if (iter < 1000) return 70;
    if (iter < 5000) return 85;
    return 95;
  };

  const WaypointOrderVisual = ({ order, isOptimized }) => (
    <div className="flex items-center justify-start flex-wrap gap-1.5 py-2">
      <div className="flex items-center bg-green-100 px-2 py-1.5 rounded-lg border border-green-300">
        <span className="text-xs font-bold text-green-700">🏁 Start</span>
      </div>

      {order.map((waypointIdx, position) => (
        <React.Fragment key={position}>
          <svg className={`w-3 h-3 ${isOptimized ? "text-green-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div className={`flex items-center px-2 py-1.5 rounded-lg border ${isOptimized ? "bg-green-100 border-green-300" : "bg-blue-100 border-blue-300"}`}>
            <div className={`w-5 h-5 ${isOptimized ? "bg-green-500" : "bg-blue-500"} text-white rounded-full flex items-center justify-center text-[10px] font-bold mr-1.5`}>{waypointIdx + 1}</div>
            <span className={`text-xs font-bold ${isOptimized ? "text-green-700" : "text-blue-700"}`}>W{waypointIdx + 1}</span>
          </div>
        </React.Fragment>
      ))}

      <svg className={`w-3 h-3 ${isOptimized ? "text-green-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <div className="flex items-center bg-red-100 px-2 py-1.5 rounded-lg border border-red-300">
        <span className="text-xs font-bold text-red-700">🎯 Cél</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-gray-200">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900"> Útvonal Részletek</h2>
          <p className="text-sm text-gray-500 mt-0.5">Részletes elemzés és teljesítmény</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {comparison && (
          <section className="space-y-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Összehasonlítás
            </h3>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="text-center mb-4">
                <p className="text-sm font-semibold text-blue-800 bg-white/70 rounded-lg px-4 py-2 inline-block">{comparison.improvementSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                    Eredeti
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Távolság:</span>
                      <span className="font-bold">{comparison.originalDistance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Idő:</span>
                      <span className="font-bold">{formatDuration(comparison.originalDuration)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-3 border border-green-200">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Optimalizált
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Távolság:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{comparison.optimizedDistance} km</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            comparison.distanceImprovement > 0 ? "bg-green-100 text-green-700" : comparison.distanceImprovement < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {comparison.distanceImprovement > 0 ? "-" : comparison.distanceImprovement < 0 ? "+" : ""}
                          {Math.abs(comparison.distanceImprovement)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Idő:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{formatDuration(comparison.optimizedDuration)}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            comparison.durationImprovement > 0 ? "bg-green-100 text-green-700" : comparison.durationImprovement < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {comparison.durationImprovement > 0 ? "-" : comparison.durationImprovement < 0 ? "+" : ""}
                          {Math.abs(comparison.durationImprovement)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {route.optimizedWaypointOrder && route.originalWaypointOrder && route.optimizedWaypointOrder.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Waypoint sorrend változás
            </h3>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <div className="space-y-3 mb-4">
                <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Eredeti sorrend:</p>
                  <WaypointOrderVisual order={route.originalWaypointOrder} isOptimized={false} />
                </div>

                <div className="bg-white/70 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-medium text-green-600 mb-1">Optimalizált sorrend:</p>
                  <WaypointOrderVisual order={route.optimizedWaypointOrder} isOptimized={true} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/70 rounded-lg p-2.5 text-center border border-orange-200">
                  <div className="text-xl font-bold text-orange-700">{route.originalWaypointOrder.length}</div>
                  <div className="text-[10px] text-gray-500">Összes</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2.5 text-center border border-green-200">
                  <div className="text-xl font-bold text-green-700">{route.originalWaypointOrder.filter((idx, pos) => route.optimizedWaypointOrder.indexOf(idx) !== pos).length}</div>
                  <div className="text-[10px] text-gray-500">Módosítva</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2.5 text-center border border-gray-200">
                  <div className="text-xl font-bold text-gray-600">{route.originalWaypointOrder.filter((idx, pos) => route.optimizedWaypointOrder.indexOf(idx) === pos).length}</div>
                  <div className="text-[10px] text-gray-500">Változatlan</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {algorithmDetails && (
          <section className="space-y-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Algoritmus
            </h3>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/70 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Algoritmus:</span>
                    <span className="font-bold text-purple-700">{algorithmDetails.algorithmName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Értékelések:</span>
                    <span className="font-bold">{algorithmDetails.totalEvaluations}</span>
                  </div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kezdeti:</span>
                    <span className="font-bold">{algorithmDetails.initialCost?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Végső:</span>
                    <span className="font-bold text-green-600">{algorithmDetails.finalCost?.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {algorithmDetails.parameters && Object.keys(algorithmDetails.parameters).length > 0 && (
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Paraméterek:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(algorithmDetails.parameters).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {key}: <strong>{value}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-center text-gray-500 mt-3">{algorithmDetails.convergenceInfo}</p>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-800 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Teljesítmény
          </h3>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/70 rounded-lg p-3 text-center border border-green-200">
                <div className="text-xl font-bold text-green-700">{route.algorithmStats?.executionTime || 0}ms</div>
                <div className="text-xs text-gray-500 mb-2">Futási idő</div>
                <div className="w-full bg-green-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${getExecutionTimePercent()}%` }}></div>
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center border border-green-200">
                <div className="text-xl font-bold text-green-700">{route.algorithmStats?.memoryUsage || "N/A"}</div>
                <div className="text-xs text-gray-500 mb-2">Memória</div>
                <div className="w-full bg-green-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "50%" }}></div>
                </div>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center border border-green-200">
                <div className="text-xl font-bold text-green-700">{route.algorithmStats?.iterations || 0}</div>
                <div className="text-xs text-gray-500 mb-2">Iterációk</div>
                <div className="w-full bg-green-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${getIterationsPercent()}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {optimizationLog && Array.isArray(optimizationLog) && optimizationLog.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center">
              <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
              Algoritmus napló
              <span className="ml-2 text-xs font-normal text-gray-400">({optimizationLog.length} sor)</span>
            </h3>

            <div className="bg-gray-900 rounded-xl p-3 border border-gray-700">
              <div className="max-h-32 overflow-y-auto font-mono text-xs space-y-0.5">
                {optimizationLog.map((logEntry, index) => (
                  <div key={index} className="flex hover:bg-gray-800 px-1 rounded">
                    <span className="text-gray-500 mr-2 select-none w-6">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-green-400">{logEntry}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-base font-bold text-gray-800 flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Útvonal adatok
          </h3>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pontok száma:</span>
                  <span className="font-bold">{route.path?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Távolság:</span>
                  <span className="font-bold">{route.distance} km</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Időtartam:</span>
                  <span className="font-bold">{formatDuration(route.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Átlag sebesség:</span>
                  <span className="font-bold">{route.distance && route.duration ? `${Math.round(route.distance / (route.duration / 60))} km/h` : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
        <div className="flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all text-sm font-medium">
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailsModal;
