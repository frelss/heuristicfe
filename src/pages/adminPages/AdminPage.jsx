import { useState } from "react";
import { useGetRouteHistory, useDeleteRouteAdmin, useGetAlgorithmStatsAdmin, useGetSystemStatus, useGetSystemMetrics, useGetSystemLogs, useManualSystemCheck, useRestartAPI, useClearAdminCache } from "../../api/useAdmin";
import { useGetAllBugReports, useGetBugReportsByStatus, useUpdateBugReportStatus, useDeleteBugReport, useGetBugReportStats, useUpdateAdminNotes, useSearchBugReports } from "../../api/useBugReports";
import { BugReportsSection, AlgorithmStatsSection, SystemMonitoringSection, RouteHistorySection } from "../../components";
import toast from "../../utils/toast";

const AdminPage = () => {
  const [selectedBugStatus, setSelectedBugStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: routeHistory = [], isLoading: routeHistoryLoading, error: routeHistoryError } = useGetRouteHistory();
  const { data: algorithmStats = [], isLoading: algorithmStatsLoading, error: algorithmStatsError } = useGetAlgorithmStatsAdmin();
  const { data: systemStatus, isLoading: systemStatusLoading, error: systemStatusError } = useGetSystemStatus();
  const { data: systemMetrics, isLoading: systemMetricsLoading, error: systemMetricsError } = useGetSystemMetrics();
  const { data: systemLogs = [], isLoading: systemLogsLoading, error: systemLogsError } = useGetSystemLogs();

  const { data: allBugReports = [], isLoading: bugReportsLoading, error: bugReportsError } = useGetAllBugReports();
  const { data: bugReportsByStatus = [], isLoading: statusBugReportsLoading } = useGetBugReportsByStatus(selectedBugStatus);
  const { data: bugReportStats, isLoading: bugStatsLoading, error: bugStatsError } = useGetBugReportStats();

  const deleteRouteMutation = useDeleteRouteAdmin();
  const manualCheckMutation = useManualSystemCheck();
  const restartAPIMutation = useRestartAPI();
  const clearCacheMutation = useClearAdminCache();
  const updateBugStatusMutation = useUpdateBugReportStatus();
  const deleteBugMutation = useDeleteBugReport();
  const updateAdminNotesMutation = useUpdateAdminNotes();
  const searchBugMutation = useSearchBugReports();

  const displayedBugReports = selectedBugStatus === "all" ? allBugReports : bugReportsByStatus;
  const isBugReportsLoading = selectedBugStatus === "all" ? bugReportsLoading : statusBugReportsLoading;

  const handleClearCache = async () => {
    const confirmed = await toast.confirm({
      title: "Cache törlése",
      message: "Biztosan törlöd az admin cache-t? Ez átmenetileg lassíthatja a következő kéréseket.",
      type: "warning",
      confirmText: "🗑️ Törlés",
      cancelText: "Mégse",
      danger: true,
    });

    if (!confirmed) return;

    try {
      await clearCacheMutation.mutateAsync();
      toast.success("Admin cache sikeresen törölve.", "Kész");
    } catch (error) {
      console.error("Cache clear failed:", error);
      toast.error(error?.message || "Hiba a cache törlésekor.", "Sikertelen");
    }
  };

  const quickStats = [
    {
      label: "Útvonalak",
      value: routeHistory.length,
      icon: "",
      color: "blue",
    },
    {
      label: "Algoritmusok",
      value: algorithmStats.length,
      icon: "",
      color: "purple",
    },
    {
      label: "Hibajelentések",
      value: allBugReports.length,
      icon: "",
      color: "red",
    },
    {
      label: "Új hibák",
      value: allBugReports.filter((b) => b.status === "new").length,
      icon: "",
      color: "yellow",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Rendszer kezelés és monitoring</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {systemStatus && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    systemStatus.overallStatus === "healthy" ? "bg-green-100 text-green-700" : systemStatus.overallStatus === "warning" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${systemStatus.overallStatus === "healthy" ? "bg-green-500" : systemStatus.overallStatus === "warning" ? "bg-yellow-500" : "bg-red-500"} animate-pulse`}></span>
                  {systemStatus.overallStatus === "healthy" ? "Minden OK" : systemStatus.overallStatus === "warning" ? "Figyelmeztetés" : "Probléma"}
                </div>
              )}

              <button
                onClick={handleClearCache}
                disabled={clearCacheMutation.isPending}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {clearCacheMutation.isPending ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Törlés...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🗑️</span>
                    Cache törlése
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color === "blue" ? "text-blue-600" : stat.color === "purple" ? "text-purple-600" : stat.color === "red" ? "text-red-600" : "text-yellow-600"}`}>{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <RouteHistorySection routeHistory={routeHistory} isLoading={routeHistoryLoading} error={routeHistoryError} deleteRouteMutation={deleteRouteMutation} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AlgorithmStatsSection algorithmStats={algorithmStats} isLoading={algorithmStatsLoading} error={algorithmStatsError} />

          <SystemMonitoringSection
            systemStatus={systemStatus}
            systemStatusLoading={systemStatusLoading}
            systemStatusError={systemStatusError}
            systemMetrics={systemMetrics}
            systemMetricsLoading={systemMetricsLoading}
            systemMetricsError={systemMetricsError}
            systemLogs={systemLogs}
            systemLogsLoading={systemLogsLoading}
            systemLogsError={systemLogsError}
            manualCheckMutation={manualCheckMutation}
            restartAPIMutation={restartAPIMutation}
          />
        </div>

        <BugReportsSection
          displayedBugReports={displayedBugReports}
          isBugReportsLoading={isBugReportsLoading}
          bugReportsError={bugReportsError}
          bugReportStats={bugReportStats}
          bugStatsError={bugStatsError}
          selectedBugStatus={selectedBugStatus}
          setSelectedBugStatus={setSelectedBugStatus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          updateBugStatusMutation={updateBugStatusMutation}
          deleteBugMutation={deleteBugMutation}
          updateAdminNotesMutation={updateAdminNotesMutation}
          searchBugMutation={searchBugMutation}
        />
      </div>
    </div>
  );
};

export default AdminPage;
