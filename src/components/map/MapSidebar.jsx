import SidebarSection, { Divider } from "./SidebarSection";
import { LocationPicker, AlgorithmSelector, AlgorithmParamPanel, WaypointManager, RouteDetails } from "../../components";

const MapSidebar = ({
  pointSelectionMode,
  onModeChange,

  transportMode,
  onTransportModeChange,
  avoidHighways,
  onAvoidHighwaysChange,
  avoidTolls,
  onAvoidTollsChange,

  startPoint,
  startPointName,
  endPoint,
  endPointName,
  waypoints,
  waypointNames,
  onLocationSelect,
  onAddWaypoint,
  onRemoveWaypoint,
  onClearAllWaypoints,
  onClearAllPoints,

  routeStrategy,
  onRouteStrategyChange,
  onGenerateRoute,
  onAddOneWaypoint,

  selectedAlgorithm,
  onSelectAlgorithm,
  onAlgorithmParamsChange,

  onFindRoute,
  isCalculating,

  route,
  onShowRouteModal,
  onSaveRoute,
}) => {
  return (
    <div className="w-[420px] bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-4 space-y-4">
        <div className="text-center pb-3 border-b border-gray-200">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Útvonaltervező</h1>
          <p className="text-xs text-gray-500 mt-1">Heurisztikus optimalizáció</p>
        </div>

        <SidebarSection title="Beviteli mód" icon="" color="blue" collapsible={true} defaultExpanded={false}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onModeChange("search")}
              className={`
                py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                ${pointSelectionMode === "search" ? "bg-blue-500 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"}
              `}
            >
              Címkeresés
            </button>
            <button
              onClick={() => onModeChange("click")}
              className={`
                py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
                ${pointSelectionMode === "click" ? "bg-green-500 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:border-green-300"}
              `}
            >
              Térkép kattintás
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">{pointSelectionMode === "search" ? "Városok és címek keresése név alapján" : "Pontok elhelyezése a térképre kattintva"}</p>
        </SidebarSection>

        <SidebarSection title="Közlekedés" icon="🚗" color="green" collapsible={true} defaultExpanded={false}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: "car", icon: "🚗", label: "Autó" },
              { mode: "bike", icon: "🚴", label: "Bicikli" },
              { mode: "walk", icon: "🚶", label: "Gyalog" },
            ].map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => onTransportModeChange(mode)}
                className={`
                  py-3 rounded-lg text-sm font-medium transition-all
                  ${transportMode === mode ? "bg-green-500 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:border-green-300"}
                `}
              >
                <div className="text-xl mb-1">{icon}</div>
                {label}
              </button>
            ))}
          </div>

          {transportMode === "car" && (
            <div className="mt-3 pt-3 border-t border-green-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={avoidHighways} onChange={(e) => onAvoidHighwaysChange(e.target.checked)} className="w-4 h-4 text-green-500 rounded" />
                <span>Autópályák elkerülése</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={avoidTolls} onChange={(e) => onAvoidTollsChange(e.target.checked)} className="w-4 h-4 text-green-500 rounded" />
                <span>Fizetős utak elkerülése</span>
              </label>
            </div>
          )}
        </SidebarSection>

        {pointSelectionMode === "search" && (
          <SidebarSection title="Útvonal pontok" icon="🔍" color="blue" collapsible={true} defaultExpanded={false}>
            <div className="space-y-3">
              <LocationPicker label="Kezdőpont" icon="🟢" onSelectLocation={(location, name) => onLocationSelect("start", location, name)} selectedLocation={startPoint} selectedName={startPointName} placeholder="Pl. Bratislava..." />
              <LocationPicker label="Célpont" icon="🔴" onSelectLocation={(location, name) => onLocationSelect("end", location, name)} selectedLocation={endPoint} selectedName={endPointName} placeholder="Pl. Košice..." />

              <Divider text="Köztes útpontok" />

              <WaypointManager waypoints={waypoints} waypointNames={waypointNames} onAddWaypoint={onAddWaypoint} onRemoveWaypoint={onRemoveWaypoint} onClearAllWaypoints={onClearAllWaypoints} maxHeight={180} />
            </div>
          </SidebarSection>
        )}

        <SidebarSection title="Teszt generátor" icon="🎲" color="purple" collapsible={true} defaultExpanded={false}>
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Generálási stratégia</label>
            <select value={routeStrategy} onChange={(e) => onRouteStrategyChange(e.target.value)} className="w-full p-2 text-sm border border-purple-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent">
              <option value="mixed">Vegyes (random)</option>
              <option value="scattered">Szétszórt (országos)</option>
              <option value="clustered">Klaszteres</option>
              <option value="zigzag">Cikkcakk (É-D)</option>
              <option value="regional">Regionális</option>
            </select>
          </div>

          <p className="text-xs text-gray-500 mb-2">Városok száma:</p>
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {[5, 10, 15, 20, 30].map((count) => (
              <button
                key={count}
                onClick={() => onGenerateRoute(count)}
                className={`
                  py-2 rounded-lg text-white text-sm font-bold transition-all hover:scale-105
                  ${count <= 10 ? "bg-green-500 hover:bg-green-600" : count <= 20 ? "bg-amber-500 hover:bg-amber-600" : "bg-red-500 hover:bg-red-600"}
                `}
              >
                {count}
              </button>
            ))}
          </div>

          <div className="bg-red-50 rounded-lg p-2.5 border border-red-200">
            <p className="text-xs font-semibold text-red-700 mb-2">Extrém tesztek</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[40, 50, 70].map((count) => (
                <button key={count} onClick={() => onGenerateRoute(count)} className="py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-all">
                  {count} város
                </button>
              ))}
            </div>
          </div>

          {startPoint && endPoint && (
            <>
              <button onClick={onAddOneWaypoint} className="w-full mt-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all">
                <span className="text-lg">+</span> 1 waypoint hozzáadása
              </button>

              <div className="mt-3 p-2 bg-purple-100 rounded-lg text-center">
                <p className="text-xs text-purple-700">
                  <strong>{startPointName || "Start"}</strong>
                  <span className="mx-2">→</span>
                  <span className="px-1.5 py-0.5 bg-purple-500 text-white rounded-full text-[10px] font-bold">{waypoints.length}</span>
                  <span className="mx-2">→</span>
                  <strong>{endPointName || "Cél"}</strong>
                </p>
              </div>
            </>
          )}
        </SidebarSection>

        <SidebarSection title="Algoritmus" icon="⚙️" color="orange" collapsible={true} defaultExpanded={false}>
          <AlgorithmSelector selectedAlgorithm={selectedAlgorithm} onSelectAlgorithm={onSelectAlgorithm} />

          {selectedAlgorithm !== "none" && (
            <div className="mt-3 pt-3 border-t border-orange-200">
              <AlgorithmParamPanel algorithm={selectedAlgorithm} onParamsChange={onAlgorithmParamsChange} />
            </div>
          )}
        </SidebarSection>

        <button
          className={`
            w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-lg
            flex items-center justify-center gap-2
            ${!startPoint || !endPoint || isCalculating ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5"}
          `}
          disabled={!startPoint || !endPoint || isCalculating}
          onClick={onFindRoute}
        >
          {isCalculating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Számítás...
            </>
          ) : (
            <> Útvonal keresése</>
          )}
        </button>

        {route && (
          <SidebarSection title="Eredmények" icon="📊" color="gray" collapsible={true} defaultExpanded={false}>
            <RouteDetails route={route} />

            <div className="flex gap-2 mt-4">
              <button onClick={onShowRouteModal} className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all">
                📋 Részletek
              </button>
              <button onClick={onSaveRoute} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all">
                💾 Mentés
              </button>
            </div>
          </SidebarSection>
        )}

        {(startPoint || endPoint || waypoints.length > 0) && (
          <button onClick={onClearAllPoints} className="w-full py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
            🗑️ Minden törlése
          </button>
        )}
      </div>
    </div>
  );
};

export default MapSidebar;
