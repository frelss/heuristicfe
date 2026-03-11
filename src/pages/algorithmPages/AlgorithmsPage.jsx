import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAlgorithmPerformance, useCompareAlgorithms, useAlgorithmRankings, useUsageStats } from "../../api/useRoute";

import AlgorithmCards from "../../components/algorithms/AlgorithmCards";
import AlgorithmComparison from "../../components/algorithms/AlgorithmComparison";
import AlgorithmRanking from "../../components/algorithms/AlgorithmRanking";
import UsageStatsChart from "../../components/algorithms/UsageStatsChart";

const AlgorithmsPage = () => {
  const algorithms = [
    {
      id: "hillClimb",
      name: "Hegymászó algoritmus",
      color: "#10B981",
      description: "Lokális keresés, mindig a jobb szomszédot választja",
    },
    {
      id: "genetic",
      name: "Genetikus algoritmus",
      color: "#8B5CF6",
      description: "Evolúciós megközelítés populációval és mutációval",
    },
    {
      id: "simulatedAnnealing",
      name: "Szimulált hűtés",
      color: "#3B82F6",
      description: "Valószínűségi elfogadás, elkerüli a lokális optimumot",
    },
  ];

  const [selectedAlgos, setSelectedAlgos] = useState(algorithms.map((a) => a.id));
  const [comparisonMetric, setComparisonMetric] = useState("executionTime");
  const [rankingCriteria, setRankingCriteria] = useState("overall");

  const { data: performanceData, isLoading: perfLoading, error: perfError } = useAlgorithmPerformance();
  const { data: usageStats, isLoading: usageLoading } = useUsageStats();
  const compareAlgorithmsMutation = useCompareAlgorithms();
  const algorithmRankingsMutation = useAlgorithmRankings();

  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  const [rankingData, setRankingData] = useState([]);

  useEffect(() => {
    if (selectedAlgos.length === 0) {
      setComparisonData([]);
      return;
    }

    setComparisonLoading(true);
    compareAlgorithmsMutation
      .mutateAsync({ algorithms: selectedAlgos, metric: comparisonMetric })
      .then((data) => {
        setComparisonData(formatComparisonData(data, comparisonMetric));
      })
      .catch((err) => {
        console.error("Comparison error:", err);
        setComparisonData([]);
      })
      .finally(() => setComparisonLoading(false));
  }, [selectedAlgos, comparisonMetric]);

  useEffect(() => {
    algorithmRankingsMutation
      .mutateAsync(rankingCriteria)
      .then((data) => setRankingData(data || []))
      .catch((err) => {
        console.error("Ranking error:", err);
        setRankingData([]);
      });
  }, [rankingCriteria]);

  const formatComparisonData = (apiData, metric) => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) return [];

    return apiData.map((item) => {
      const algo = algorithms.find((a) => a.id === item.algorithmType);
      let value = 0;

      if (item.metricData) {
        value = item.metricData.average || item.metricData.value || 0;
      }

      return {
        name: algo?.name || item.algorithmName || item.algorithmType,
        algorithmType: item.algorithmType,
        value: Math.round(value * 10) / 10,
        sampleSize: item.sampleSize || 0,
        color: algo?.color || "#6B7280",
      };
    });
  };

  const toggleAlgorithm = (id) => {
    setSelectedAlgos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  if (perfLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Teljesítményadatok betöltése...</p>
        </div>
      </div>
    );
  }

  if (perfError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold text-red-700 mb-2">Hiba történt</h2>
          <p className="text-red-600">{perfError.message || "Nem sikerült betölteni az adatokat"}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Újratöltés
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Algoritmus elemzés</h1>
          <p className="text-gray-600 mt-1">Heurisztikus algoritmusok teljesítményének összehasonlítása</p>
        </div>

        {performanceData && (
          <div className="flex gap-6">
            <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{performanceData.totalRoutes || 0}</div>
              <div className="text-xs text-gray-600">Összes útvonal</div>
            </div>
            <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{performanceData.totalAlgorithms || 3}</div>
              <div className="text-xs text-gray-600">Algoritmus</div>
            </div>
          </div>
        )}
      </div>

      <AlgorithmCards algorithms={algorithms} performanceData={performanceData} usageStats={usageStats} />

      <UsageStatsChart usageStats={usageStats} algorithms={algorithms} isLoading={usageLoading} />

      <AlgorithmComparison
        algorithms={algorithms}
        selectedAlgos={selectedAlgos}
        comparisonMetric={comparisonMetric}
        comparisonData={comparisonData}
        isLoading={comparisonLoading}
        onToggleAlgorithm={toggleAlgorithm}
        onMetricChange={setComparisonMetric}
      />

      <AlgorithmRanking algorithms={algorithms} rankingCriteria={rankingCriteria} rankingData={rankingData} isLoading={algorithmRankingsMutation.isPending} onCriteriaChange={setRankingCriteria} />

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Próbáld ki az algoritmusokat!</h3>
          <p className="text-gray-600 mb-4">Generálj útvonalakat és hasonlítsd össze a teljesítményt valós időben.</p>
          <div className="flex justify-center gap-3">
            <Link to="/map" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Térképhez
            </Link>
            <Link to="/history" className="px-5 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium">
              Mentett útvonalak
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmsPage;
