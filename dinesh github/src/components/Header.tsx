import { Menu, Moon, Sun, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Admin User</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
            <UserIcon className="w-5 h-5" />
          </div>
          <button
            onClick={handleLogout}
            className="p-2 ml-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
