import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const UsageStatsChart = ({ usageStats, algorithms, isLoading }) => {
  if (!usageStats || Object.keys(usageStats).length === 0) {
    return null;
  }

  const chartData = algorithms
    .map((algo) => ({
      name: algo.name,
      value: usageStats[algo.id] || 0,
      color: algo.color,
      id: algo.id,
    }))
    .filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return null;
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} futás ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Használati arányok</h2>
          <p className="text-sm text-gray-500">Algoritmusok népszerűsége a mentett útvonalak alapján</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{total}</div>
          <div className="text-xs text-gray-500">összes futás</div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={100} innerRadius={40} dataKey="value" stroke="white" strokeWidth={2}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full md:w-1/2 md:pl-8">
            <div className="space-y-3">
              {chartData.map((item, index) => {
                const percent = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{item.value}</span>
                      <span className="text-sm text-gray-500 ml-2">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageStatsChart;
