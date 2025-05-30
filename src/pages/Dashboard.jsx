import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";

import {
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const { request } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await request({
          method: "get",
          url: "/dashboard/estadisticas",
        });
        setStats(res.data);
        const resVentas = await request({
          method: "get",
          url: "/dashboard/ultimas-ventas",
        });
        setVentasRecientes(resVentas.data);
        const resPopulares = await request({
          method: "get",
          url: "/dashboard/productos-populares",
        });
        setProductosPopulares(resPopulares.data);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      }
    };

    fetchData();
  }, []);

  const dataVentas = ventasRecientes.map((venta) => ({
    fecha: new Date(venta.fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
    }),
    total: venta.total,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <Card
          title="Productos"
          value={stats?.productos || 0}
          icon={<ShoppingBagIcon className="h-10 w-10 text-indigo-500" />}
        />
        <Card
          title="Clientes"
          value={stats?.clientes || 0}
          icon={<UserGroupIcon className="h-10 w-10 text-green-500" />}
        />
        <Card
          title="Ventas"
          value={stats?.ventas || 0}
          icon={<ChartBarIcon className="h-10 w-10 text-yellow-500" />}
        />
        <Card
          title="Ingresos"
          value={
            stats?.ingresos?.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            }) || "$0"
          }
          icon={<CurrencyDollarIcon className="h-10 w-10 text-red-500" />}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <section className="bg-white rounded-2xl shadow-lg p-6 col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Últimas Ventas
          </h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b">
                <tr>
                  <th className="pb-2 text-left">Cliente</th>
                  <th className="pb-2 text-left">Fecha</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasRecientes.map((venta) => (
                  <tr
                    key={venta.id}
                    className="border-b last:border-0 hover:bg-gray-100 transition"
                  >
                    <td className="py-2">{venta.cliente?.nombre}</td>
                    <td>{new Date(venta.fecha).toLocaleDateString("es-CO")}</td>
                    <td className="text-right font-semibold text-indigo-700">
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

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dataVentas} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="fecha" stroke="#888" />
              <YAxis
                stroke="#888"
                tickFormatter={(value) =>
                  value.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    maximumFractionDigits: 0,
                  })
                }
              />
              <Tooltip
                formatter={(value) =>
                  value.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Productos más Vendidos
          </h2>

          <ul className="divide-y divide-gray-200 max-h-[200px] overflow-y-auto mb-4">
            {productosPopulares.map((prod) => (
              <li
                key={prod.id}
                className="py-3 flex justify-between items-center hover:bg-indigo-50 rounded-md px-3 transition"
              >
                <span className="font-medium text-gray-700">{prod.nombre}</span>
                <span className="text-sm text-indigo-600 font-semibold">
                  {prod.vendidos} vendidos
                </span>
              </li>
            ))}
          </ul>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productosPopulares} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vendidos" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="bg-white rounded-2xl p-5 shadow-lg flex items-center space-x-5 hover:shadow-xl transition cursor-default select-none">
    <div className="p-3 bg-indigo-100 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
