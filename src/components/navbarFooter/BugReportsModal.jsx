import { useState } from "react";
import { useSubmitBugReport, useGetBugReportEnums } from "../../api/useBugReports";
import { useLocation } from "react-router";

const BugReportModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    description: "",
    type: "bug",
    priority: "medium",
    page: "",
    userEmail: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const location = useLocation();
  const submitBugMutation = useSubmitBugReport();
  const { data: enums } = useGetBugReportEnums();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      description: "",
      type: "bug",
      priority: "medium",
      page: "",
      userEmail: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const bugData = {
        ...formData,
        page: formData.page || `${location.pathname}${location.search}` || "Ismeretlen oldal",
      };

      await submitBugMutation.mutateAsync(bugData);
      setIsSubmitted(true);

      setTimeout(() => {
        setIsSubmitted(false);
        resetForm();
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Bug report submission failed:", error);
    }
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setIsSubmitted(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full text-center p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Köszönjük!</h3>
          <p className="text-gray-500 mb-6">A hibajelentést sikeresen rögzítettük. Hamarosan megvizsgáljuk.</p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              onClose();
            }}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-colors"
          >
            Rendben
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg text-gray-800 overflow-hidden">
        <div className="relative bg-gradient-to-r from-red-500 to-orange-500 px-6 py-5">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Hibabejelentés</h3>
                <p className="text-white/70 text-sm">Segíts jobbá tenni az alkalmazást</p>
              </div>
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
              Hiba leírása <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Részletesen írd le a tapasztalt hibát..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
              rows="4"
              required
              minLength="10"
              maxLength="2000"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${formData.description.length > 1800 ? "text-orange-500" : "text-gray-400"}`}>{formData.description.length}/2000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">
                Típus <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
              >
                {enums?.types ? (
                  Object.entries(enums.types).map(([key, displayName]) => (
                    <option key={key} value={key}>
                      {displayName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="bug">🐛 Működési hiba</option>
                    <option value="ui">🎨 UI probléma</option>
                    <option value="performance">⚡ Teljesítmény</option>
                    <option value="suggestion">💡 Javaslat</option>
                    <option value="other">📝 Egyéb</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="priority">
                Prioritás <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
              >
                {enums?.priorities ? (
                  Object.entries(enums.priorities).map(([key, displayName]) => (
                    <option key={key} value={key}>
                      {displayName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="low">🟢 Alacsony</option>
                    <option value="medium">🟡 Közepes</option>
                    <option value="high">🟠 Magas</option>
                    <option value="critical">🔴 Kritikus</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="page">
              Oldal / Komponens
            </label>
            <input
              id="page"
              name="page"
              type="text"
              value={formData.page}
              onChange={handleChange}
              placeholder={location.pathname}
              maxLength="200"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">Üresen hagyva az aktuális oldal lesz megadva</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="userEmail">
              Email cím <span className="text-gray-400 font-normal">(opcionális)</span>
            </label>
            <input
              id="userEmail"
              name="userEmail"
              type="email"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="email@example.com"
              maxLength="100"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">Értesítünk, ha megoldódott a probléma</p>
          </div>

          {submitBugMutation.isError && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-red-700">{submitBugMutation.error.message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitBugMutation.isPending} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
              Mégsem
            </button>
            <button
              type="submit"
              disabled={submitBugMutation.isPending || !formData.description.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitBugMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Küldés...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Beküldés
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugReportModal;
