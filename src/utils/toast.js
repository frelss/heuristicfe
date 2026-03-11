import Swal from "sweetalert2";

let stylesInjected = false;
function injectSwalStyles() {
  if (stylesInjected) return;
  stylesInjected = true;

  const style = document.createElement("style");
  style.setAttribute("data-swal-theme", "premium");
  style.textContent = `
    /* popup */
    .swal2-popup.swal2-premium-popup{
      border-radius: 18px !important;
      padding: 22px 22px 18px !important;
      box-shadow: 0 18px 50px rgba(0,0,0,.18) !important;
      border: 1px solid rgba(229,231,235,.9) !important;
    }
    .swal2-title.swal2-premium-title{
      font-size: 18px !important;
      line-height: 1.25 !important;
      font-weight: 700 !important;
      color: #111827 !important;
      margin: 0 0 8px !important;
    }
    .swal2-html-container.swal2-premium-html{
      font-size: 14px !important;
      color: #374151 !important;
      margin: 0 !important;
    }
    .swal2-actions.swal2-premium-actions{
      margin-top: 18px !important;
      gap: 10px !important;
    }
    .swal2-styled.swal2-premium-btn{
      border-radius: 12px !important;
      padding: 10px 14px !important;
      font-weight: 700 !important;
      letter-spacing: .2px !important;
      box-shadow: 0 8px 20px rgba(0,0,0,.12) !important;
      transition: transform .08s ease, filter .15s ease !important;
    }
    .swal2-styled.swal2-premium-btn:active{
      transform: translateY(1px) !important;
      filter: brightness(.98) !important;
    }
    .swal2-styled.swal2-premium-cancel{
      background: #F3F4F6 !important;
      color: #111827 !important;
      border: 1px solid rgba(209,213,219,.9) !important;
      box-shadow: none !important;
    }

    /* toast */
    .swal2-popup.swal2-premium-toast{
      border-radius: 16px !important;
      padding: 10px 12px !important;
      border: 1px solid rgba(229,231,235,.9) !important;
      box-shadow: 0 14px 40px rgba(0,0,0,.18) !important;
      background: rgba(255,255,255,.92) !important;
      backdrop-filter: blur(10px) !important;
    }
    .swal2-title.swal2-premium-toast-title{
      font-size: 13px !important;
      font-weight: 800 !important;
      color: #111827 !important;
    }
    .swal2-html-container.swal2-premium-toast-text{
      font-size: 12px !important;
      color: #374151 !important;
      margin: 2px 0 0 !important;
    }
    .swal2-close.swal2-premium-close{
      width: 28px !important;
      height: 28px !important;
      border-radius: 10px !important;
      color: #6B7280 !important;
      transition: background .15s ease, color .15s ease !important;
    }
    .swal2-close.swal2-premium-close:hover{
      background: rgba(17,24,39,.06) !important;
      color: #111827 !important;
    }

    /* icon */
    .swal2-icon{
      transform: scale(.92) !important;
      margin: 0 .55em 0 0 !important;
    }
  `;
  document.head.appendChild(style);
}

const PremiumSwal = Swal.mixin({
  background: "#fff",
  color: "#111827",
  customClass: {
    popup: "swal2-premium-popup",
    title: "swal2-premium-title",
    htmlContainer: "swal2-premium-html",
    actions: "swal2-premium-actions",
    confirmButton: "swal2-premium-btn",
    cancelButton: "swal2-premium-btn swal2-premium-cancel",
  },
  buttonsStyling: true,
  showClass: { popup: "swal2-show" },
  hideClass: { popup: "swal2-hide" },
});

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  timer: 4500,
  timerProgressBar: true,
  showConfirmButton: false,
  showCloseButton: true,
  closeButtonHtml: "✕",
  customClass: {
    popup: "swal2-premium-toast",
    title: "swal2-premium-toast-title",
    htmlContainer: "swal2-premium-toast-text",
    closeButton: "swal2-premium-close",
    timerProgressBar: "swal2-premium-bar",
  },
  didOpen: (toastEl) => {
    toastEl.addEventListener("mouseenter", Swal.stopTimer);
    toastEl.addEventListener("mouseleave", Swal.resumeTimer);

    toastEl.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.classList && target.classList.contains("swal2-close")) return;
      Swal.close();
    });
  },
});

