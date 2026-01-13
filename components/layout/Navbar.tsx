import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

interface NavbarProps {
    setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen }) => {
    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search */}
                <div className="hidden md:flex items-center relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all w-64 outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative text-slate-500 hover:text-slate-800 transition-colors p-2 hover:bg-slate-50 rounded-full">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
