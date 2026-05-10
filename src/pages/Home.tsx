import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/auth";
import {
  AlertCircle,
  User,
  Lock,
  Hash,
  UserRound,
  Eye,
  EyeOff,
  Users,
  Mail,
} from "lucide-react";

type Mode = "teacher_login" | "teacher_register";

export default function Home() {
  const [mode, setMode] = useState<Mode>("teacher_login");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // teacher identifier
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      if (mode === "teacher_login") {
        const user = await login(username, password, "teacher");
        if (user) {
          navigate("/teacher");
        } else {
          setError("Invalid credentials. Please check and try again.");
        }
      } else if (mode === "teacher_register") {
        await register({
          role: "teacher",
          name,
          username,
          phone,
          email, // Including email
          password,
        });
        navigate("/teacher");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col md:flex-row font-sans overflow-y-auto md:overflow-hidden bg-slate-100 dark:bg-[#0f172a] transition-colors">
      {/* Absolute Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 opacity-25 dark:opacity-100 transition-opacity"
        style={{ backgroundImage: 'url("https://i.ibb.co/S4Tk145y/Gemini-Generated-Image-lk02t4lk02t4lk02.png")' }}
      ></div>
      
      {/* Dark overlays for blending according to the image */}
      <div className="absolute inset-0 bg-white/65 dark:bg-slate-900/40 dark:mix-blend-multiply z-0 pointer-events-none transition-colors"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/20 dark:from-[#0f172a] dark:via-[#0f172a]/50 dark:to-transparent z-0 pointer-events-none transition-colors"></div>
      
      {/* Glow / Wave effect bottom left */}
      <div className="absolute bottom-0 left-0 w-full md:w-3/4 h-[40%] bg-gradient-to-t from-blue-500/15 dark:from-blue-500/20 to-transparent blur-3xl z-0 pointer-events-none rounded-tr-full"></div>

      {/* Left Content */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center p-6 sm:p-8 md:p-16 lg:pl-24 xl:pl-32 min-h-[35vh] md:min-h-screen shrink-0">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 bg-white/95 backdrop-blur-sm rounded-full p-2 sm:p-2.5 border-[3px] border-[#fbbf24] shadow-2xl">
            <img 
              src="https://i.ibb.co/PZjRr6jy/cdlu-logo.webp" 
              alt="CDLU Logo" 
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-950 dark:text-white tracking-tight leading-none mb-2 transition-colors">
            CDLU
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#3b82f6] tracking-tight mb-4 sm:mb-6">
            Department of Computer Science and Technology
          </h2>
          
          <div className="w-10 h-1 bg-[#fbbf24] mb-6 sm:mb-10 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>

          <h3 className="text-2xl sm:text-3xl md:text-[2.5rem] lg:text-[3.2rem] font-bold text-slate-900 dark:text-white leading-[1.15] mb-6 tracking-tight drop-shadow-sm dark:drop-shadow-lg transition-colors">
            Attendance<br className="hidden sm:block" /> Management System
          </h3>
        </motion.div>
      </div>

      {/* Right Content - Login Card */}
      <div className="relative z-10 w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:pr-24 min-h-[50vh] md:min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[480px] bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[32px] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.28)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/80 dark:border-white/10 relative overflow-hidden flex flex-col transition-colors"
        >
          <div className="flex-1 w-full flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#F0F4FF] dark:bg-blue-500/10 rounded-[20px] flex items-center justify-center mx-auto mb-5 text-[#2563eb] dark:text-blue-300 shadow-sm">
                <Users className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
                {mode === "teacher_login"
                  ? "Staff Portal"
                  : "Register Staff"}
              </h2>
              <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium transition-colors">
                {mode === "teacher_login"
                  ? "Sign in to your account to continue"
                  : "Create a new staff account"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[14px] text-red-800 dark:text-red-100 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {/* Teacher Registration Fields */}
                {mode === "teacher_register" && (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="text"
                          maxLength={50}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-[15px]"
                          placeholder="Dr. Full Name"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-[15px]"
                          placeholder="name@university.edu"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                          className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-[15px]"
                          placeholder="johndoe"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                        Phone
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (!val.startsWith("+91 ")) {
                              val = "+91 " + val.replace(/^\+?9?1?\s?/, '');
                            }
                            const digits = val.slice(4).replace(/[^0-9]/g, '');
                            setPhone("+91 " + digits.slice(0, 10));
                          }}
                          className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-[15px]"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Teacher Login / Details */}
                {(mode === "teacher_login" || mode === "teacher_register") && (
                  <motion.div
                    key="login-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5 overflow-hidden"
                  >
                    {mode === "teacher_login" && (
                      <div className="space-y-1.5">
                        <label className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                          Name / Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            required
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-[15px]"
                            placeholder="Enter your name or username"
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-12 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-[15px]"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {mode === "teacher_login" && (
                <div className="flex items-center justify-start pt-1 pb-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-[14px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      Remember me
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl text-white font-medium transition-all text-[15px] shadow-lg shadow-blue-600/20 active:scale-[0.99] mt-2 bg-[#2563eb] hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Please wait..."
                  : mode === "teacher_login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>

            <div className="mt-8 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[13px] font-medium">
                  <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">or</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3.5">
                {mode !== "teacher_register" && (
                  <button
                    onClick={() => setMode("teacher_register")}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-[#2563eb] text-[#2563eb] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl font-semibold transition-colors text-[14px]"
                  >
                    <UserRound className="w-4 h-4" /> Register as Staff
                  </button>
                )}
                {mode !== "teacher_login" && (
                  <button
                    onClick={() => setMode("teacher_login")}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-transparent border border-[#2563eb] text-[#2563eb] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl font-semibold transition-colors text-[14px]"
                  >
                    <UserRound className="w-4 h-4" /> Return to Staff Login
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-auto pt-6 text-center text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              <p>© {new Date().getFullYear()} CDLU Dept. of CS & Tech. All rights reserved.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
