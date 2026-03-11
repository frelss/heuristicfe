import L from "leaflet";

export const markerIcons = {
  start: L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: #10B981;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          color: white;
          font-weight: bold;
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">A</span>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),

  end: L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: #EF4444;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          color: white;
          font-weight: bold;
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">B</span>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  }),

  waypoint: L.divIcon({
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background-color: #3B82F6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  }),
};

export const createNumberedWaypointIcon = (number, isOptimized = false) => {
  const backgroundColor = isOptimized ? "#10B981" : "#3B82F6";
  const badgeColor = isOptimized ? "#059669" : "#2563EB";

  return L.divIcon({
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <!-- Fő marker ikon -->
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${backgroundColor};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        
        <!-- Számozás badge -->
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          background-color: ${badgeColor};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          font-weight: bold;
          font-size: 11px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">${number}</div>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

export const createDualNumberedIcon = (originalIndex, optimizedIndex) => {
  const showOptimized = originalIndex !== optimizedIndex;

  return L.divIcon({
    html: `
      <div style="position: relative; width: 32px; height: 32px;">
        <!-- Fő marker ikon -->
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${showOptimized ? "#10B981" : "#3B82F6"};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        
        <!-- Eredeti számozás (ha változott) -->
        ${
          showOptimized
            ? `
          <div style="
            position: absolute;
            top: -10px;
            left: -10px;
            width: 18px;
            height: 18px;
            background-color: #6B7280;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.4);
            font-weight: bold;
            font-size: 10px;
            color: white;
            text-decoration: line-through;
            opacity: 0.8;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          ">${originalIndex + 1}</div>
        `
            : ""
        }
        
        <!-- Optimalizált számozás badge -->
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          background-color: ${showOptimized ? "#059669" : "#2563EB"};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.4);
          font-weight: bold;
          font-size: 11px;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">${optimizedIndex + 1}</div>
      </div>
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

export const markerTypeInfo = {
  start: {
    label: "Kezdőpont",
    color: "#10B981",
  },
  end: {
    label: "Célpont",
    color: "#EF4444",
  },
  waypoint: {
    label: "Útpont",
    color: "#3B82F6",
  },
  waypointOptimized: {
    label: "Útpont (optimalizált)",
    color: "#10B981",
  },
};
