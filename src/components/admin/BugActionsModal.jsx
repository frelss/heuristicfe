import React, { useEffect, useMemo, useState } from "react";

const Spinner = ({ className = "" }) => <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-b-transparent ${className}`} aria-label="Loading" />;

const Badge = ({ children }) => <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700">{children}</span>;

const IconX = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconCheck = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6L9 17l-5-5" />
  </svg>
);

const IconLock = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11V7a4 4 0 00-8 0v4m0 0h8m-8 0a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2v-6a2 2 0 00-2-2" transform="translate(6 0)" />
  </svg>
);

const IconTrash = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const BugActionsModal = ({ bug, onClose, onUpdateStatus, onDelete, onUpdateNotes, updateBugStatusMutation, deleteBugMutation, updateAdminNotesMutation }) => {
  const [notes, setNotes] = useState(bug.adminNotes || "");
  const [showNotesInput, setShowNotesInput] = useState(false);

  useEffect(() => {
    setNotes(bug.adminNotes || "");
  }, [bug.adminNotes]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const preview = useMemo(() => {
    const d = (bug?.description || "").trim();
    if (!d) return "—";
    return d.length > 90 ? `${d.slice(0, 90)}…` : d;
  }, [bug?.description]);

  const isStatusDisabled = (status) => {
    return updateBugStatusMutation.isPending || bug.status === status || (status !== "new" && (bug.status === "resolved" || bug.status === "closed"));
  };

  const handleNotesSubmit = () => {
    onUpdateNotes?.(bug.id, notes);
    setShowNotesInput(false);
  };

  const pending = {
    status: !!updateBugStatusMutation.isPending,
    notes: !!updateAdminNotesMutation.isPending,
    del: !!deleteBugMutation.isPending,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // backdrop click -> close
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b bg-gradient-to-b from-gray-50 to-white px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Műveletek</h2>
              <Badge>#{bug.id}</Badge>
              <Badge>{bug.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-600">{preview}</p>
          </div>

          <button onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Bezárás">
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-6">
          {/* Status */}
          <section>
            <h3 className="mb-3 text-sm font-medium text-gray-800">Státusz módosítása</h3>
            <div className="space-y-2">
              <button
                onClick={() => onUpdateStatus?.(bug.id, "resolved")}
                disabled={isStatusDisabled("resolved")}
                className={[
                  "w-full rounded-xl border px-4 py-3 text-left transition",
                  "focus:outline-none focus:ring-2 focus:ring-green-500",
                  isStatusDisabled("resolved") ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400" : "border-green-200 bg-green-50 text-green-900 hover:bg-green-100",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-5 w-5" />
                    <span className="font-medium">Megoldva</span>
                  </div>
                  {pending.status && <Spinner className="text-green-700" />}
                </div>
              </button>

              <button
                onClick={() => onUpdateStatus?.(bug.id, "closed")}
                disabled={isStatusDisabled("closed")}
                className={[
                  "w-full rounded-xl border px-4 py-3 text-left transition",
                  "focus:outline-none focus:ring-2 focus:ring-gray-500",
                  isStatusDisabled("closed") ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconLock className="h-5 w-5" />
                    <span className="font-medium">Lezárva</span>
                  </div>
                  {pending.status && <Spinner className="text-gray-700" />}
                </div>
              </button>
            </div>
          </section>

          {/* Notes */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-800">Admin jegyzet</h3>
              {bug.adminNotes ? <span className="text-xs text-gray-500">van meglévő jegyzet</span> : null}
            </div>

            {!showNotesInput ? (
              <div className="space-y-3">
                {bug.adminNotes ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <p className="text-sm text-blue-900 whitespace-pre-wrap">{bug.adminNotes}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-600">Még nincs admin jegyzet.</p>
                  </div>
                )}

                <button
                  onClick={() => setShowNotesInput(true)}
                  disabled={pending.notes}
                  className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                >
                  {bug.adminNotes ? "Jegyzet szerkesztése" : "Jegyzet hozzáadása"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Admin jegyzet..."
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleNotesSubmit}
                    disabled={pending.notes}
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  >
                    {pending.notes ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Spinner className="text-white" />
                        Mentés…
                      </span>
                    ) : (
                      "Mentés"
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowNotesInput(false);
                      setNotes(bug.adminNotes || "");
                    }}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Danger zone */}
          <section className="rounded-2xl border border-red-200 bg-red-50/40 p-4">
            <h3 className="mb-2 text-sm font-semibold text-red-800">Veszélyes műveletek</h3>
            <p className="mb-3 text-xs text-red-700">A törlés végleges. Ha bizonytalan vagy, inkább zárd le a hibát.</p>

            <button
              onClick={() => onDelete?.(bug.id)}
              disabled={pending.del}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
            >
              {pending.del ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="text-red-600" />
                  Törlés…
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <IconTrash className="h-5 w-5" />
                  Hibabejelentés törlése
                </span>
              )}
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-6 py-4">
          <button onClick={onClose} className="rounded-xl bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
};

export default BugActionsModal;
