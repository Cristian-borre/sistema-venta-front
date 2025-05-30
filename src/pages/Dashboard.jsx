import { useEffect, useState } from "react";
import api from "../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/estadisticas");
        setStats(res.data);
        const resVentas = await api.get("/dashboard/ultimas-ventas");
        setVentasRecientes(resVentas.data);
        const resPopulares = await api.get("/dashboard/productos-populares");
        setProductosPopulares(resPopulares.data);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title="Productos" value={stats?.productos || 0} />
        <Card title="Clientes" value={stats?.clientes || 0} />
        <Card title="Ventas" value={stats?.ventas || 0} />
        <Card
          title="Ingresos"
          value={
            stats?.ingresos?.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            }) || "$0"
          }
        />
      </div>

      {/* Sección de tabla y popular products */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Últimas Ventas</h2>
          <div className="bg-white rounded shadow p-4">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-600 border-b">
                <tr>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasRecientes.map((venta) => (
                  <tr key={venta.id} className="border-b hover:bg-gray-50">
                    <td>{venta.cliente?.nombre}</td>
                    <td>{venta.fecha}</td>
                    <td className="text-right">
                      {venta.total.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Productos más Vendidos</h2>
          <div className="bg-white rounded shadow p-4">
            <ul className="space-y-2">
              {productosPopulares.map((prod) => (
                <li
                  key={prod.id}
                  className="flex justify-between border-b pb-1 last:border-0"
                >
                  <span>{prod.nombre}</span>
                  <span className="text-sm text-gray-600">{prod.vendidos} vendidos</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white shadow rounded p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);

export default Dashboard;
