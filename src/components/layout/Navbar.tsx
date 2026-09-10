'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Flower2, 
  Gamepad2, 
  Heart, 
  HelpCircle, 
  Users, 
  ImageIcon, 
  Sparkles, 
  Shield, 
  Globe, 
  LogOut, 
  Home, 
  Sun, 
  Moon,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAccessibilityStore } from '@/store/accessibility-store';
import { translations, SUPPORTED_LANGUAGES } from '@/lib/i18n/translations';
import LiveClock from '@/components/common/LiveClock';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { patient, caregiver, isPatientLoggedIn, isCaregiverLoggedIn, logoutPatient, logoutCaregiver } = useAuthStore();
  const { language, setLanguage, highContrast, isDarkMode, toggleDarkMode } = useAccessibilityStore();
  const t = translations[language] || translations.en;

  const isPatientRoute = pathname.startsWith('/patient');
  const isCaregiverRoute = pathname.startsWith('/caregiver');

  const handleLogout = () => {
    if (isPatientRoute || isPatientLoggedIn) {
      logoutPatient();
      router.push('/');
    } else if (isCaregiverRoute || isCaregiverLoggedIn) {
      logoutCaregiver();
      router.push('/');
    } else {
      router.push('/');
    }
  };

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors ${
      highContrast 
        ? 'bg-black border-yellow-400 text-yellow-300' 
        : 'bg-white/95 dark:bg-bloom-darkest/95 backdrop-blur-md border-slate-200 dark:border-bloom-border/60 text-slate-800 dark:text-slate-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link 
          href={isPatientLoggedIn ? '/patient/dashboard' : isCaregiverLoggedIn ? '/caregiver/dashboard' : '/'}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] rounded-2xl p-1"
          aria-label="Nivora Home"
        >
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700/40 text-[#2d7a58] dark:text-teal-300 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Flower2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Nivora
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Care
              </span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Memories. People. Connection.</p>
          </div>
        </Link>

        {/* Center Navigation Links & Role Indicator */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {/* Patient Role Navigation */}
          {isPatientLoggedIn ? (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-bloom-card p-1 rounded-2xl border border-slate-200 dark:border-bloom-border text-xs font-bold">
              <Link
                href="/patient/dashboard"
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  pathname === '/patient/dashboard'
                    ? 'bg-white dark:bg-bloom-surface text-[#1e3a5f] dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <Link
                href="/patient/dashboard#activities-grid"
                className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5 transition-all"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Activities</span>
              </Link>
              <Link
                href="/patient/games/face-name"
                className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5 transition-all"
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Memories</span>
              </Link>
            </div>
          ) : isCaregiverLoggedIn ? (
            /* Caregiver Role Navigation */
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-bloom-card p-1 rounded-2xl border border-slate-200 dark:border-bloom-border text-xs font-bold">
              <Link
                href="/caregiver/dashboard"
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  pathname === '/caregiver/dashboard'
                    ? 'bg-white dark:bg-bloom-surface text-purple-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/caregiver/dashboard#patients-section"
                className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Patients</span>
              </Link>
              <Link
                href="/caregiver/dashboard#memory-bank-section"
                className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5 transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>Memory Bank</span>
              </Link>
              <Link
                href="/caregiver/dashboard#insights-section"
                className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Insights</span>
              </Link>
            </div>
          ) : null}

          <LiveClock mode="compact" />
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative group">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="appearance-none bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border border-slate-300 dark:border-bloom-border text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold py-2 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] transition-all shadow-sm"
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-white dark:bg-bloom-card hover:bg-slate-50 dark:hover:bg-bloom-surface border border-slate-300 dark:border-bloom-border text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center shadow-sm"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Status / Mode Switcher */}
          {isPatientLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-bloom-card border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{patient?.name}</span>
            </div>
          ) : isCaregiverLoggedIn ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-bloom-card border border-purple-200 dark:border-purple-800 text-xs font-bold text-purple-800 dark:text-purple-300">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>{caregiver?.full_name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/patient/login"
                className="px-4 py-2 rounded-xl bg-[#2d7a58] hover:bg-[#236347] text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                Patient
              </Link>
              <Link
                href="/caregiver/login"
                className="px-4 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#152843] text-white font-bold text-xs sm:text-sm shadow-sm transition-all hidden sm:inline-block"
              >
                Caregiver
              </Link>
            </div>
          )}

          {/* Logout / Exit */}
          {(isPatientLoggedIn || isCaregiverLoggedIn) && (
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 transition-all focus:outline-none"
              title="Logout / Switch Mode"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
