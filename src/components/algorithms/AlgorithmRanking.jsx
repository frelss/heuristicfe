import React, { useState } from "react";

const AlgorithmRanking = ({ algorithms, rankingCriteria, rankingData, isLoading, onCriteriaChange }) => {
  const [showMethodology, setShowMethodology] = useState(false);

  const gradeColors = {
    A: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    B: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    C: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
    D: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
    F: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  };

  const RankBadge = ({ rank }) => {
    const badges = {
      1: { bg: "from-yellow-400 to-yellow-600", emoji: "" },
      2: { bg: "from-gray-300 to-gray-500", emoji: "" },
      3: { bg: "from-orange-400 to-orange-600", emoji: "" },
    };

    const badge = badges[rank];

    return (
      <div className="flex items-center gap-2">
        <div
          className={`
          w-10 h-10 rounded-full flex items-center justify-center 
          text-white font-bold shadow-md
          ${badge ? `bg-gradient-to-br ${badge.bg}` : "bg-gray-400"}
        `}
        >
          {rank}
        </div>
        {badge && <span className="text-xl">{badge.emoji}</span>}
      </div>
    );
  };

  const criteriaOptions = [
    { value: "overall", label: "Összesített", desc: "Minden szempont súlyozva (javulás 40%, hatékonyság 25%, sebesség 20%, konzisztencia 15%)" },
    { value: "speed", label: "Sebesség", desc: "Átlagos futási idő - alacsonyabb = jobb" },
    { value: "improvement", label: "Javulás", desc: "Átlagos távolság csökkenés százalékban" },
    { value: "efficiency", label: "Hatékonyság", desc: "Javulás / futási idő arány - több javulás kevesebb idő alatt" },
    { value: "consistency", label: "Konzisztencia", desc: "Eredmények stabilitása - alacsony szórás = megbízhatóbb" },
  ];

  const currentCriteria = criteriaOptions.find((c) => c.value === rankingCriteria);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Teljesítmény rangsor</h2>
            <p className="text-sm text-gray-500">Algoritmusok értékelése a kiválasztott kritérium alapján</p>
          </div>

          <select value={rankingCriteria} onChange={(e) => onCriteriaChange(e.target.value)} className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium">
            {criteriaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {currentCriteria && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{currentCriteria.label}:</span> {currentCriteria.desc}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-500">Rangsor betöltése...</p>
          </div>
        ) : rankingData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rang</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Algoritmus</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pontszám</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Osztályzat</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Minták</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rankingData.map((item, index) => {
                  const algo = algorithms.find((a) => a.id === item.algorithmType);
                  const grade = gradeColors[item.performanceGrade] || gradeColors.C;
                  const isLowSample = (item.sampleSize || 0) < 5;

                  const score = item.score || 0;

                  const getProgressColor = (score) => {
                    if (score >= 80) return "from-green-400 to-green-600";
                    if (score >= 60) return "from-blue-400 to-blue-600";
                    if (score >= 40) return "from-yellow-400 to-yellow-600";
                    return "from-red-400 to-red-600";
                  };

                  return (
                    <tr key={item.algorithmType} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <RankBadge rank={item.rank || index + 1} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: algo?.color || "#6B7280" }}></div>
                          <span className="font-semibold text-gray-900">{item.algorithmName || algo?.name || item.algorithmType}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="font-bold text-lg text-gray-900">
                            {Math.round(score * 10) / 10}
                            <span className="text-sm font-normal text-gray-500">/100</span>
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div className={`h-2.5 rounded-full bg-gradient-to-r ${getProgressColor(score)} transition-all duration-500`} style={{ width: `${score}%` }}></div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`
                          inline-flex px-3 py-1.5 rounded-lg text-sm font-bold
                          ${grade.bg} ${grade.text} ${grade.border} border
                        `}
                        >
                          {item.performanceGrade || "?"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isLowSample ? "text-yellow-600" : "text-gray-700"}`}>{item.sampleSize || 0} futás</span>
                          {isLowSample && (
                            <span className="text-yellow-500 cursor-help" title="Kevés minta - legalább 20 - 30 futás ajánlott a megbízható értékeléshez">
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📊</span>
            <p className="text-gray-500 font-medium">Még nincsenek rangsorolási adatok</p>
            <p className="text-sm text-gray-400 mt-2">Futtass útvonalakat az értékeléshez</p>
          </div>
        )}

        <button onClick={() => setShowMethodology(!showMethodology)} className="mt-6 w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors flex items-center justify-center gap-2">
          <span>{showMethodology ? "▼" : "▶"}</span>
          Értékelési módszertan
        </button>
      </div>

      {showMethodology && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Értékelési módszertan</h3>
              <p className="text-sm text-gray-600">Hogyan számítjuk a pontszámokat (0-100 skála)</p>
            </div>
          </div>

          {/* Osztályzatok */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[
              { grade: "A", range: "90-100", label: "Kiváló", bgClass: "bg-green-100", borderClass: "border-green-400", textClass: "text-green-700" },
              { grade: "B", range: "80-89", label: "Jó", bgClass: "bg-blue-100", borderClass: "border-blue-400", textClass: "text-blue-700" },
              { grade: "C", range: "70-79", label: "Közepes", bgClass: "bg-yellow-100", borderClass: "border-yellow-400", textClass: "text-yellow-700" },
              { grade: "D", range: "60-69", label: "Elégséges", bgClass: "bg-orange-100", borderClass: "border-orange-400", textClass: "text-orange-700" },
              { grade: "F", range: "<60", label: "Gyenge", bgClass: "bg-red-100", borderClass: "border-red-400", textClass: "text-red-700" },
            ].map((item) => (
              <div key={item.grade} className={`${item.bgClass} border-2 ${item.borderClass} rounded-lg p-3 text-center`}>
                <div className={`text-2xl font-bold ${item.textClass}`}>{item.grade}</div>
                <div className="text-xs text-gray-600">{item.range}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>

          <h4 className="font-semibold text-gray-800 mb-3">Értékelési szempontok</h4>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              {
                name: "Javulási ráta",
                weight: "40%",
                desc: "Az optimalizálás hatékonysága - mennyivel rövidebb lett az útvonal",
                detail: "Az algoritmusok teljes tartományára normalizálva (legrosszabbtól a legjobbig)",
              },
              {
                name: "Hatékonyság",
                weight: "25%",
                desc: "Javulás / futási idő arány",
                detail: "Több javulás kevesebb idő alatt = jobb hatékonyság",
              },
              {
                name: "Sebesség",
                weight: "20%",
                desc: "Átlagos végrehajtási idő",
                detail: "Algoritmusok közötti relatív összehasonlítás alapján",
              },
              {
                name: "Konzisztencia",
                weight: "15%",
                desc: "Eredmények stabilitása",
                detail: "Variációs koefficiens (szórás/átlag) alapján - alacsonyabb = megbízhatóbb",
              },
            ].map((item) => (
              <div key={item.name} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">{item.weight}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.desc}</p>
                <p className="text-xs text-gray-400">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold">Összesített pontszám képlet</span>
            </div>
            <div className="font-mono text-sm bg-white/20 rounded p-3">Pontszám = (Javulás × 0.40) + (Hatékonyság × 0.25) + (Sebesség × 0.20) + (Konzisztencia × 0.15)</div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Fontos megjegyzések</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>
                • Legalább <strong>20 - 30 futás</strong> szükséges az algoritmusonként a megbízható értékeléshez
              </li>
              <li>
                • A pontszámok az összes algoritmus teljesítményéhez vannak <strong>normalizálva</strong>
              </li>
              <li>
                • A konzisztencia értékeléséhez legalább <strong>15 minta</strong> szükséges
              </li>
              <li>• Ha nincs elég adat, a pontszámok nem feltétlenül reprezentatívak</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmRanking;
