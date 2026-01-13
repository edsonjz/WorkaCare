import React from 'react';
import {
    LayoutDashboard,
    ClipboardList,
    Target,
    Eye,
    MessageSquare,
    BookOpen,
    FileBarChart,
    LogOut,
    HeartHandshake, // Added
    Library // Added
} from 'lucide-react';

import { UserRole } from '../../types';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: any) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    user: {
        name: string;
        role: string;
        avatar: string;
    };
    onLogout: () => void;
    role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    setCurrentView,
    sidebarOpen,
    setSidebarOpen,
    user,
    onLogout,
    role
}) => {
    const allNavItems = [
        { id: 'dashboard', label: role === 'operator' ? 'Meus Resultados' : 'Dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'Relatórios', icon: FileBarChart },
        { id: 'surveys', label: 'Questionários', icon: ClipboardList },
        { id: 'strategy', label: 'Estratégia OHS', icon: Target },
        { id: 'observation', label: 'Observação', icon: Eye },
        { id: 'sessions', label: 'Sessões & Focus', icon: HeartHandshake },
        { id: 'resources', label: 'Biblioteca', icon: Library },
    ];

    const navItems = role === 'operator'
        ? allNavItems.filter(item => ['dashboard', 'surveys', 'resources'].includes(item.id))
        : allNavItems;

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-white z-50 transform transition-transform duration-200 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="font-bold text-lg text-white">W</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">WorkaCare</span>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setCurrentView(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                        <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-600" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.role}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
