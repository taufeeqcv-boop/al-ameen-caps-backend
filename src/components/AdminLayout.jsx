import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const navItems = [
  { to: "/admin/dashboard", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", end: false, label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", end: false, label: "Inventory", icon: Package },
  { to: "/admin/customers", end: false, label: "Customers", icon: Users },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-secondary">
      <aside className="w-56 bg-primary text-secondary flex flex-col shrink-0">
        <div className="p-4 border-b border-secondary/20">
          <Link to="/admin/dashboard" className="font-serif text-lg font-semibold text-accent">
            Al-Ameen Admin
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors " +
                (isActive ? "bg-accent/20 text-accent" : "text-secondary/90 hover:bg-secondary/10 hover:text-secondary")
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-secondary/20">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary/80 hover:bg-secondary/10"
          >
            ← Store
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary/80 hover:bg-secondary/10 w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
