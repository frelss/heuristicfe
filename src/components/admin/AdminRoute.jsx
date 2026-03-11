import { Navigate } from "react-router";
import { useEffect } from "react";
import { useVerifyAdminToken } from "../../api/useAdmin";

const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const hasToken = !!localStorage.getItem("adminToken");

  const { data: tokenVerification, isLoading, isError } = useVerifyAdminToken();

  useEffect(() => {
    if (isError || (tokenVerification && !tokenVerification.valid)) {
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminToken");
    }
  }, [isError, tokenVerification]);

  if (!isAdmin || !hasToken) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Admin hozzáférés ellenőrzése...</p>
        </div>
      </div>
    );
  }

  if (isError || (tokenVerification && !tokenVerification.valid)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
