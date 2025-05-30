import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const DetalleVenta = () => {
  const { id } = useParams();
  const [venta, setVenta] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarVenta = async () => {
      try {
        const res = await api.get(`/ventas/${id}`);
        setVenta(res.data);
      } catch (err) {
        setError("No se pudo cargar la venta.");
      }
    };
    cargarVenta();
  }, [id]);

  if (error) return <p className="text-red-600 text-center mt-8">{error}</p>;
  if (!venta) return <p className="text-center text-gray-500 mt-8">Cargando venta...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">

      <h2 className="text-2xl font-bold text-gray-800 mb-2">Detalle Venta #{venta.id}</h2>
      <div className="text-gray-700 space-y-1 mb-6">
        <p>
          <span className="font-medium">Cliente:</span> {venta.cliente?.nombre}
        </p>
        <p>
          <span className="font-medium">Fecha:</span> {venta.fecha}
        </p>
        <p>
          <span className="font-medium">Total:</span>{" "}
          {venta.total.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
          })}
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalle de productos</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-auto">
          <thead>
            <tr className="bg-gray-100 text-gray-600">
              <th className="py-2 px-3 text-left">Producto</th>
              <th className="py-2 px-3 text-center">Cantidad</th>
              <th className="py-2 px-3 text-right">Precio</th>
              <th className="py-2 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.detalles.map((d, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition">
                <td className="py-2 px-3">{d.producto?.nombre}</td>
                <td className="py-2 px-3 text-center">{d.cantidad}</td>
                <td className="py-2 px-3 text-right">
                  {d.precio_unitario.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </td>
                <td className="py-2 px-3 text-right">
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
    </div>
  );
};

export default DetalleVenta;
