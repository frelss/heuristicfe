import { useState } from "react";
import BugReportModal from "./BugReportsModal";

const Footer = () => {
  const [showBugReport, setShowBugReport] = useState(false);

  return (
    <footer className="bg-blue-600 text-white py-4 mt-auto relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p className="text-blue-100 text-sm">Heurisztikus Algoritmusok - Útvonal Optimalizálás © {new Date().getFullYear()}</p>

          <button onClick={() => setShowBugReport(true)} className="group flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 group-hover:bg-blue-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            Hiba bejelentése
          </button>
        </div>
      </div>

      <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />
    </footer>
  );
};

export default Footer;
