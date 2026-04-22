import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  UserPlus, Hash, User, Mail, Lock, Eye, EyeOff,
  ShieldCheck, CheckCircle, Users,
} from "lucide-react";
import http from "../../api/http";
import { useAuth } from "../../features/auth/AuthContext";

const StudentRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    setSubmitting(true);
    setServerError("");
    try {
      const { data } = await http.post("/auth/student/register", values);
      login({ token: data.token, user: data.user });
      navigate("/student/election");
    } catch (error) {
      const data = error.response?.data;
      const firstDetail = data?.details?.[0]?.msg;
      setServerError(firstDetail || data?.message || "Registration failed. Please try again.");
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
            Create Your<br />Student Account
          </h1>
          <p className="mt-4 text-base text-brand-50/90">
            Register with your matriculation number to participate in Student Union elections securely and transparently.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <ShieldCheck className="mb-2 h-5 w-5 text-brand-200" />
              <p className="text-sm font-semibold">Secure Voting</p>
              <p className="mt-1 text-xs text-brand-50/80">Your ballot is private and tamper-proof.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <CheckCircle className="mb-2 h-5 w-5 text-brand-200" />
              <p className="text-sm font-semibold">One Vote Only</p>
              <p className="mt-1 text-xs text-brand-50/80">The system enforces a single vote per student.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <Users className="mb-2 h-5 w-5 text-brand-200" />
              <p className="text-sm font-semibold">Your Voice</p>
              <p className="mt-1 text-xs text-brand-50/80">Shape the leadership of your student union.</p>
            </div>
          </div>
        </section>

        {/* Right form panel */}
        <section className="rounded-[2rem] bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">New Student</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Create Account</h2>
            </div>
            <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900">
              Sign In
            </Link>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Matric Number */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Matriculation Number</label>
              <div className="relative">
                <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("matric_no", { required: "Matric number is required" })}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-brand-500"
                  placeholder="e.g. 202500001"
                />
              </div>
              {errors.matric_no && <p className="mt-1.5 text-xs text-red-600">{errors.matric_no.message}</p>}
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("full_name", { required: "Full name is required" })}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-brand-500"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.full_name && <p className="mt-1.5 text-xs text-red-600">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-brand-500"
                  placeholder="you@stu.trinity.edu.ng"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })}
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-11 outline-none transition focus:border-brand-500"
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  {...register("confirm_password", {
                    required: "Please confirm your password",
                    validate: (val) => val === watch("password") || "Passwords do not match",
                  })}
                  type={showConfirm ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-11 outline-none transition focus:border-brand-500"
                  placeholder="Re-enter your password"
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="mt-1.5 text-xs text-red-600">{errors.confirm_password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/" className="font-semibold text-brand-700 hover:text-brand-900">Sign in here</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
