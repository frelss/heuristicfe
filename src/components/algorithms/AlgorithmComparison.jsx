import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

const AlgorithmComparison = ({ algorithms, selectedAlgos, comparisonMetric, comparisonData, isLoading, onToggleAlgorithm, onMetricChange }) => {
  const metricOptions = [
    { value: "executionTime", label: "Futási idő", unit: "ms", formatValue: formatTime },
    { value: "improvement", label: "Javulás", unit: "%", formatValue: (v) => `${v > 0 ? "+" : ""}${v}%` },
    { value: "memoryUsage", label: "Memória", unit: "MB", formatValue: formatMemory },
  ];

  function formatTime(ms) {
    if (ms === null || ms === undefined) return "—";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  function formatMemory(mb) {
    if (mb === null || mb === undefined || mb < 0) return "—";
    if (mb < 1) return `${Math.round(mb * 1024)}KB`;
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)}GB`;
    return `${mb.toFixed(1)}MB`;
  }

  const currentMetric = metricOptions.find((m) => m.value === comparisonMetric) || metricOptions[0];

  const filteredData = comparisonData.filter((item) => selectedAlgos.includes(item.algorithmType)).filter((item) => item.value !== null && item.value !== undefined && item.value >= 0);

  const formatLabel = (value) => {
    if (value === null || value === undefined) return "";
    return currentMetric.formatValue(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasData = data.value !== null && data.value !== undefined && data.value >= 0;

      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-800 mb-1">{data.name}</p>
          {hasData ? (
            <>
              <p className="text-sm">
                <span className="text-gray-600">{currentMetric.label}:</span>
                <span className="font-bold ml-2">{currentMetric.formatValue(data.value)}</span>
              </p>
              {data.sampleSize > 0 && <p className="text-xs text-gray-500 mt-1">{data.sampleSize} minta alapján</p>}
            </>
          ) : (
            <p className="text-sm text-gray-500">Nincs elérhető adat</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Algoritmus összehasonlítás</h2>
          <p className="text-sm text-gray-500">Válaszd ki a metrikát és az algoritmusokat</p>
        </div>

        <select value={comparisonMetric} onChange={(e) => onMetricChange(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium">
          {metricOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600 self-center mr-2">Algoritmusok:</span>
        {algorithms.map((algo) => {
          const isSelected = selectedAlgos.includes(algo.id);
          return (
            <button
              key={algo.id}
              onClick={() => onToggleAlgorithm(algo.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                flex items-center gap-2
                ${isSelected ? "text-white shadow-md" : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400"}
              `}
              style={isSelected ? { backgroundColor: algo.color } : {}}
            >
              <div className={`w-3 h-3 rounded-full border-2 ${isSelected ? "bg-white" : ""}`} style={{ borderColor: isSelected ? "white" : algo.color }}></div>
              {algo.name}
            </button>
          );
        })}
      </div>

      <div className="h-80">
        {isLoading ? (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
              <p className="text-gray-500">Adatok betöltése...</p>
            </div>
          </div>
        ) : selectedAlgos.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-3 block">🔍</span>
              <p className="text-gray-500 font-medium">Válassz ki legalább egy algoritmust</p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-3 block">📊</span>
              <p className="text-gray-500 font-medium">Nincs elérhető adat ehhez a metrikához</p>
              <p className="text-sm text-gray-400 mt-1">{comparisonMetric === "memoryUsage" ? "A memóriahasználat nem mindig kerül rögzítésre" : "Futtass útvonalakat a kiválasztott algoritmusokkal"}</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickFormatter={(value) => {
                  if (comparisonMetric === "executionTime") {
                    return value >= 1000 ? `${(value / 1000).toFixed(0)}s` : `${value}`;
                  }
                  return value;
                }}
                label={{
                  value: currentMetric.label,
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fill: "#6B7280", fontSize: 12 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="value" position="top" formatter={formatLabel} style={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {filteredData.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          {comparisonMetric === "executionTime" && "⚡ Alacsonyabb érték = gyorsabb algoritmus"}
          {comparisonMetric === "improvement" && "📈 Magasabb érték = jobb optimalizálás (+ = javulás, - = romlás)"}
          {comparisonMetric === "memoryUsage" && "💾 Alacsonyabb érték = hatékonyabb memóriahasználat"}
        </div>
      )}

      {selectedAlgos.length > 0 && filteredData.length < selectedAlgos.length && filteredData.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">⚠️ Néhány kiválasztott algoritmushoz nincs elérhető adat ehhez a metrikához</p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmComparison;
