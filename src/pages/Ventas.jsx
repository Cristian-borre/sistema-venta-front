import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { useApi } from "../hooks/useApi";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { request } = useApi();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      obtenerVentas(1, busqueda);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [busqueda]);

  useEffect(() => {
    obtenerVentas(paginaActual, busqueda);
  }, [paginaActual]);

  const obtenerVentas = async (pagina = 1, filtro = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await request({
        method: "get",
        url: `/ventas?page=${pagina}&search=${filtro}`,
      });
      setVentas(res.data.data);
      setPaginaActual(res.data.current_page);
      setUltimaPagina(res.data.last_page);
    } catch (err) {
      setError("Error al cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-800">Listado de Ventas</h1>
        <Link
          to="/ventas/crear"
          className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600 flex items-center gap-2 transition"
        >
          <Receipt size={16} />
          Registrar Venta
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar venta..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-zinc-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      {loading ? (
        <p className="text-zinc-500">Cargando ventas...</p>
      ) : ventas.length === 0 ? (
        <p className="text-zinc-500">No hay ventas registradas.</p>
      ) : (
        <>
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-zinc-500 uppercase text-xs">
                <th className="text-left px-4 py-2">Cliente</th>
                <th className="text-right px-4 py-2">Total</th>
                <th className="text-center px-4 py-2">Fecha</th>
                <th className="text-center px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="bg-white rounded-xl shadow-sm">
                  <td className="px-4 py-3">{venta.cliente?.nombre || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-zinc-700">
                    {venta.total.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-600 font-medium">
                    {venta.fecha}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to={`/ventas/${venta.id}`}
                      className="inline-block bg-emerald-500 text-white px-4 py-1 rounded-full hover:bg-emerald-600 transition"
                    >
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-6 gap-2">
            <button
              disabled={paginaActual === 1}
              onClick={() => obtenerVentas(paginaActual - 1, busqueda)}
              className="px-3 py-1 bg-zinc-200 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: ultimaPagina }, (_, i) => i + 1).map(
              (pagina) => (
                <button
                  key={pagina}
                  onClick={() => obtenerVentas(pagina, busqueda)}
                  className={`px-3 py-1 rounded ${
                    pagina === paginaActual
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-200 hover:bg-zinc-300"
                  }`}
                >
                  {pagina}
                </button>
              )
            )}
            <button
              disabled={paginaActual === ultimaPagina}
              onClick={() => obtenerVentas(paginaActual + 1, busqueda)}
              className="px-3 py-1 bg-zinc-200 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Ventas;
