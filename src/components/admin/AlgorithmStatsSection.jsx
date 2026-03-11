const AlgorithmStatsSection = ({ algorithmStats, isLoading, error }) => {
  const algorithmColors = {
    hillClimb: { bg: "bg-green-500", light: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    genetic: { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    simulatedAnnealing: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    none: { bg: "bg-gray-500", light: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
  };

  const formatExecutionTime = (ms) => {
    if (!ms || ms <= 0) return "—";
    if (ms < 1000) return `${Math.round(ms)} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
    return `${(ms / 60000).toFixed(1)} perc`;
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Nem használt";

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
    return date.toLocaleDateString("hu-HU");
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (rate) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Algoritmus Statisztikák</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">Hiba az algoritmus statisztikák betöltésekor: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900"> Algoritmus Statisztikák</h2>
        {algorithmStats.length > 0 && <span className="text-sm text-gray-500">{algorithmStats.reduce((sum, s) => sum + (s.totalRuns || 0), 0)} összes futás</span>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <span className="ml-3 text-gray-500">Betöltés...</span>
        </div>
      ) : algorithmStats.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nincsenek algoritmus statisztikák</p>
          <p className="text-sm text-gray-400 mt-1">Futtass útvonalakat az adatok gyűjtéséhez</p>
        </div>
      ) : (
        <div className="space-y-4">
          {algorithmStats.map((stat) => {
            const colors = algorithmColors[stat.algorithmType] || algorithmColors.none;
            const successRate = stat.successRate || 0;

            return (
              <div key={stat.algorithmType || stat.algorithmName} className={`rounded-xl border ${colors.border} ${colors.light} p-4 transition-all hover:shadow-md`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-12 rounded-full ${colors.bg}`}></div>
                    <div>
                      <h3 className={`font-bold ${colors.text}`}>{stat.algorithmName || stat.algorithmType}</h3>
                      <p className="text-sm text-gray-500">{stat.totalRuns || 0} futtatás</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400">Utolsó használat</span>
                    <p className="text-sm font-medium text-gray-600">{formatRelativeTime(stat.lastUsed)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-2 bg-white/60 rounded-lg">
                    <p className="text-lg font-bold text-gray-800">{formatExecutionTime(stat.avgExecutionTime)}</p>
                    <p className="text-xs text-gray-500">Átlag idő</p>
                  </div>

                  <div className="text-center p-2 bg-white/60 rounded-lg">
                    <p className={`text-lg font-bold ${stat.avgImprovement > 0 ? "text-green-600" : "text-gray-800"}`}>{stat.avgImprovement ? `${stat.avgImprovement > 0 ? "+" : ""}${stat.avgImprovement.toFixed(1)}%` : "—"}</p>
                    <p className="text-xs text-gray-500">Átlag javulás</p>
                  </div>

                  <div className="text-center p-2 bg-white/60 rounded-lg">
                    <p className={`text-lg font-bold ${getSuccessRateColor(successRate)}`}>{successRate.toFixed(0)}%</p>
                    <p className="text-xs text-gray-500">Siker ráta</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Sikeresség</span>
                    <span>{successRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${getProgressColor(successRate)}`} style={{ width: `${Math.min(100, successRate)}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlgorithmStatsSection;
