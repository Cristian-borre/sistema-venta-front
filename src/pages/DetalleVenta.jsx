import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";

const DetalleVenta = () => {
  const { id } = useParams();
  const [venta, setVenta] = useState(null);
  const [error, setError] = useState("");
  const { request } = useApi();

  useEffect(() => {
    const cargarVenta = async () => {
      try {
        const res = await request({
          method: "get",
          url: `/ventas/${id}`,
        });
        setVenta(res.data);
      } catch (err) {
        setError("No se pudo cargar la venta.");
      }
    };
    cargarVenta();
  }, [id]);

  if (error)
    return (
      <p className="text-red-600 text-center mt-8 font-semibold">{error}</p>
    );
  if (!venta)
    return (
      <p className="text-center text-gray-500 mt-8 italic animate-pulse">
        Cargando venta...
      </p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <header className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-indigo-700">
          Detalle Venta #{venta.id}
        </h2>
      </header>

      <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-700">
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Cliente</h3>
          <p className="text-lg">{venta.cliente?.nombre || "N/A"}</p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Fecha</h3>
          <p className="text-lg">
            {new Date(venta.fecha).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Total</h3>
          <p className="text-lg font-semibold text-indigo-600">
            {venta.total.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })}
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Detalle de Productos
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-left text-sm sm:text-base">
            <thead className="bg-indigo-100 text-indigo-700 font-semibold">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4 text-right">Precio Unitario</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map((d, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-indigo-50 transition"
                >
                  <td className="py-3 px-4">{d.producto?.nombre}</td>
                  <td className="py-3 px-4 text-center">{d.cantidad}</td>
                  <td className="py-3 px-4 text-right text-indigo-700 font-medium">
                    {d.precio_unitario.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-indigo-800">
                    {d.subtotal.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DetalleVenta;
