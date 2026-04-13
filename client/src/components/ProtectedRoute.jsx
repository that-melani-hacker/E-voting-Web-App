import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { auth } = useAuth();

  if (!auth?.token || !auth?.user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

