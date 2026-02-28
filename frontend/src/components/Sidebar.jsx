import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const nav = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '🏠', roles: ['employee','manager','admin'] },
  { to: '/campaigns',  label: 'Campaigns',   icon: '📣', roles: ['manager','admin'] },
  { to: '/phishing',   label: 'Phishing',    icon: '🎣', roles: ['manager','admin'] },
  { to: '/training',   label: 'Training',    icon: '📚', roles: ['employee','manager','admin'] },
  { to: '/risk',       label: 'Risk',        icon: '⚠️',  roles: ['employee','manager','admin'] },
  { to: '/ai',         label: 'AI Assistant',icon: '🤖', roles: ['employee','manager','admin'] },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const allowed = nav.filter((n) => n.roles.includes(user?.role));

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-brand-600">🛡️ AwareAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {allowed.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith(to)
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{icon}</span>
            {label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
        <p className="text-xs text-gray-400 capitalize mb-2">{user?.role}</p>
        <button onClick={logout} className="text-xs text-red-500 hover:text-red-700 transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
