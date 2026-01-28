import React, { type ReactNode, useState } from 'react';
import { Activity, HelpCircle, User, Menu, LogOut, ChevronDown } from 'lucide-react';

interface AppShellProps {
    children: ReactNode;
    user?: { email: string; name: string; specialty?: string } | null;
    onLogout?: () => void;
}

const AppShell: React.FC<AppShellProps> = ({ children, user, onLogout }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
                            <Activity size={18} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                Clinical Risk Predictor
                            </h1>
                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10">
                                SOTA Ensemble v1
                            </span>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</a>
                            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Support</a>
                        </nav>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

                        <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" aria-label="Help">
                            <HelpCircle size={20} />
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                aria-label="User Profile"
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-md">
                                    {user?.name ? getInitials(user.name) : <User size={16} />}
                                </div>
                                {user && (
                                    <div className="hidden sm:flex flex-col items-start text-xs">
                                        <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                                        {user.specialty && <span className="text-slate-500 dark:text-slate-400">{user.specialty}</span>}
                                    </div>
                                )}
                                <ChevronDown size={16} className="hidden sm:block text-slate-400 dark:text-slate-500" />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && user && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-10">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 break-words">{user.email}</p>
                                        {user.specialty && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{user.specialty}</p>
                                        )}
                                    </div>
                                    <a
                                        href="#"
                                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        My Profile
                                    </a>
                                    <a
                                        href="#"
                                        className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Settings
                                    </a>
                                    <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            onLogout?.();
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>

                        <button className="md:hidden text-slate-500" aria-label="Menu">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default AppShell;
