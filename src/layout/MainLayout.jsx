import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const MainLayout = () => {
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <aside className="w-52 p-6 border-r border-gray-300 bg-white flex flex-col">
        <h3 className="mb-8 font-semibold text-lg text-gray-700">Menú</h3>
        <ul className="space-y-4 flex-grow">
          <li>
            <Link
              to="/"
              className="block px-3 py-2 rounded-md transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/ventas"
              className="block px-3 py-2 rounded-md transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
            >
              Ventas
            </Link>
          </li>
          <li>
            <Link
              to="/productos"
              className="block px-3 py-2 rounded-md transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
            >
              Productos
            </Link>
          </li>
          <li>
            <Link
              to="/clientes"
              className="block px-3 py-2 rounded-md transition-colors duration-200 hover:bg-indigo-100 hover:text-indigo-700"
            >
              Clientes
            </Link>
          </li>
        </ul>
        <div>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-md text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 bg-white shadow-inner">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
