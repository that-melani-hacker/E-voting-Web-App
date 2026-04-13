import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Hash, Lock, Eye, EyeOff, ShieldCheck, FileSearch, CheckCircle, LogIn } from "lucide-react";
import http from "../../api/http";
import { useAuth } from "../../features/auth/AuthContext";

const StudentLoginPage = () => {
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
      const { data } = await http.post("/auth/student/login", values);
      login({ token: data.token, user: data.user });
      navigate("/student/election");
    } catch (error) {
      setServerError(error.response?.data?.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">

        {/* Left info panel */}
        <section className="rounded-[2rem] bg-brand-900 p-8 text-white shadow-soft flex flex-col">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Trinity University" className="h-14 w-14 rounded-xl object-contain bg-white p-1" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-100">Trinity University</p>
              <p className="text-sm text-brand-50/80">Building on the Rock</p>
            </div>
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-tight">
            Student Union<br />Election Portal
          </h1>
          <p className="mt-4 text-base text-brand-50/90">
            Cast your vote securely, privately, and exactly once. Every login, ballot submission,
            and admin action is auditable.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-brand-200" />
              <p className="text-sm font-semibold">Private Ballots</p>
              <p className="mt-1 text-xs text-brand-50/80">Votes are stored without linking them to student identity.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <FileSearch className="mb-2 h-5 w-5 text-brand-200" />
              <p className="text-sm font-semibold">Audit Trail</p>
              <p className="mt-1 text-xs text-brand-50/80">Logins, voting, and admin actions are fully traceable.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <CheckCircle className="mb-2 h-5 w-5 text-brand-200" />
              <p className="text-sm font-semibold">One Vote Rule</p>
              <p className="mt-1 text-xs text-brand-50/80">Backend enforcement prevents duplicate submissions.</p>
            </div>
          </div>
        </section>

        {/* Right form panel */}
        <section className="rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Student Login</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Access your ballot</h2>
            </div>
            <Link to="/admin" className="text-sm font-semibold text-brand-700 hover:text-brand-900">
              Admin Login
            </Link>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Matriculation Number</label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("matric_no", { required: "Matric number is required" })}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-brand-500"
                  placeholder="e.g. TU/24/0001"
                />
              </div>
              {errors.matric_no && <p className="mt-1.5 text-xs text-red-600">{errors.matric_no.message}</p>}
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
              {submitting ? "Signing in..." : "Login and Continue"}
            </button>

            <p className="text-center text-sm text-slate-500">
              New student?{" "}
              <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-900">
                Create an account
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default StudentLoginPage;
