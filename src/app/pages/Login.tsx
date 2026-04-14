import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { useAuth, UserRole, LoginFailureReason } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  Users,
  UserCog,
  Briefcase,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

const LOGO_DARK =
  "https://cdn.digitalmindsbpo.com/storage/2022/02/Digital-Minds-BPO-Footer-Logo-768x142.png";
const LOGO_LIGHT =
  "https://cdn.digitalmindsbpo.com/storage/2021/11/cropped-Digital_Minds_Logo_Original.png";
const LOGO_ROLE =
  "https://digitalmindsbpo.com/storage/2018/11/cropped-dm-favicon.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const getLoginMessage = (reason: LoginFailureReason) => {
    switch (reason) {
      case "invalid_credentials":
        return "Wrong email or password. Please check your credentials and try again.";
      case "blocked":
        return "Your account has been blocked from the system. Please contact the administrator.";
      case "role_mismatch":
        return "The selected role does not match your account. Please choose the correct role.";
      case "profile_not_found":
        return "Your account profile could not be found. Please contact the administrator.";
      default:
        return "Unable to sign in right now. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSelectedRole(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error || !data.user) {
      setShowRoleSelection(false);
      toast.error(getLoginMessage("invalid_credentials"), {
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role, is_blocked")
      .eq("auth_id", data.user.id)
      .single();

    await supabase.auth.signOut();

    if (profileError || !profile) {
      setShowRoleSelection(false);
      toast.error(getLoginMessage("profile_not_found"), {
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    if (profile.is_blocked) {
      setShowRoleSelection(false);
      toast.error(getLoginMessage("blocked"), {
        duration: 6000,
      });
    } else {
      setShowRoleSelection(true);
      toast.success("Credentials verified! Please select your role.");
    }

    setIsLoading(false);
  };

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (selectedRole) {
      const result = await login(formData.email, formData.password, selectedRole);
      if (result.success) {
        toast.success(`Logged in as ${selectedRole}`);
        navigate("/dashboard");
      } else {
        toast.error(getLoginMessage(result.reason || "unknown"), {
          duration: result.reason === "blocked" ? 6000 : 5000,
        });

        if (result.reason === "blocked" || result.reason === "invalid_credentials") {
          setShowRoleSelection(false);
          setSelectedRole(null);
        }
      }
    }
  };

  const handleBackToLogin = () => {
    setShowRoleSelection(false);
    setSelectedRole(null);
  };

  const roles: Array<{ value: UserRole; icon: typeof Users; description: string }> = [
    {
      value: "Admin",
      icon: Shield,
      description: "Full system access and management"
    },
    {
      value: "IT Officers",
      icon: UserCog,
      description: "IT Department"
    },
    {
      value: "HR Officers",
      icon: Briefcase,
      description: "HR Department"
    }
  ];

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-6 sm:px-4 ${
        isDark
          ? "bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#111111]"
          : "bg-gradient-to-br from-white via-slate-50 to-amber-50"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_20%_80%,rgba(176,191,0,0.16)_0%,transparent_45%)]"
            : "bg-[radial-gradient(circle_at_20%_80%,rgba(176,191,0,0.08)_0%,transparent_45%)]"
        }`}
      />
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05)_0%,transparent_45%)]"
            : "bg-[radial-gradient(circle_at_80%_20%,rgba(31,79,140,0.08)_0%,transparent_45%)]"
        }`}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px] animate-pulse ${
            isDark ? "bg-[#B0BF00]/8" : "bg-[#B0BF00]/10"
          }`}
          style={{ animationDuration: "5s" }}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full blur-[140px] animate-pulse ${
            isDark ? "bg-white/6" : "bg-sky-200/40"
          }`}
          style={{ animationDuration: "7s", animationDelay: "1s" }}
        />
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        className={`absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur transition-colors sm:right-6 sm:top-6 ${
          isDark
            ? "border-[#2a2a2a] bg-[#111111]/95 text-slate-100 hover:bg-[#161616]"
            : "border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-50"
        }`}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="hidden sm:inline">{isDark ? "Light" : "Dark"} Mode</span>
      </button>

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Logo and Company Info */}
        <div className="text-center">
          <div className="mb-5 inline-flex items-center justify-center group sm:mb-8">
            <div className="relative flex items-center justify-center">
              <img
                src={isDark ? LOGO_DARK : LOGO_LIGHT}
                alt="Digital Minds BPO Services Inc."
                className="relative z-10 h-24 w-auto max-w-[260px] object-contain drop-shadow-md transition-all duration-500 group-hover:scale-105 sm:h-32 sm:max-w-[320px] md:h-40 md:max-w-[380px] lg:h-44 lg:max-w-[440px]"
              />
            </div>
          </div>
          <h1 className={`mb-3 text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Welcome Back
          </h1>
          <p className={`mb-2 text-base sm:text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Inventory Management System
          </p>
          <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[#B0BF00]" />
              Efficient
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-[#B0BF00]" />
              Secure
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-[#B0BF00]" />
              Fast
            </span>
          </div>
        </div>

        {/* Login Form - Enhanced Glass-morphism */}
        {!showRoleSelection && (
          <div
            className={`rounded-[28px] border p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 sm:p-8 lg:p-10 ${
              isDark
                ? "border-[#B0BF00]/60 bg-[#0b0b0b] shadow-[0_24px_70px_rgba(0,0,0,0.58)]"
                : "border-[#B0BF00]/35 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-700"}`}
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#7f8f00] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    required
                    disabled={isLoading}
                    className={`h-12 rounded-2xl pl-11 transition-all duration-200 focus:border-[#B0BF00] focus:ring-2 focus:ring-[#B0BF00]/15 ${
                      isDark
                        ? "border-[#2f2f2f] bg-[#171717] text-slate-100 placeholder:text-slate-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-700"}`}
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#7f8f00] transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    required
                    disabled={isLoading}
                    className={`h-12 rounded-2xl pl-11 pr-12 transition-all duration-200 focus:border-[#B0BF00] focus:ring-2 focus:ring-[#B0BF00]/15 ${
                      isDark
                        ? "border-[#2f2f2f] bg-[#171717] text-slate-100 placeholder:text-slate-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center transition-colors hover:text-[#7f8f00] ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="group relative h-12 w-full overflow-hidden rounded-2xl bg-[#B0BF00] font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#9FAE00] hover:shadow-xl hover:shadow-[#B0BF00]/20"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? "Signing in..." : "Sign In"}
                  {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#B0BF00] to-[#C5D400] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </form>

            <div className="mt-6 space-y-4 text-center sm:mt-8">
              <button
                type="button"
                className="text-sm font-medium text-[#B0BF00] transition-colors hover:text-[#d7e25f] hover:underline"
              >
                Forgot your password?
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDark ? "border-[#B0BF00]/30" : "border-slate-200"}`} />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className={`px-4 ${isDark ? "bg-[#0b0b0b] text-slate-400" : "bg-white text-slate-500"}`}>
                    New to Digital Minds?
                  </span>
                </div>
              </div>
              <div className={`text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <p>Contact your system administrator to create an account</p>
              </div>
            </div>
          </div>
        )}

        {/* Role Selection */}
        {showRoleSelection && (
          <div
            className={`rounded-[28px] border p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-300 sm:p-8 lg:p-10 ${
              isDark
                ? "border-[#B0BF00]/60 bg-[#0b0b0b] shadow-[0_24px_70px_rgba(0,0,0,0.58)]"
                : "border-[#B0BF00]/35 bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
            }`}
          >
            <div
              className={`mb-5 rounded-2xl border p-4 shadow-sm sm:mb-6 sm:p-5 ${
                isDark
                  ? "border-[#B0BF00]/30 bg-[#121212]"
                  : "border-[#B0BF00]/20 bg-gradient-to-r from-[#f7fad8] via-white to-[#eef3c2]"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 sm:h-14 sm:w-14 ${
                    isDark ? "bg-[#0b0b0b] ring-[#B0BF00]/25" : "bg-white ring-[#B0BF00]/20"
                  }`}
                >
                  <img
                    src={LOGO_ROLE}
                    alt="Digital Minds logo"
                    className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-[#d7e25f]" : "text-[#7f8f00]"}`}>
                    Role Verification
                  </p>
                  <h2 className={`mt-1 text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    Select Your Role
                  </h2>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Choose your department to continue
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelection(role.value)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-300 sm:gap-4 ${
                      selectedRole === role.value
                        ? isDark
                          ? "border-[#B0BF00] bg-[#121212] shadow-lg shadow-black/35"
                          : "border-[#B0BF00] bg-[#f7fad8] shadow-lg shadow-[#B0BF00]/10"
                        : isDark
                          ? "border-[#2f2f2f] bg-[#101010] hover:border-[#B0BF00]/50 hover:bg-[#141414]"
                          : "border-[#B0BF00]/20 bg-white hover:border-[#B0BF00]/40 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
                      selectedRole === role.value
                        ? "bg-[#B0BF00] text-white"
                        : isDark
                          ? "bg-[#151515] text-[#B0BF00]"
                          : "bg-[#f8fafc] text-[#7f8f00]"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <h3 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {role.value}
                      </h3>
                      <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {role.description}
                      </p>
                    </div>
                    {selectedRole === role.value && (
                      <CheckCircle2 className="w-5 h-5 text-[#B0BF00]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <Button
                type="button"
                onClick={handleBackToLogin}
                className={`h-12 flex-1 rounded-2xl border font-semibold transition-all duration-300 ${
                  isDark
                    ? "border-[#B0BF00]/40 bg-[#111111] text-slate-100 hover:bg-[#151515]"
                    : "border-[#B0BF00]/25 bg-white text-slate-700 hover:border-[#B0BF00]/40 hover:bg-slate-50"
                }`}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!selectedRole}
                className="group relative h-12 flex-1 overflow-hidden rounded-2xl bg-[#B0BF00] font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#9FAE00] hover:shadow-xl hover:shadow-[#B0BF00]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Continue
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#B0BF00] to-[#C5D400] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className={`mb-4 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            © 2026 Digital Minds BPO Services Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button className="text-xs text-slate-500 hover:text-[#7f8f00] transition-colors">
              Privacy Policy
            </button>
            <span className="hidden sm:inline text-slate-300">•</span>
            <button className="text-xs text-slate-500 hover:text-[#7f8f00] transition-colors">
              Terms of Service
            </button>
            <span className="hidden sm:inline text-slate-300">•</span>
            <button className="text-xs text-slate-500 hover:text-[#7f8f00] transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


