import React, { useEffect, useMemo } from "react";

const IconX = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const formatHu = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("hu-HU");
};

const Badge = ({ children, tone = "gray" }) => {
  const tones = {
    gray: "bg-gray-50 text-gray-800 border-gray-200",
    red: "bg-red-50 text-red-800 border-red-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    green: "bg-green-50 text-green-800 border-green-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    orange: "bg-orange-50 text-orange-800 border-orange-200",
  };

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.gray}`}>{children}</span>;
};

const statusMeta = (status) => {
  const map = {
    new: { label: "Új", tone: "red" },
    in_progress: { label: "Folyamatban", tone: "yellow" },
    resolved: { label: "Megoldva", tone: "green" },
    closed: { label: "Lezárva", tone: "gray" },
    duplicate: { label: "Duplikátum", tone: "purple" },
    wont_fix: { label: "Nem javítjuk", tone: "gray" },
  };
  return map[status] || { label: status || "N/A", tone: "gray" };
};

const priorityMeta = (priority) => {
  const map = {
    low: { label: "Alacsony", tone: "blue" },
    medium: { label: "Közepes", tone: "yellow" },
    high: { label: "Magas", tone: "orange" },
    critical: { label: "Kritikus", tone: "red" },
  };
  return map[priority] || { label: priority || "N/A", tone: "gray" };
};

const typeMeta = (type) => {
  const map = {
    bug: { label: "Működési hiba", tone: "red" },
    ui: { label: "UI probléma", tone: "purple" },
    performance: { label: "Teljesítmény probléma", tone: "blue" },
    suggestion: { label: "Javaslat", tone: "green" },
    other: { label: "Egyéb", tone: "gray" },
  };
  return map[type] || { label: type || "N/A", tone: "gray" };
};

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium tracking-wide text-gray-500">{label}</p>
    <div className="text-sm text-gray-900">{children}</div>
  </div>
);

const Card = ({ title, children, className = "" }) => (
  <section className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
    {title ? <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3> : null}
    {children}
  </section>
);

const BugDetailsModal = ({ bug, onClose }) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const headerPreview = useMemo(() => {
    const d = (bug?.description || "").trim();
    if (!d) return "—";
    return d.length > 100 ? `${d.slice(0, 100)}…` : d;
  }, [bug?.description]);

  const s = statusMeta(bug?.status);
  const p = priorityMeta(bug?.priority);
  const t = typeMeta(bug?.type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-4 border-b bg-gradient-to-b from-gray-50 to-white px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Hibabejelentés részletei</h2>
              <Badge tone="gray">#{bug?.id ?? "—"}</Badge>
              <Badge tone={s.tone}>{s.label}</Badge>
              <Badge tone={t.tone}>{t.label}</Badge>
              <Badge tone={p.tone}>{p.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">{headerPreview}</p>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Bezárás">
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-4">
            <Card title="Összefoglaló">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="ID">
                  <span className="text-base font-semibold">{bug?.id ?? "—"}</span>
                </Field>
                <Field label="Létrehozva">{formatHu(bug?.createdDate)}</Field>
                <Field label="Frissítve">{bug?.updatedDate ? formatHu(bug?.updatedDate) : "—"}</Field>
                <Field label="Megoldva">{bug?.resolvedDate ? formatHu(bug?.resolvedDate) : "—"}</Field>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Felhasználó">
                  <span className="break-all">{bug?.userEmail || "Anonymous"}</span>
                </Field>
                <Field label="Oldal">
                  <span className="break-all">{bug?.page || "N/A"}</span>
                </Field>
                <Field label="Státusz / Típus / Prioritás">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={s.tone}>{s.label}</Badge>
                    <Badge tone={t.tone}>{t.label}</Badge>
                    <Badge tone={p.tone}>{p.label}</Badge>
                  </div>
                </Field>
              </div>
            </Card>

            <Card title="Probléma leírása">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="whitespace-pre-wrap text-sm text-gray-900">{bug?.description || "—"}</p>
              </div>
            </Card>

            {bug?.adminNotes ? (
              <Card title="Admin jegyzet" className="border-blue-200">
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm text-blue-900">{bug.adminNotes}</p>
                </div>
              </Card>
            ) : null}

            {bug?.userAgent || bug?.browserInfo ? (
              <Card title="Technikai információk">
                {bug?.userAgent ? (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-medium tracking-wide text-gray-500">Böngésző információ (User-Agent)</p>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="break-words font-mono text-xs text-gray-700">{bug.userAgent}</p>
                    </div>
                  </div>
                ) : null}

                {bug?.browserInfo ? (
                  <div>
                    <p className="mb-1 text-xs font-medium tracking-wide text-gray-500">További információk</p>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <p className="break-words text-xs text-gray-700">{bug.browserInfo}</p>
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
};

export default BugDetailsModal;
