import { Link } from "react-router";

const AlgorithmCards = ({ algorithms, performanceData, usageStats }) => {
  const formatExecutionTime = (ms) => {
    if (ms === null || ms === undefined) return null;

    if (ms < 1000) {
      return { value: Math.round(ms), unit: "ms" };
    } else if (ms < 60000) {
      return { value: (ms / 1000).toFixed(1), unit: "s" };
    } else {
      return { value: (ms / 60000).toFixed(1), unit: "perc" };
    }
  };

  const formatMemory = (mb) => {
    if (mb === null || mb === undefined || mb < 0) return null;

    if (mb < 1) {
      return { value: Math.round(mb * 1024), unit: "KB" };
    } else if (mb >= 1024) {
      return { value: (mb / 1024).toFixed(1), unit: "GB" };
    } else {
      return { value: mb.toFixed(1), unit: "MB" };
    }
  };

  const getAlgoStats = (algoId) => {
    if (!performanceData?.averageStatsByAlgorithm) return null;
    return performanceData.averageStatsByAlgorithm[algoId];
  };

  const getUsageCount = (algoId) => {
    if (!usageStats) return 0;
    return usageStats[algoId] || 0;
  };

  const getPerformanceBadge = (stats) => {
    if (!stats || stats.averageImprovement === null || stats.averageImprovement === undefined) return null;

    const improvement = stats.averageImprovement || 0;

    if (improvement >= 20) return { text: "Kiváló", color: "bg-green-100 text-green-700" };
    if (improvement >= 10) return { text: "Jó", color: "bg-blue-100 text-blue-700" };
    if (improvement >= 5) return { text: "Közepes", color: "bg-yellow-100 text-yellow-700" };
    if (improvement > 0) return { text: "Alacsony", color: "bg-gray-100 text-gray-600" };
    return { text: "Nincs javulás", color: "bg-red-100 text-red-600" };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {algorithms.map((algo) => {
        const stats = getAlgoStats(algo.id);
        const usage = getUsageCount(algo.id);
        const badge = getPerformanceBadge(stats);

        const formattedTime = stats ? formatExecutionTime(stats.averageExecutionTime) : null;
        const formattedMemory = stats ? formatMemory(stats.averageMemoryUsage) : null;

        return (
          <div key={algo.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="px-5 py-4 text-white" style={{ backgroundColor: algo.color }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{algo.name}</h3>
                  <p className="text-sm opacity-90 mt-0.5">{algo.description}</p>
                </div>
                {badge && <span className={`px-2 py-1 rounded text-xs font-bold ${badge.color}`}>{badge.text}</span>}
              </div>
            </div>

            <div className="p-5">
              {stats && (formattedTime || stats.averageImprovement !== undefined) ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      {formattedTime ? (
                        <>
                          <div className="text-xl font-bold text-gray-800">
                            {formattedTime.value}
                            <span className="text-sm font-normal text-gray-500 ml-1">{formattedTime.unit}</span>
                          </div>
                          <div className="text-xs text-gray-500">Átlag futási idő</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-bold text-gray-400">—</div>
                          <div className="text-xs text-gray-400">Nincs időadat</div>
                        </>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      {stats.averageImprovement !== null && stats.averageImprovement !== undefined ? (
                        <>
                          <div className={`text-xl font-bold ${stats.averageImprovement > 0 ? "text-green-600" : stats.averageImprovement < 0 ? "text-red-600" : "text-gray-800"}`}>
                            {stats.averageImprovement > 0 ? "+" : ""}
                            {Math.round((stats.averageImprovement || 0) * 10) / 10}
                            <span className="text-sm font-normal text-gray-500 ml-1">%</span>
                          </div>
                          <div className="text-xs text-gray-500">Átlag javulás</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-bold text-gray-400">—</div>
                          <div className="text-xs text-gray-400">Nincs adat</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Használat:</span>
                    <span className="font-medium text-gray-700">{usage} alkalommal</span>
                  </div>

                  {stats.successRate !== undefined && stats.successRate !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Sikerességi arány:</span>
                      <span className={`font-medium ${stats.successRate >= 80 ? "text-green-600" : stats.successRate >= 50 ? "text-yellow-600" : "text-red-600"}`}>{Math.round(stats.successRate || 0)}%</span>
                    </div>
                  )}

                  {formattedMemory && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Memória:</span>
                      <span className="font-medium text-gray-700">
                        {formattedMemory.value} {formattedMemory.unit}
                      </span>
                    </div>
                  )}

                  {stats.totalRuns !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Összesen:</span>
                      <span className="font-medium text-gray-700">{stats.totalRuns} futás</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-3xl mb-2 block">📊</span>
                  <p className="text-sm text-gray-500">Még nincs elegendő adat</p>
                  <p className="text-xs text-gray-400 mt-1">Futtass útvonalakat az adatokhoz</p>
                </div>
              )}

              <Link
                to={`/map?algorithm=${algo.id}`}
                className="mt-4 block text-center py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                style={{
                  backgroundColor: `${algo.color}15`,
                  color: algo.color,
                }}
              >
                Kipróbálom →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlgorithmCards;
