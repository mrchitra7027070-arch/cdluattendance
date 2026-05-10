import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      <span className="hidden sm:inline">{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-300 text-slate-900 dark:text-slate-100 relative bg-white dark:bg-slate-950"
    >
      {isHome && (
        <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
          {themeButton}
        </div>
      )}

      {!isHome && (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden shadow-sm border border-slate-200 transition-transform group-hover:scale-105">
                <img src="https://i.ibb.co/PZjRr6jy/cdlu-logo.webp" alt="CDLU Logo" className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white transition-colors duration-300">CDLU</span>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider transition-colors duration-300">Comp. Science & Tech</span>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              {themeButton}
              {user ? (
                <>
                  <Link 
                    to="/teacher"
                    className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/20 transition-colors duration-300">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-500/20 transition-all active:scale-[0.98]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </>
              ) : null}
            </nav>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 relative z-10 ${isHome ? '' : 'w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col pb-24 md:pb-8'}`}>
        <Outlet />
      </main>

      {!isHome && (
        <footer className="relative z-10 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 py-10 pb-40 md:pb-10 mt-auto transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              &copy; {new Date().getFullYear()} Chaudhary Devi Lal University, Sirsa.<br/>
              <span className="text-xs font-medium text-slate-500 mt-2 inline-block">Department of Computer Science and Technology • Attendance Management System</span>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
