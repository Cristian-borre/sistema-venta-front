import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const MainLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 via-white to-indigo-50 text-gray-800">
      <aside className="w-60 min-h-screen bg-white/60 backdrop-blur-md shadow-md border-r border-gray-200 px-6 py-8 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-indigo-600 mb-10 tracking-tight">
            Menú
          </h3>
          <nav className="space-y-4">
            <SidebarLink to="/" label="Dashboard" />
            <SidebarLink to="/ventas" label="Ventas" />
            <SidebarLink to="/productos" label="Productos" />
            <SidebarLink to="/clientes" label="Clientes" />
          </nav>
        </div>

        <button
          onClick={logout}
          className="text-md text-red-500 hover:bg-red-50 hover:text-red-600 transition px-3 py-2 rounded-md"
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 px-10 py-8 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ to, label }) => (
  <Link
    to={to}
    className="block text-gray-700 px-4 py-2 rounded-md text-md font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200"
  >
    {label}
  </Link>
);

export default MainLayout;
