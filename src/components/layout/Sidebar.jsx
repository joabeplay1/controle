import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Folder, Settings as SettingsIcon } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const menuItems = [
    { name: 'Criar App', path: '/', icon: Home },
    { name: 'Meus Projetos', path: '/projects', icon: Folder },
    { name: 'Configurações', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-56 border-r bg-card h-screen fixed left-0 top-0 flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <div className="px-2 font-bold text-lg text-blue-600 tracking-wide">GenForge Pro</div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'hover:bg-accent text-muted-foreground'}`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
