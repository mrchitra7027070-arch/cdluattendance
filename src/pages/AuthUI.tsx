import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useAuth } from "../lib/auth";
import { Role } from "../lib/db";
import { AlertCircle, User, Lock, Mail, Hash, BookOpen } from "lucide-react";

export default function AuthUI() {
  const { action } = useParams<{ action: string }>();
  const isLogin = action === "login";
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // identifier
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const user = await login(email, password, "teacher");
        if (user) {
          navigate("/teacher");
        } else {
          setError("Invalid credentials. Please check and try again.");
        }
      } else {
        // Register
        const user = await register({
          role: "teacher",
          name,
          email,
          password,
          username,
          phone
        });
        if (user) navigate("/teacher");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-black/10 dark:border-white/20 shadow-2xl rounded-3xl overflow-hidden transition-colors"
      >
        <div className="h-2 w-full bg-blue-500" />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 transition-colors">
              Staff Portal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 flex items-start gap-3 transition-colors">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-100">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1 transition-colors">Full Name</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <User className="w-4 h-4 text-slate-400" />
                   </div>
                   <input 
                     required 
                     type="text" 
                     value={name} 
                     maxLength={50}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                     placeholder="Enter Full Name"
                   />
                 </div>
              </div>
            )}

            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1 transition-colors">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter username"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1 transition-colors">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      required 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1 transition-colors">
                {isLogin ? "Username, Email or Phone" : "Email Address"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  required={true} 
                  type={isLogin ? 'text' : 'email'} 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder={isLogin ? "Enter identifier" : "Enter email address"}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1 transition-colors">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input 
                  required 
                  type="password"
                  minLength={6}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/20 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold shadow-lg transition-all bg-blue-600 hover:bg-blue-500 shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link 
              to={`/auth/teacher/${isLogin ? 'register' : 'login'}`} 
              className="font-semibold hover:underline bg-transparent outline-none text-blue-500 dark:text-blue-400"
            >
              {isLogin ? "Register now" : "Sign in instead"}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
