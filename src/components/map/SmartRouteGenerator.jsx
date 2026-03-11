import toast from "../../utils/toast";

const toRad = (deg) => deg * (Math.PI / 180);

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const shuffle = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const formatCityCoords = (city) => [city.lat, city.lon];

const formatResult = (cities) => {
  if (cities.length < 2) {
    console.error("Nincs elég város a generáláshoz!");
    return null;
  }

  const start = cities[0];
  const end = cities[cities.length - 1];
  const waypoints = cities.slice(1, -1);

  return {
    start: { name: start.name, coords: formatCityCoords(start) },
    end: { name: end.name, coords: formatCityCoords(end) },
    waypoints: waypoints.map((w) => ({ name: w.name, coords: formatCityCoords(w) })),
  };
};

const generateScatteredRoute = (count, cities) => {
  const minDistance = 25;
  const selected = [];
  let available = shuffle([...cities]);

  selected.push(available.shift());

  let attempts = 0;
  const maxAttempts = available.length * 2;

  while (selected.length < count + 2 && available.length > 0 && attempts < maxAttempts) {
    const candidate = available[0];
    const lastSelected = selected[selected.length - 1];
    const distance = haversineDistance(lastSelected.lat, lastSelected.lon, candidate.lat, candidate.lon);

    if (distance >= minDistance || available.length <= 5) {
      selected.push(candidate);
      available.shift();
    } else {
      available.push(available.shift());
    }
    attempts++;
  }

  while (selected.length < count + 2 && available.length > 0) {
    selected.push(available.shift());
  }

  return formatResult(selected);
};

const generateClusteredRoute = (count, cities) => {
  const regions = [
    { name: "Nyugat-Szlovákia", minLon: 16.8, maxLon: 18.2, minLat: 47.7, maxLat: 48.9 },
    { name: "Közép-Szlovákia", minLon: 18.2, maxLon: 20.0, minLat: 48.0, maxLat: 49.3 },
    { name: "Kelet-Szlovákia", minLon: 20.0, maxLon: 22.6, minLat: 48.4, maxLat: 49.5 },
  ];

  const startRegionIdx = Math.floor(Math.random() * regions.length);
  const adjacentRegionIdx = startRegionIdx === 0 ? 1 : startRegionIdx === 2 ? 1 : Math.random() > 0.5 ? 0 : 2;
  const selectedRegions = [regions[startRegionIdx], regions[adjacentRegionIdx]];

  const selected = [];
  const usedNames = new Set();

  selectedRegions.forEach((region) => {
    const regionCities = cities.filter((c) => c.lon >= region.minLon && c.lon <= region.maxLon && c.lat >= region.minLat && c.lat <= region.maxLat && !usedNames.has(c.name));

    const shuffled = shuffle(regionCities);
    const citiesPerRegion = Math.ceil((count + 2) / 2);
    const toAdd = shuffled.slice(0, citiesPerRegion);

    toAdd.forEach((city) => {
      selected.push(city);
      usedNames.add(city.name);
    });
  });

  selected.sort((a, b) => a.lon - b.lon);
  return formatResult(selected.slice(0, count + 2));
};

const generateZigzagRoute = (count, cities) => {
  const midLat = 48.75;
  const northCities = shuffle(cities.filter((c) => c.lat > midLat));
  const southCities = shuffle(cities.filter((c) => c.lat <= midLat));

  const selected = [];
  const usedNames = new Set();
  let useNorth = Math.random() > 0.5;

  for (let i = 0; i < count + 2; i++) {
    const pool = useNorth ? northCities : southCities;
    const candidate = pool.find((c) => !usedNames.has(c.name));

    if (candidate) {
      selected.push(candidate);
      usedNames.add(candidate.name);
    } else {
      const otherPool = useNorth ? southCities : northCities;
      const fallback = otherPool.find((c) => !usedNames.has(c.name));
      if (fallback) {
        selected.push(fallback);
        usedNames.add(fallback.name);
      }
    }
    useNorth = !useNorth;
  }

  return formatResult(selected);
};

const generateRegionalRoute = (count, cities) => {
  const majorCities = cities.filter((c) => ["Bratislava", "Košice", "Žilina", "Banská Bystrica", "Nitra", "Prešov", "Trenčín", "Trnava"].includes(c.name));

  const center = randomPick(majorCities.length > 0 ? majorCities : cities);

  const withDistances = cities
    .filter((c) => c.name !== center.name)
    .map((c) => ({
      ...c,
      distance: haversineDistance(center.lat, center.lon, c.lat, c.lon),
    }))
    .sort((a, b) => a.distance - b.distance);

  const selected = [center, ...withDistances.slice(0, count + 1)];
  return formatResult(shuffle(selected));
};

const generateLinearRoute = (count, cities) => {
  const sorted = [...cities].sort((a, b) => a.lon - b.lon);

  const startPool = sorted.slice(0, Math.floor(sorted.length / 3));
  const start = randomPick(startPool);

  const endPool = sorted.slice(Math.floor((sorted.length * 2) / 3));
  const end = randomPick(endPool);

  const middlePool = sorted.filter((c) => c.name !== start.name && c.name !== end.name && c.lon > start.lon && c.lon < end.lon);
  const waypoints = shuffle(middlePool).slice(0, count);

  const allPoints = [start, ...waypoints, end].sort((a, b) => a.lon - b.lon);
  return formatResult(allPoints);
};