export const toast = {
  success: (message, title = "Siker") => {
    injectSwalStyles();
    return Toast.fire({
      icon: "success",
      title,
      html: message ? `<div>${message}</div>` : "",
      iconColor: "#10B981",
    });
  },

  error: (message, title = "Hiba") => {
    injectSwalStyles();
    return Toast.fire({
      icon: "error",
      title,
      html: message ? `<div>${message}</div>` : "",
      iconColor: "#EF4444",
    });
  },

  warning: (message, title = "Figyelem") => {
    injectSwalStyles();
    return Toast.fire({
      icon: "warning",
      title,
      html: message ? `<div>${message}</div>` : "",
      iconColor: "#F59E0B",
    });
  },

  info: (message, title = "Infó") => {
    injectSwalStyles();
    return Toast.fire({
      icon: "info",
      title,
      html: message ? `<div>${message}</div>` : "",
      iconColor: "#3B82F6",
    });
  },

  confirm: async (options = {}) => {
    injectSwalStyles();

    const { title = "Megerősítés", message = "Biztosan folytatod?", confirmText = "Igen", cancelText = "Mégse", type = "question", danger = false } = typeof options === "string" ? { message: options } : options;

    const result = await PremiumSwal.fire({
      title,
      text: message,
      icon: type,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: danger ? "#EF4444" : "#111827",
      cancelButtonColor: "#F3F4F6",
      iconColor: type === "warning" ? "#F59E0B" : type === "error" ? "#EF4444" : type === "info" ? "#3B82F6" : "#111827",
    });

    return result.isConfirmed;
  },

  confirmDelete: async (itemName = "ezt az elemet") => {
    return toast.confirm({
      title: "Törlés megerősítése",
      message: `Biztosan törölni szeretnéd: ${itemName}?`,
      type: "warning",
      danger: true,
      confirmText: "🗑️ Törlés",
      cancelText: "Mégse",
    });
  },

  modal: async (options = {}) => {
    injectSwalStyles();

    const { title = "Információ", message = "", type = "info", details = null, buttonText = "Rendben" } = options;

    let html = message ? `<p style="margin:0 0 12px;">${message}</p>` : "";

    if (details && details.length) {
      html += `
        <div style="
          border:1px solid rgba(229,231,235,.9);
          background:#F9FAFB;
          border-radius:14px;
          overflow:hidden;
        ">
          ${details
            .map(
              (d, idx) => `
              <div style="
                display:flex;
                justify-content:space-between;
                padding:10px 12px;
                ${idx ? "border-top:1px solid rgba(229,231,235,.9);" : ""}
              ">
                <span style="color:#6B7280;">${d.label}</span>
                <span style="font-weight:700; color:#111827;">${d.value}</span>
              </div>
            `,
            )
            .join("")}
        </div>
      `;
    }

    return PremiumSwal.fire({
      title,
      html,
      icon: type,
      confirmButtonText: buttonText,
      confirmButtonColor: "#111827",
      iconColor: type === "success" ? "#10B981" : type === "warning" ? "#F59E0B" : type === "error" ? "#EF4444" : "#3B82F6",
    });
  },

  loading: (message = "Kérlek várj...") => {
    injectSwalStyles();
    return PremiumSwal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });
  },

  closeLoading: () => Swal.close(),

  prompt: async (options = {}) => {
    injectSwalStyles();

    const { title = "Adat megadása", placeholder = "", inputType = "text", confirmText = "OK", cancelText = "Mégse" } = options;

    const result = await PremiumSwal.fire({
      title,
      input: inputType,
      inputPlaceholder: placeholder,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: "#111827",
      inputValidator: (value) => (!value ? "Kérlek adj meg egy értéket!" : null),
    });

    return result.isConfirmed ? result.value : null;
  },
};

export default toast;
