const RouteDetails = ({ route }) => {
  if (!route) return null;

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return "—";

    const mins = Math.round(minutes);

    if (mins < 60) {
      return `${mins} perc`;
    } else if (mins < 1440) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      const hourText = `${hours} óra`;
      const minText = remainingMins > 0 ? ` ${remainingMins} perc` : "";
      return (
        <>
          {hourText}
          {minText} <span className="text-gray-400">({mins} perc)</span>
        </>
      );
    } else {
      const days = Math.floor(mins / 1440);
      const remainingHours = Math.floor((mins % 1440) / 60);
      const dayText = `${days} nap`;
      const hourText = remainingHours > 0 ? ` ${remainingHours} óra` : "";
      return (
        <>
          {dayText}
          {hourText} <span className="text-gray-400">({mins} perc)</span>
        </>
      );
    }
  };

  const formatExecutionTime = (ms) => {
    if (ms === null || ms === undefined) return "—";

    if (ms < 1000) {
      return `${Math.round(ms)} ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)} s`;
    } else {
      return `${(ms / 60000).toFixed(1)} perc`;
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900">Útvonal Részletek</h3>
      </div>

      <ul className="space-y-2 mb-4">
        <li className="flex justify-between">
          <span className="text-sm text-gray-500">Távolság</span>
          <span className="text-sm font-medium">{route.distance} km</span>
        </li>
        <li className="flex justify-between items-baseline">
          <span className="text-sm text-gray-500">Becsült idő</span>
          <span className="text-sm font-medium">{formatDuration(route.duration)}</span>
        </li>
      </ul>

      <div className="border-t pt-2 mt-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Algoritmus Statisztikák</h4>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatExecutionTime(route.algorithmStats?.executionTime)}
          </span>
          {route.algorithmStats?.memoryUsage && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              {route.algorithmStats.memoryUsage}
            </span>
          )}
          {route.algorithmStats?.iterations && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {route.algorithmStats.iterations} iteráció
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
