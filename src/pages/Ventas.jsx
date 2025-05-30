import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ventas");
      setVentas(res.data.data);
    } catch (err) {
      setError("Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold mb-4">Listado de Ventas</h1>
        <Link
          to="/ventas/crear"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Registrar Venta
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Cargando ventas...</p>
      ) : ventas.length === 0 ? (
        <p>No hay ventas registradas.</p>
      ) : (
        <table className="w-full bg-white rounded shadow border-collapse">
          <thead>
            <tr className="bg-indigo-100 text-indigo-700">
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Cliente</th>
              <th className="border px-4 py-2 text-right">Total</th>
              <th className="border px-4 py-2 text-center">Fecha</th>
              <th className="border px-4 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id} className="hover:bg-indigo-50">
                <td className="border px-4 py-2">{venta.id}</td>
                <td className="border px-4 py-2">{venta.cliente?.nombre}</td>
                <td className="border px-4 py-2 text-right">
                  {venta.total.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </td>
                <td className="border px-4 py-2 text-center">{venta.fecha}</td>
                <td className="border px-4 py-2">
                  <Link
                    to={`/ventas/${venta.id}`}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                  >
                    Ver Detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Ventas;
