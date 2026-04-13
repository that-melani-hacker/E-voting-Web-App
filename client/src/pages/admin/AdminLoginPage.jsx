import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import http from "../../api/http";
import { useAuth } from "../../features/auth/AuthContext";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    setServerError("");
    try {
      const { data } = await http.post("/auth/admin/login", values);
      login({ token: data.token, user: data.user });
      navigate("/admin/dashboard");
    } catch (error) {
      setServerError(error.response?.data?.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo + branding */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/logo.jpg" alt="Trinity University" className="h-20 w-20 rounded-2xl object-contain shadow-soft" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Trinity University</p>
            <p className="text-sm text-slate-500">Building on the Rock</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <ShieldCheck className="h-5 w-5 text-brand-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Election Administration</p>
              <h1 className="text-xl font-bold text-slate-900">Admin Sign In</h1>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-brand-500"
                  placeholder="admin@trinity.edu.ng"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("password", { required: "Password is required" })}
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-11 outline-none transition focus:border-brand-500"
                  placeholder="Enter your password"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {submitting ? "Signing in..." : "Login to Dashboard"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Student?{" "}
              <Link to="/" className="font-semibold text-brand-700 hover:text-brand-900">Go to student portal</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
