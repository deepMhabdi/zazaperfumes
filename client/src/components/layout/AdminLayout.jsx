import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, ArrowLeft } from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-zaza-black flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-zaza-charcoal border-r border-white/5 flex flex-col">
        <div className="px-6 py-8 border-b border-white/5">
          <Link to="/">
            <p className="font-display text-2xl text-chrome tracking-widest">ZAZA</p>
            <p className="text-2xs tracking-[0.4em] text-chrome/30 uppercase mt-0.5">Admin</p>
          </Link>
        </div>
        <nav className="flex-1 py-4">
          {adminNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-all ${
                  isActive
                    ? 'text-chrome bg-chrome/10 border-r-2 border-chrome'
                    : 'text-chrome/40 hover:text-chrome hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-6 border-t border-white/5">
          <Link to="/" className="flex items-center gap-2 text-xs text-chrome/30 hover:text-chrome transition-colors">
            <ArrowLeft size={14} /> Storefront
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
