import { Link, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useAdminLogin, useAdminLogout, useVerifyAdminToken } from "../../api/useAdmin";
import toast from "../../utils/toast";

const Navbar = () => {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const adminLoginMutation = useAdminLogin();
  const adminLogoutMutation = useAdminLogout();
  const { data: tokenVerification, isError: tokenError } = useVerifyAdminToken();

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true";
    const hasToken = !!localStorage.getItem("adminToken");

    if (adminStatus && hasToken && !tokenError) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      if (tokenError) {
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminToken");
      }
    }
  }, [tokenVerification, tokenError]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await adminLoginMutation.mutateAsync(password);

      if (result.success) {
        toast.success("Sikeres admin bejelentkezés", "Üdv!");
        setIsAdmin(true);
        setShowAdminModal(false);
        setPassword("");
        navigate("/admin");
      } else {
        toast.error(result.message || "Helytelen jelszó", "Bejelentkezés sikertelen");
      }
    } catch (error) {
      toast.error(error?.message || "Bejelentkezési hiba", "Hiba");
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogoutMutation.mutateAsync();
      toast.info("Sikeresen kijelentkeztél", "Admin");
      setIsAdmin(false);

      if (location.pathname === "/admin") {
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.warning("Kijelentkeztetés helyben megtörtént", "Figyelem");
      setIsAdmin(false);

      if (location.pathname === "/admin") {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    if (!showAdminModal) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") handleModalClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAdminModal]);

  const handleModalClose = () => {
    setShowAdminModal(false);
    setPassword("");
    setLoginError("");
  };

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-white text-xl font-semibold">Útvonal optimalizáló</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
              Főoldal
            </Link>
            <Link to="/map" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
              Térkép
            </Link>
            <Link to="/algorithms" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
              Algoritmusok
            </Link>
            <Link to="/history" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
              Előzmények
            </Link>

            {isAdmin ? (
              <>
                <Link to="/admin" className="text-white bg-red-700 hover:bg-red-800 px-3 py-2 rounded-md">
                  Admin Panel
                </Link>
                <button onClick={handleLogout} disabled={adminLogoutMutation.isPending} className="text-white hover:bg-blue-700 px-3 py-2 rounded-md disabled:opacity-50">
                  {adminLogoutMutation.isPending ? "Kijelentkezés..." : "Kijelentkezés"}
                </button>
              </>
            ) : (
              <button onClick={() => setShowAdminModal(true)} className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {showAdminModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleModalClose();
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-white">🔐</div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Admin bejelentkezés</h2>
                    <p className="text-sm text-white/80">Add meg az admin jelszót a folytatáshoz</p>
                  </div>
                </div>

                <button type="button" onClick={handleModalClose} className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white/90 hover:bg-white/20 transition" aria-label="Bezárás" disabled={adminLoginMutation.isPending}>
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="px-6 py-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jelszó</label>

              <div className="relative">
                <input
                  autoFocus
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-gray-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 disabled:bg-gray-50"
                  required
                  disabled={adminLoginMutation.isPending}
                  placeholder="••••••••"
                />
              </div>

              {loginError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="font-semibold mb-0.5">Sikertelen bejelentkezés</div>
                  <div className="text-red-700/90">{loginError}</div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button type="button" onClick={handleModalClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50" disabled={adminLoginMutation.isPending}>
                  Mégsem
                </button>

                <button type="submit" className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition disabled:opacity-50" disabled={adminLoginMutation.isPending}>
                  {adminLoginMutation.isPending ? "Bejelentkezés..." : "Belépés"}
                </button>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Tipp: <span className="font-medium">ESC</span> bezárja a modalt, Enter belép.
              </p>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