const strategyNames = {
  scattered: "Szétszórt",
  clustered: "Klaszteres",
  zigzag: "Cikcakk",
  regional: "Regionális",
  linear: "Lineáris",
};

export const generateSmartRouteAdvanced = (waypointCount, slovakiaCities, setStartPoint, setEndPoint, setWaypoints, setRoute, routeStrategy, setWaypointNames) => {
  if (!slovakiaCities || slovakiaCities.length < waypointCount + 2) {
    console.error("Nincs elég város a generáláshoz!");
    toast.error("Nincs elég város az adatbázisban!");
    return null;
  }

  const strategies = ["scattered", "clustered", "zigzag", "regional", "linear"];
  const strategy = routeStrategy === "mixed" ? randomPick(strategies) : routeStrategy;

  let result;
  try {
    switch (strategy) {
      case "scattered":
        result = generateScatteredRoute(waypointCount, slovakiaCities);
        break;
      case "clustered":
        result = generateClusteredRoute(waypointCount, slovakiaCities);
        break;
      case "zigzag":
        result = generateZigzagRoute(waypointCount, slovakiaCities);
        break;
      case "regional":
        result = generateRegionalRoute(waypointCount, slovakiaCities);
        break;
      case "linear":
        result = generateLinearRoute(waypointCount, slovakiaCities);
        break;
      default:
        result = generateScatteredRoute(waypointCount, slovakiaCities);
    }
  } catch (error) {
    console.error("Generálási hiba:", error);
    toast.error("Hiba történt az útvonal generálásakor!");
    return null;
  }

  if (!result) {
    toast.error("Nem sikerült útvonalat generálni!");
    return null;
  }

  setStartPoint(result.start.coords);
  setEndPoint(result.end.coords);
  setWaypoints(result.waypoints.map((w) => w.coords));

  if (setWaypointNames) {
    setWaypointNames(result.waypoints.map((w) => w.name));
  }

  setRoute(null);

  const waypointList =
    result.waypoints.length > 0
      ? result.waypoints
          .slice(0, 5)
          .map((w) => w.name)
          .join(" → ")
      : "(nincs)";
  const moreCount = result.waypoints.length > 5 ? result.waypoints.length - 5 : 0;

  toast.modal({
    title: `${strategyNames[strategy]} útvonal generálva!`,
    type: "success",
    message: `Összesen ${result.waypoints.length + 2} pont`,
    details: [
      { label: "🟢 Indulás", value: result.start.name },
      { label: "📍 Útpontok", value: `${waypointList}${moreCount > 0 ? ` (+${moreCount})` : ""}` },
      { label: "🔴 Cél", value: result.end.name },
    ],
  });

  return result;
};

export const addSmartWaypoint = (startPoint, endPoint, existingWaypoints, existingWaypointNames, slovakiaCities, setWaypoints, setWaypointNames, setRoute) => {
  if (!startPoint || !endPoint) {
    toast.warning("Előbb válassz kezdő és végpontot!");
    return null;
  }

  const usedNames = new Set();

  const findClosestCity = (point) => {
    let closest = slovakiaCities[0];
    let minDist = Infinity;

    slovakiaCities.forEach((city) => {
      const dist = haversineDistance(point[0], point[1], city.lat, city.lon);
      if (dist < minDist) {
        minDist = dist;
        closest = city;
      }
    });

    return closest;
  };

  usedNames.add(findClosestCity(startPoint).name);
  usedNames.add(findClosestCity(endPoint).name);

  existingWaypoints.forEach((wp) => {
    usedNames.add(findClosestCity(wp).name);
  });

  const minLat = Math.min(startPoint[0], endPoint[0]);
  const maxLat = Math.max(startPoint[0], endPoint[0]);
  const minLon = Math.min(startPoint[1], endPoint[1]);
  const maxLon = Math.max(startPoint[1], endPoint[1]);

  const latBuffer = (maxLat - minLat) * 0.4 || 0.5;
  const lonBuffer = (maxLon - minLon) * 0.4 || 0.5;

  const available = slovakiaCities.filter((city) => !usedNames.has(city.name) && city.lat >= minLat - latBuffer && city.lat <= maxLat + latBuffer && city.lon >= minLon - lonBuffer && city.lon <= maxLon + lonBuffer);

  if (available.length === 0) {
    const anyAvailable = slovakiaCities.filter((c) => !usedNames.has(c.name));
    if (anyAvailable.length === 0) {
      toast.warning("Nincs több elérhető város!");
      return null;
    }

    const selected = randomPick(anyAvailable);
    setWaypoints((prev) => [...prev, formatCityCoords(selected)]);
    setWaypointNames((prev) => [...prev, selected.name]);
    setRoute(null);

    toast.success(`${selected.name} hozzáadva`);
    return selected;
  }

  const selected = randomPick(available);

  setWaypoints((prev) => [...prev, formatCityCoords(selected)]);
  setWaypointNames((prev) => [...prev, selected.name]);
  setRoute(null);

  toast.success(`${selected.name} hozzáadva`);

  return selected;
};

export default {
  generateSmartRouteAdvanced,
  addSmartWaypoint,
};
