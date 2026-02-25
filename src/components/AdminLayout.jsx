import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, ClipboardList, Truck, Settings, LogOut, ExternalLink, ChevronRight, Star, Crown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/admin/dashboard", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", end: false, label: "Orders", icon: ShoppingBag },
  { to: "/admin/logistics", end: false, label: "Logistics", icon: Truck },
  { to: "/admin/reservations", end: false, label: "Pre-Orders", icon: ClipboardList },
  { to: "/admin/products", end: false, label: "Inventory", icon: Package },
  { to: "/admin/customers", end: false, label: "Customers", icon: Users },
  { to: "/admin/reviews", end: false, label: "Reviews", icon: Star },
  { to: "/admin/majlis", end: false, label: "Digital Majlis", icon: Crown },
  { to: "/admin/settings", end: false, label: "Settings", icon: Settings },
];

const pathToLabel = {
  dashboard: "Dashboard",
  orders: "Orders",
  logistics: "Logistics",
  reservations: "Pre-Orders",
  products: "Inventory",
  customers: "Customers",
  reviews: "Reviews",
  majlis: "Digital Majlis",
  settings: "Settings",
};

function AdminBreadcrumbs() {
  const location = useLocation();
  const path = location.pathname.replace(/^\/admin\/?/, "") || "dashboard";
  const segment = path.split("/")[0];
  const label = pathToLabel[segment] || "Admin";
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-primary/70 mb-4">
      <Link to="/admin/dashboard" className="hover:text-accent transition-colors">Admin</Link>
      <ChevronRight className="w-4 h-4 text-primary/50 shrink-0" />
      <span className="text-primary font-medium">{label}</span>
    </nav>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const siteUrl = typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL
    ? import.meta.env.VITE_SITE_URL
    : "/";

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
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary/80 hover:bg-secondary/10"
          >
            <ExternalLink className="w-5 h-5 shrink-0" />
            View store
          </a>
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
          <AdminBreadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
