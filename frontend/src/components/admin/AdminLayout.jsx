import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiBox, FiTool, FiLogOut, FiMonitor, FiInfo, FiPhone, FiSettings, FiMenu, FiX, FiImage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin/products', label: 'Products', icon: <FiBox /> },
  { to: '/admin/sliders', label: 'Home Slider', icon: <FiImage /> },
  { to: '/admin/services', label: 'Services', icon: <FiTool /> },
  { to: '/admin/about', label: 'About Page', icon: <FiInfo /> },
  { to: '/admin/contact', label: 'Contact Info', icon: <FiPhone /> },
  { to: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-brand-bgSoft">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed drawer on mobile, static column on large screens */}
      <aside
        className={`w-64 sm:w-60 shrink-0 bg-brand-navy text-white flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FiMonitor />
            <span className="font-bold">My Tech Wings</span>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close menu"
            className="lg:hidden text-slate-300 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm font-medium ${
                  isActive ? 'bg-brand-blue text-white' : 'text-slate-300 hover:bg-white/5'
                }`
              }
            >
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10 text-sm">
          <p className="text-slate-400 truncate">{user?.email}</p>
          <button onClick={handleLogout} className="flex items-center gap-2 mt-2 text-slate-300 hover:text-white">
            <FiLogOut /> Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="h-9 w-9 flex items-center justify-center rounded border border-slate-200 text-slate-700 shrink-0"
          >
            <FiMenu size={18} />
          </button>
          <span className="font-bold text-slate-900 truncate">My Tech Wings Admin</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-w-0">{children}</main>
      </div>
    </div>
  );
}
