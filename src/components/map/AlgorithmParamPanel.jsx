import React, { useState, useEffect, useRef } from "react";

const PRESETS = {
  fast: {
    name: "Gyors",
    description: "Gyors eredmény, kisebb pontosság",
    hillClimb: { iterations: 50, enableRestart: false },
    genetic: { populationSize: 30, generations: 50, mutationRate: 0.15 },
    simulatedAnnealing: { temperature: 500, coolingRate: 0.98, iterations: 500 },
  },
  balanced: {
    name: "Kiegyensúlyozott",
    description: "Ajánlott - jó egyensúly sebesség és minőség között",
    hillClimb: { iterations: 150, enableRestart: true },
    genetic: { populationSize: 50, generations: 100, mutationRate: 0.15 },
    simulatedAnnealing: { temperature: 1000, coolingRate: 0.995, iterations: 2000 },
  },
  thorough: {
    name: "Alapos",
    description: "Legjobb eredmény, hosszabb futási idő",
    hillClimb: { iterations: 300, enableRestart: true },
    genetic: { populationSize: 100, generations: 200, mutationRate: 0.2 },
    simulatedAnnealing: { temperature: 2000, coolingRate: 0.997, iterations: 5000 },
  },
};

const AlgorithmParamPanel = ({ algorithm, onParamsChange }) => {
  const [selectedPreset, setSelectedPreset] = useState("balanced");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [params, setParams] = useState(() => {
    // Azonnal inicializálunk az alapértelmezett algoritmus és preset alapján
    if (algorithm && algorithm !== "none") {
      return PRESETS["balanced"][algorithm] || {};
    }
    return {};
  });

  const isFirstRender = useRef(true);

  // Ha algorithm változik kívülről, frissítjük a paramétereket
  useEffect(() => {
    if (algorithm && algorithm !== "none") {
      const newParams = PRESETS[selectedPreset][algorithm] || {};
      setParams(newParams);
      onParamsChange(newParams);
    }
  }, [algorithm]);

  // Ha preset változik, frissítjük a paramétereket
  useEffect(() => {
    if (algorithm && algorithm !== "none") {
      const newParams = PRESETS[selectedPreset][algorithm] || {};
      setParams(newParams);
      onParamsChange(newParams);
    }
  }, [selectedPreset]);

  // Első render: azonnal értesítjük a szülőt
  useEffect(() => {
    if (isFirstRender.current && algorithm && algorithm !== "none") {
      isFirstRender.current = false;
      const initialParams = PRESETS["balanced"][algorithm] || {};
      onParamsChange(initialParams);
    }
  }, []);

  const handleParamChange = (name, value) => {
    setParams((prev) => {
      const updated = { ...prev, [name]: value };
      onParamsChange(updated);
      return updated;
    });
  };

  const handlePresetChange = (presetKey) => {
    setSelectedPreset(presetKey);
  };

  if (!algorithm || algorithm === "none") return null;

  const getParam = (name, defaultVal) => params[name] ?? defaultVal;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Beállítás</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetChange(key)}
              className={`
                py-2 px-2 rounded-lg text-xs font-medium transition-all
                ${selectedPreset === key ? "bg-orange-500 text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:border-orange-300"}
              `}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1.5 text-center">{PRESETS[selectedPreset].description}</p>
      </div>

      <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
        <span>{showAdvanced ? "▼" : "▶"}</span>
        <span>Haladó beállítások</span>
      </button>

      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          {algorithm === "hillClimb" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Iterációk: {getParam("iterations", 150)}</label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={getParam("iterations", 150)}
                  onChange={(e) => handleParamChange("iterations", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>50</span>
                  <span>500</span>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={getParam("enableRestart", false)} onChange={(e) => handleParamChange("enableRestart", e.target.checked)} className="w-4 h-4 text-orange-500 rounded border-gray-300" />
                <span className="text-xs text-gray-700">Random restart</span>
              </label>
            </>
          )}

          {algorithm === "genetic" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Populáció: {getParam("populationSize", 50)}</label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={getParam("populationSize", 50)}
                  onChange={(e) => handleParamChange("populationSize", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>20</span>
                  <span>200</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Generációk: {getParam("generations", 100)}</label>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="10"
                  value={getParam("generations", 100)}
                  onChange={(e) => handleParamChange("generations", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>30</span>
                  <span>300</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mutáció: {(getParam("mutationRate", 0.15) * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.01"
                  value={getParam("mutationRate", 0.15)}
                  onChange={(e) => handleParamChange("mutationRate", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>5%</span>
                  <span>30%</span>
                </div>
              </div>
            </>
          )}

          {algorithm === "simulatedAnnealing" && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hőmérséklet: {getParam("temperature", 1000)}</label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={getParam("temperature", 1000)}
                  onChange={(e) => handleParamChange("temperature", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>100</span>
                  <span>5000</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Hűtési ráta: {(getParam("coolingRate", 0.995) * 100).toFixed(1)}%</label>
                <input
                  type="range"
                  min="0.9"
                  max="0.999"
                  step="0.001"
                  value={getParam("coolingRate", 0.995)}
                  onChange={(e) => handleParamChange("coolingRate", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>90% (gyors)</span>
                  <span>99.9% (lassú)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Iterációk: {getParam("iterations", 2000)}</label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={getParam("iterations", 2000)}
                  onChange={(e) => handleParamChange("iterations", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>500</span>
                  <span>10000</span>
                </div>
              </div>
            </>
          )}

          <button onClick={() => handlePresetChange(selectedPreset)} className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            Visszaállítás alapértelmezettre
          </button>
        </div>
      )}
    </div>
  );
};

export default AlgorithmParamPanel;
