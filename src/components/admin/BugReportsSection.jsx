import React, { useState } from "react";
import BugDetailsModal from "./BugDetailsModal";
import BugActionsModal from "./BugActionsModal";
import toast from "../../utils/toast";

const BugReportsSection = ({
  displayedBugReports,
  isBugReportsLoading,
  bugReportsError,
  bugReportStats,
  bugStatsError,
  selectedBugStatus,
  setSelectedBugStatus,
  searchTerm,
  setSearchTerm,
  updateBugStatusMutation,
  deleteBugMutation,
  updateAdminNotesMutation,
  searchBugMutation,
}) => {
  const [selectedBug, setSelectedBug] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      new: "bg-red-100 text-red-800 border-red-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
      duplicate: "bg-purple-100 text-purple-800 border-purple-200",
      wont_fix: "bg-gray-100 text-gray-600 border-gray-200",
    };

    const statusNames = {
      new: "Új",
      in_progress: "Folyamatban",
      resolved: "Megoldva",
      closed: "Lezárva",
      duplicate: "Duplikátum",
      wont_fix: "Nem javítjuk",
    };

    return <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || statusStyles.new}`}>{statusNames[status] || status}</span>;
  };

  const PriorityBadge = ({ priority }) => {
    const priorityStyles = {
      low: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200",
    };

    const priorityNames = {
      low: "Alacsony",
      medium: "Közepes",
      high: "Magas",
      critical: "Kritikus",
    };

    return <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${priorityStyles[priority] || priorityStyles.medium}`}>{priorityNames[priority] || priority}</span>;
  };

  const TypeBadge = ({ type }) => {
    const typeStyles = {
      bug: "bg-red-100 text-red-800 border-red-200",
      ui: "bg-purple-100 text-purple-800 border-purple-200",
      performance: "bg-blue-100 text-blue-800 border-blue-200",
      suggestion: "bg-green-100 text-green-800 border-green-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const typeNames = {
      bug: "Működési hiba",
      ui: "UI probléma",
      performance: "Teljesítmény probléma",
      suggestion: "Javaslat",
      other: "Egyéb",
    };

    return <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${typeStyles[type] || typeStyles.other}`}>{typeNames[type] || type}</span>;
  };

  const BugStatsPanel = () => {
    if (!bugReportStats || bugStatsError) return null;

    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Statisztikák</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Mai bejelentések:</span>
            <span className="ml-2 font-semibold">{bugReportStats.todayReportsCount || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Heti bejelentések:</span>
            <span className="ml-2 font-semibold">{bugReportStats.weeklyReportsCount || 0}</span>
          </div>
          <div>
            <span className="text-gray-600">Átlagos megoldási idő:</span>
            <span className="ml-2 font-semibold">{bugReportStats.averageResolutionTimeInDays ? `${Math.round(bugReportStats.averageResolutionTimeInDays)} nap` : "N/A"}</span>
          </div>
          <div>
            <span className="text-gray-600">Utolsó frissítés:</span>
            <span className="ml-2 font-semibold">{bugReportStats.lastUpdated ? new Date(bugReportStats.lastUpdated).toLocaleTimeString("hu-HU") : "Most"}</span>
          </div>
        </div>
      </div>
    );
  };

  const handleBugStatusFilterChange = (e) => {
    setSelectedBugStatus(e.target.value);
  };

  const handleSearchBugs = async () => {
    if (searchTerm.trim()) {
      try {
        await searchBugMutation.mutateAsync(searchTerm.trim());
        toast.success("Találatok frissítve.", "Keresés");
      } catch (error) {
        console.error("Search failed:", error);
        toast.error(error?.message || "Hiba a keresés során.", "Keresés sikertelen");
      }
    }
  };

  const handleUpdateBugStatus = async (id, newStatus) => {
    try {
      await updateBugStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success("A státusz frissítve lett.", "Mentve");
      setShowActionsModal(false);
    } catch (error) {
      console.error("Failed to update bug status:", error);
      toast.error(error?.message || "Hiba a státusz frissítésekor.", "Sikertelen");
    }
  };

  const handleDeleteBug = async (id) => {
    const bugTitle = selectedBug?.description ? `#${id} — ${selectedBug.description.slice(0, 40)}${selectedBug.description.length > 40 ? "…" : ""}` : `#${id}`;

    const confirmed = await toast.confirm({
      title: "Hibabejelentés törlése",
      message: `Biztosan törölni szeretnéd ezt a hibabejelentést?\n${bugTitle}\nEz a művelet nem vonható vissza.`,
      type: "warning",
      confirmText: "🗑️ Törlés",
      cancelText: "Mégse",
      danger: true,
    });

    if (!confirmed) return;

    try {
      await deleteBugMutation.mutateAsync(id);
      toast.success("A hibabejelentés törölve lett.", "Törlés kész");
      setShowActionsModal(false);
    } catch (error) {
      console.error("Failed to delete bug report:", error);
      toast.error(error?.message || "Hiba a hibabejelentés törlésekor.", "Törlés sikertelen");
    }
  };

  const handleUpdateAdminNotes = async (id, notes) => {
    try {
      await updateAdminNotesMutation.mutateAsync({ id, notes });
      toast.success("Admin jegyzet frissítve.", "Mentve");
      setShowActionsModal(false);
    } catch (error) {
      console.error("Failed to update admin notes:", error);
      toast.error(error?.message || "Hiba az admin jegyzet frissítésekor.", "Sikertelen");
    }
  };

  const openDetailsModal = (bug) => {
    setSelectedBug(bug);
    setShowDetailsModal(true);
  };

  const openActionsModal = (bug) => {
    setSelectedBug(bug);
    setShowActionsModal(true);
  };

  const closeModals = () => {
    setSelectedBug(null);
    setShowDetailsModal(false);
    setShowActionsModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">Hibabejelentések</h2>
          {bugReportStats && (
            <div className="ml-4 flex space-x-3 text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md">Összes: {bugReportStats.totalReports || 0}</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md">Új: {bugReportStats.newReportsCount || 0}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex">
            <input
              type="text"
              placeholder="Keresés..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === "Enter" && handleSearchBugs()}
            />
            <button onClick={handleSearchBugs} disabled={searchBugMutation.isPending} className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50">
              {searchBugMutation.isPending ? "..." : "🔍"}
            </button>
          </div>

          <div className="relative">
            <select className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedBugStatus} onChange={handleBugStatusFilterChange}>
              <option value="all">Összes státusz</option>
              <option value="new">Új</option>
              <option value="in_progress">Folyamatban</option>
              <option value="resolved">Megoldva</option>
              <option value="closed">Lezárva</option>
              <option value="duplicate">Duplikátum</option>
              <option value="wont_fix">Nem javítjuk</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {bugReportsError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Hiba a hibabejelentések betöltésekor: {bugReportsError.message}</div>}

      <BugStatsPanel />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dátum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Státusz</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Típus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioritás</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probléma</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oldal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Felhasználó</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Műveletek</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isBugReportsLoading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  Betöltés...
                </td>
              </tr>
            ) : displayedBugReports.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  {searchTerm ? "Nincs találat a keresési feltételekre" : "Nincsenek hibabejelentések"}
                </td>
              </tr>
            ) : (
              displayedBugReports.map((bug) => (
                <tr key={bug.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bug.createdDate ? new Date(bug.createdDate).toLocaleString("hu-HU") : "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={bug.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TypeBadge type={bug.type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={bug.priority} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={bug.description}>
                      {bug.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bug.page || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bug.userEmail || "Anonymous"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openActionsModal(bug)} className="text-gray-600 hover:text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                      <button onClick={() => openDetailsModal(bug)} className="text-blue-600 hover:text-blue-900">
                        Részletek
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedBug && <BugDetailsModal bug={selectedBug} onClose={closeModals} />}

      {showActionsModal && selectedBug && (
        <BugActionsModal
          bug={selectedBug}
          onClose={closeModals}
          onUpdateStatus={handleUpdateBugStatus}
          onDelete={handleDeleteBug}
          onUpdateNotes={handleUpdateAdminNotes}
          updateBugStatusMutation={updateBugStatusMutation}
          deleteBugMutation={deleteBugMutation}
          updateAdminNotesMutation={updateAdminNotesMutation}
        />
      )}
    </div>
  );
};

export default BugReportsSection;
