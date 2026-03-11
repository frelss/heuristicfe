import toast from "../../utils/toast";

const SystemMonitoringSection = ({
  systemStatus,
  systemStatusLoading,
  systemStatusError,
  systemMetrics,
  systemMetricsLoading,
  systemMetricsError,
  systemLogs,
  systemLogsLoading,
  systemLogsError,
  manualCheckMutation,
  restartAPIMutation,
}) => {
  const statusStyles = {
    online: {
      bg: "bg-green-100",
      border: "border-green-200",
      text: "text-green-800",
      dot: "bg-green-500",
      textSecondary: "text-green-600",
    },
    healthy: {
      bg: "bg-green-100",
      border: "border-green-200",
      text: "text-green-800",
      dot: "bg-green-500",
      textSecondary: "text-green-600",
    },
    ok: {
      bg: "bg-green-100",
      border: "border-green-200",
      text: "text-green-800",
      dot: "bg-green-500",
      textSecondary: "text-green-600",
    },
    slow: {
      bg: "bg-yellow-100",
      border: "border-yellow-200",
      text: "text-yellow-800",
      dot: "bg-yellow-500",
      textSecondary: "text-yellow-600",
    },
    warning: {
      bg: "bg-yellow-100",
      border: "border-yellow-200",
      text: "text-yellow-800",
      dot: "bg-yellow-500",
      textSecondary: "text-yellow-600",
    },
    offline: {
      bg: "bg-red-100",
      border: "border-red-200",
      text: "text-red-800",
      dot: "bg-red-500",
      textSecondary: "text-red-600",
    },
    error: {
      bg: "bg-red-100",
      border: "border-red-200",
      text: "text-red-800",
      dot: "bg-red-500",
      textSecondary: "text-red-600",
    },
    critical: {
      bg: "bg-red-100",
      border: "border-red-200",
      text: "text-red-800",
      dot: "bg-red-500",
      textSecondary: "text-red-600",
    },
    default: {
      bg: "bg-gray-100",
      border: "border-gray-200",
      text: "text-gray-800",
      dot: "bg-gray-500",
      textSecondary: "text-gray-600",
    },
  };

  const getStatusStyle = (status) => {
    const key = status?.toLowerCase();
    return statusStyles[key] || statusStyles.default;
  };

  const getLogColor = (level) => {
    switch (level?.toUpperCase()) {
      case "ERROR":
        return "text-red-600";
      case "WARN":
      case "WARNING":
        return "text-yellow-600";
      case "DEBUG":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const handleManualSystemCheck = async () => {
    try {
      await manualCheckMutation.mutateAsync();
      toast.success("Rendszer ellenőrzés elindítva.", "Indítva");
    } catch (error) {
      console.error("Manual system check failed:", error);
      toast.error(error?.message || "Hiba a rendszer ellenőrzéskor.", "Sikertelen");
    }
  };

  const handleRestartAPI = async () => {
    const confirmed = await toast.confirm({
      title: "API újraindítása",
      message: "Biztosan újra szeretnéd indítani az API-t?\nEz rövid ideig elérhetetlenné teheti a szolgáltatásokat.",
      type: "warning",
      confirmText: "Újraindítás",
      cancelText: "Mégse",
      danger: true,
    });

    if (!confirmed) return;

    try {
      await restartAPIMutation.mutateAsync();
      toast.success("API újraindítás elindítva.", "Indítva");
    } catch (error) {
      console.error("API restart failed:", error);
      toast.error(error?.message || "Hiba az API újraindításakor.", "Sikertelen");
    }
  };

  const StatusCard = ({ title, icon, status, responseTime, lastCheck, details }) => {
    const style = getStatusStyle(status);
    const statusText = {
      online: "Online",
      healthy: "Egészséges",
      ok: "OK",
      slow: "Lassú",
      warning: "Figyelmeztetés",
      offline: "Offline",
      error: "Hiba",
      critical: "Kritikus",
    };

    return (
      <div className={`${style.bg} border ${style.border} rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className={`font-semibold ${style.text}`}>{title}</h3>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className={`w-3 h-3 rounded-full ${style.dot} animate-pulse`}></span>
          <span className={`font-medium ${style.text}`}>{statusText[status?.toLowerCase()] || status || "Ismeretlen"}</span>
        </div>

        {responseTime !== undefined && <p className={`text-sm ${style.textSecondary}`}>Válaszidő: {responseTime} ms</p>}

        {lastCheck && <p className={`text-xs ${style.textSecondary} mt-1`}>Utolsó ellenőrzés: {new Date(lastCheck).toLocaleTimeString("hu-HU")}</p>}
      </div>
    );
  };

  const MetricCard = ({ label, value, unit, icon, color = "blue" }) => {
    const colorClasses = {
      blue: "text-blue-600",
      green: "text-green-600",
      yellow: "text-yellow-600",
      red: "text-red-600",
      purple: "text-purple-600",
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">{label}</span>
          {icon && <span className="text-lg">{icon}</span>}
        </div>
        <div className={`text-2xl font-bold ${colorClasses[color] || colorClasses.blue} mt-1`}>
          {value}
          {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Rendszer Állapot</h2>
      </div>

      {systemStatusError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">Hiba a rendszer állapot betöltésekor: {systemStatusError.message}</div>}

      {systemStatusLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
          <span className="ml-3 text-gray-500">Állapot ellenőrzés...</span>
        </div>
      ) : systemStatus ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatusCard title="Adatbázis" icon="" status={systemStatus.database?.status} lastCheck={systemStatus.database?.lastCheck} details={systemStatus.database?.details} />
          <StatusCard title="Backend API" icon="" status={systemStatus.api?.status} responseTime={systemStatus.api?.responseTime} lastCheck={systemStatus.api?.lastCheck} />
          <StatusCard title="Térkép Szolgáltatás" icon="" status={systemStatus.mapService?.status} responseTime={systemStatus.mapService?.responseTime} lastCheck={systemStatus.mapService?.lastCheck} />
        </div>
      ) : null}

      {systemMetricsError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">Hiba a metrikák betöltésekor: {systemMetricsError.message}</div>}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Rendszer Metrikák</h3>
        {systemMetricsLoading ? (
          <div className="text-center text-gray-500 py-4">Metrikák betöltése...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <MetricCard label="Aktív felhasználók" value={systemMetrics?.activeUsers || 0} icon="" color="blue" />
            <MetricCard label="Mai keresések" value={systemMetrics?.todaySearches || 0} icon="" color="green" />
            <MetricCard label="API hívások/perc" value={systemMetrics?.apiCallsPerMinute || 0} icon="" color="purple" />
            <MetricCard label="CPU használat" value={systemMetrics?.serverCpuUsage || 0} unit="%" icon="" color={systemMetrics?.serverCpuUsage > 80 ? "red" : systemMetrics?.serverCpuUsage > 50 ? "yellow" : "green"} />
            {systemMetrics?.memoryUsage !== undefined && <MetricCard label="Memória" value={systemMetrics.memoryUsage} unit="%" icon="" color={systemMetrics.memoryUsage > 80 ? "red" : systemMetrics.memoryUsage > 50 ? "yellow" : "green"} />}
            {systemMetrics?.diskUsage !== undefined && <MetricCard label="Lemez" value={systemMetrics.diskUsage} unit="%" icon="" color={systemMetrics.diskUsage > 80 ? "red" : systemMetrics.diskUsage > 50 ? "yellow" : "green"} />}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Rendszer Napló</h3>
        {systemLogsError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-red-700 text-sm">Hiba a naplók betöltésekor: {systemLogsError.message}</div>}
        <div className="bg-gray-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-sm">
          {systemLogsLoading ? (
            <div className="text-gray-400">Naplók betöltése...</div>
          ) : systemLogs && systemLogs.length > 0 ? (
            systemLogs.map((log, index) => (
              <div key={index} className={`${getLogColor(log.level)} py-0.5`}>
                <span className="text-gray-500">[{log.timestamp || new Date().toLocaleTimeString()}]</span> <span className={`font-bold ${getLogColor(log.level)}`}>{log.level?.toUpperCase() || "INFO"}:</span>{" "}
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))
          ) : (
            <>
              <div className="text-gray-400 py-0.5">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> <span className="font-bold text-gray-400">INFO:</span> <span className="text-gray-300">Rendszer napló üres vagy nem elérhető</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={handleManualSystemCheck} disabled={manualCheckMutation?.isPending} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {manualCheckMutation?.isPending ? <>Ellenőrzés...</> : <>Rendszer ellenőrzés</>}
        </button>

        <button onClick={handleRestartAPI} disabled={restartAPIMutation?.isPending} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
          {restartAPIMutation?.isPending ? <>Újraindítás...</> : <>API újraindítása</>}
        </button>
      </div>
    </div>
  );
};

export default SystemMonitoringSection;
