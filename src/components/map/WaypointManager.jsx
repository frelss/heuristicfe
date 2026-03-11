import React, { useState, useMemo, useCallback } from "react";
import LocationPicker from "./LocationPicker";

const WaypointManager = ({ waypoints, waypointNames = [], onAddWaypoint, onRemoveWaypoint, onClearAllWaypoints, maxHeight = 280 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState("chips");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const formatCoord = useCallback((coords) => {
    if (!coords) return "?";
    if (Array.isArray(coords) && coords.length >= 2) {
      return `${coords[0].toFixed(3)}, ${coords[1].toFixed(3)}`;
    }
    if (coords.latitude !== undefined) {
      return `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`;
    }
    return "?";
  }, []);

  const waypointData = useMemo(() => {
    return waypoints.map((wp, idx) => ({
      id: idx,
      coords: wp,
      name: waypointNames[idx] || null,
      coordStr: formatCoord(wp),
    }));
  }, [waypoints, waypointNames, formatCoord]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return waypointData;
    const term = searchTerm.toLowerCase();
    return waypointData.filter((w) => w.name?.toLowerCase().includes(term) || w.coordStr.includes(term) || (w.id + 1).toString() === term);
  }, [waypointData, searchTerm]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === waypoints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(waypoints.map((_, i) => i)));
    }
  };

  const deleteSelected = () => {
    const sorted = Array.from(selectedIds).sort((a, b) => b - a);
    sorted.forEach((id) => onRemoveWaypoint(id));
    setSelectedIds(new Set());
  };

  const ChipView = () => (
    <div className="flex flex-wrap gap-1.5 p-1">
      {filtered.map((w) => {
        const selected = selectedIds.has(w.id);
        return (
          <div
            key={w.id}
            onClick={() => toggleSelect(w.id)}
            className={`
              group inline-flex items-center gap-1 pl-1 pr-2 py-1 rounded-full
              text-xs cursor-pointer select-none transition-all
              ${selected ? "bg-blue-500 text-white shadow-md scale-105" : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"}
            `}
            title={`${w.name || `#${w.id + 1}`}\n${w.coordStr}`}
          >
            <span
              className={`
              w-5 h-5 rounded-full flex items-center justify-center 
              text-[10px] font-bold shrink-0
              ${selected ? "bg-white/25" : "bg-blue-500 text-white"}
            `}
            >
              {w.id + 1}
            </span>

            <span className="max-w-[60px] truncate font-medium">{w.name || `${w.coords?.[0]?.toFixed(1)}°`}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveWaypoint(w.id);
              }}
              className={`
                w-4 h-4 rounded-full flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity ml-0.5
                ${selected ? "hover:bg-white/30" : "hover:bg-red-200 text-red-600"}
              `}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-2 gap-1.5 p-1">
      {filtered.map((w) => {
        const selected = selectedIds.has(w.id);
        return (
          <div
            key={w.id}
            onClick={() => toggleSelect(w.id)}
            className={`
              flex items-center gap-2 p-2 rounded-lg cursor-pointer
              transition-all text-xs
              ${selected ? "bg-blue-500 text-white shadow" : "bg-gray-50 hover:bg-gray-100 border border-gray-200"}
            `}
          >
            <span
              className={`
              w-6 h-6 rounded-full flex items-center justify-center 
              font-bold text-[11px] shrink-0
              ${selected ? "bg-white/25" : "bg-blue-500 text-white"}
            `}
            >
              {w.id + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{w.name || `Útpont ${w.id + 1}`}</div>
              <div className={`text-[10px] truncate ${selected ? "text-blue-100" : "text-gray-400"}`}>{w.coordStr}</div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveWaypoint(w.id);
              }}
              className={`
                w-5 h-5 rounded flex items-center justify-center shrink-0
                ${selected ? "hover:bg-white/20" : "hover:bg-red-100 text-red-500"}
              `}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="space-y-1 p-1">
      {filtered.map((w) => {
        const selected = selectedIds.has(w.id);
        return (
          <div
            key={w.id}
            onClick={() => toggleSelect(w.id)}
            className={`
              flex items-center gap-3 p-2.5 rounded-lg cursor-pointer
              transition-all
              ${selected ? "bg-blue-500 text-white shadow-md" : "bg-gray-50 hover:bg-gray-100 border border-gray-200"}
            `}
          >
            <span
              className={`
              w-7 h-7 rounded-full flex items-center justify-center 
              font-bold text-sm shrink-0
              ${selected ? "bg-white/25" : "bg-blue-500 text-white"}
            `}
            >
              {w.id + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{w.name || `Útpont ${w.id + 1}`}</div>
              <div className={`text-xs ${selected ? "text-blue-100" : "text-gray-500"}`}>📍 {w.coordStr}</div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveWaypoint(w.id);
              }}
              className={`
                p-1.5 rounded-full transition-colors shrink-0
                ${selected ? "hover:bg-white/20" : "hover:bg-red-100 text-red-500"}
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-gray-800 text-sm">Útpontok</span>
            {waypoints.length > 0 && <span className="ml-2 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">{waypoints.length}</span>}
          </div>
        </div>

        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3">
          <LocationPicker label="Útpont hozzáadása" onSelectLocation={onAddWaypoint} placeholder="Város keresése..." />

          {waypoints.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
                  {[
                    { id: "chips", label: "⬢", title: "Chip" },
                    { id: "grid", label: "▦", title: "Grid" },
                    { id: "list", label: "☰", title: "Lista" },
                  ].map(({ id, label, title }) => (
                    <button
                      key={id}
                      onClick={() => setViewMode(id)}
                      title={title}
                      className={`
                        px-2.5 py-1 text-xs font-medium rounded-md transition-all
                        ${viewMode === id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {waypoints.length > 5 && (
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 Keresés..."
                    className="flex-1 min-w-[100px] px-2 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  />
                )}

                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={selectAll} className="px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Összes kiválasztása">
                    {selectedIds.size === waypoints.length && waypoints.length > 0 ? "☑" : "☐"}
                  </button>

                  {selectedIds.size > 0 && (
                    <button onClick={deleteSelected} className="px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium transition-colors">
                      🗑️ {selectedIds.size}
                    </button>
                  )}

                  <button onClick={onClearAllWaypoints} className="px-2 py-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Mind törlése">
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" style={{ maxHeight: `${maxHeight}px` }}>
                {filtered.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">Nincs találat: "{searchTerm}"</p>
                ) : (
                  <>
                    {viewMode === "chips" && <ChipView />}
                    {viewMode === "grid" && <GridView />}
                    {viewMode === "list" && <ListView />}
                  </>
                )}
              </div>

              {searchTerm && filtered.length !== waypoints.length && (
                <div className="text-center text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                  {filtered.length} / {waypoints.length} megjelenítve
                </div>
              )}
            </>
          )}

          {waypoints.length === 0 && (
            <div className="text-center py-4">
              <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-lg">📍</span>
              </div>
              <p className="text-sm text-gray-500">Nincsenek útpontok</p>
              <p className="text-xs text-gray-400">Használd a keresőt vagy a térképet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaypointManager;
