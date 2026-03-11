const AlgorithmSelector = ({ selectedAlgorithm, onSelectAlgorithm }) => {
  const algorithms = [
    {
      id: "none",
      name: "Csak ORS útvonal (algoritmus nélkül)",
      description: "Gyors, de nem optimalizált waypoint sorrend",
      bestFor: "2-3 pont, gyors tervezés",
    },
    {
      id: "hillClimb",
      name: "Hegymászó algoritmus",
      description: "Gyors lokális keresés, jó kezdeti megoldásokhoz",
      bestFor: "5-10 pont, gyorsaság prioritás",
      icon: "",
    },
    {
      id: "genetic",
      name: "Genetikus algoritmus",
      description: "Legjobb megoldás, lassabb, diverzitás",
      bestFor: "10+ pont, legjobb minőség",
      icon: "",
    },
    {
      id: "simulatedAnnealing",
      name: "Szimulált hűtés",
      description: "Kiegyensúlyozott: jó minőség, közepes sebesség",
      bestFor: "5-20 pont, kiegyensúlyozott választás",
      icon: "",
    },
  ];

  const selectedAlgoDetails = algorithms.find((a) => a.id === selectedAlgorithm);

  return (
    <div className="my-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">Algoritmus</label>

      <select
        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        value={selectedAlgorithm}
        onChange={(e) => onSelectAlgorithm(e.target.value)}
      >
        {algorithms.map((algo) => (
          <option key={algo.id} value={algo.id}>
            {algo.icon ? `${algo.icon} ` : ""}
            {algo.name}
          </option>
        ))}
      </select>

      {selectedAlgoDetails && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Leírás:</span> {selectedAlgoDetails.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector;
