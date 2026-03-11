import { Link } from "react-router";
import { algorithms } from "../../utils/algorithmData";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute top-10 -right-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <div className="text-center mb-14">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
                Heurisztikus algoritmusok
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">útvonal-optimalizálásban</span>
              </h1>

              <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/map" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-gray-900/20 hover:bg-black transition">
                  Útvonaltervező <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>

                <Link to="/algorithms" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 px-8 py-4 text-base font-semibold text-gray-800 ring-1 ring-gray-200 shadow-sm hover:bg-white transition">
                  Algoritmusok elemzése
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {algorithms.map((algo) => (
                <div key={algo.id} className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="h-1.5" style={{ backgroundColor: algo.color }} />
                  <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-60" style={{ backgroundColor: algo.color }} />

                  <div className="relative p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{algo.name}</h3>

                    <p className="text-gray-600 mb-5 leading-relaxed">{algo.description}</p>

                    <div className="space-y-2 mb-6">
                      {algo.pros.map((pro, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700">
                          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">✓</span>
                          {pro}
                        </div>
                      ))}
                    </div>

                    <Link to={`/map?algorithm=${algo.id}`} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition" style={{ backgroundColor: algo.color }}>
                      Kipróbálom <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
