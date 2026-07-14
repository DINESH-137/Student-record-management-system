import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Settings, X, GraduationCap } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Add Student', path: '/students/new', icon: UserPlus },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-8 h-8" />
            <span>EduManage</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300" 
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
