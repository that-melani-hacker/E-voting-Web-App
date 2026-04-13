import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Vote, LogOut } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";

const LayoutShell = ({ title, children }) => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl bg-white/90 p-5 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.jpg" alt="Trinity University" className="h-12 w-12 rounded-xl object-contain" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
                  Trinity University
                </p>
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <p className="text-xs text-slate-500">Secure, transparent, and auditable e-voting.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {auth?.user?.role === "student" && (
                <Link
                  to="/student/election"
                  className="flex items-center gap-1.5 rounded-full border border-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  <Vote className="h-4 w-4" />
                  Ballot
                </Link>
              )}
              {auth?.user?.role !== "student" && auth?.user && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 rounded-full border border-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              {auth?.user && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
};

export default LayoutShell;
