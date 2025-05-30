import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Pencil, Trash2, PackagePlus, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import { useApi } from "../hooks/useApi";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [formulario, setFormulario] = useState({
    codigo: "",
    nombre: "",
    precio: "",
    stock: "",
    descripcion: "",
  });
  const [idEditando, setIdEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const { request } = useApi();

  useEffect(() => {
    obtenerProductos(1, busqueda);
    setPaginaActual(1);
  }, [busqueda]);

  const obtenerProductos = async (pagina = 1, filtro = "") => {
    setCargando(true);
    try {
      const res = await request({
        method: "get",
        url: `/productos?page=${pagina}&search=${filtro}`,
      });
      setProductos(res.data.data);
      setPaginaActual(res.data.current_page);
      setUltimaPagina(res.data.last_page);
    } catch (err) {
      setError("Error al cargar productos");
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) =>
    setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formulario.codigo ||
      !formulario.nombre ||
      !formulario.precio ||
      !formulario.stock ||
      !formulario.descripcion
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      if (idEditando) {
        await request({
          method: "put",
          url: `/productos/${idEditando}`,
          data: formulario,
        });
        mostrarAlerta(
          "Actualización Exitosa",
          "El producto fue actualizado correctamente."
        );
      } else {
        await request({
          method: "post",
          url: "/productos",
          data: formulario,
        });
        mostrarAlerta(
          "Registro Exitoso",
          "El producto fue creado correctamente."
        );
      }
      obtenerProductos();
      limpiarFormulario();
    } catch {
      manejarErrores(err);
    }
  };

  const manejarErrores = (err) => {
    if (err.response?.data?.errors) {
      const errores = err.response.data.errors;
      const mensajes = Object.entries(errores).map(([campo, mensajes]) => {
        if (
          campo === "email" &&
          mensajes.includes("The email has already been taken.")
        ) {
          return "El correo ya está registrado.";
        }
        if (
          campo === "identificacion" &&
          mensajes.includes("The identificacion has already been taken.")
        ) {
          return "La identificación ya está registrada.";
        }
        return mensajes.join(", ");
      });
      setError(`Error: ${mensajes.join(", ")}`);
    } else {
      setError("Error al guardar cliente.");
    }
  };

  const mostrarAlerta = (titulo, texto) => {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: "success",
      confirmButtonText: "Aceptar",
      customClass: {
        confirmButton:
          "bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600",
      },
      buttonsStyling: false,
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      codigo: "",
      nombre: "",
      precio: "",
      stock: "",
      descripcion: "",
    });
    setIdEditando(null);
    setError("");
    setModalAbierto(false);
  };

  const editarProducto = (producto) => {
    setFormulario({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      descripcion: producto.descripcion,
    });
    setIdEditando(producto.id);
    setModalAbierto(true);
  };

  const eliminarProducto = async (id) => {
    const result = await Swal.fire({
      title: "¿Confirmar acción?",
      text: "Esta acción cambiará el estado del producto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton:
          "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
        cancelButton:
          "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      try {
        await request({
          method: "delete",
          url: `/productos/${id}`,
        });
        obtenerProductos();
        mostrarAlerta("Estado modificado", "El producto ha sido actualizado.");
      } catch {
        mostrarAlerta("Error", "No se pudo modificar el estado del producto.");
      }
    }
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-zinc-800">Productos</h1>
        <button
          onClick={() => setModalAbierto(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600 flex items-center gap-2"
        >
          <PackagePlus size={16} /> Agregar Producto
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-zinc-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      {cargando ? (
        <p className="text-zinc-500">Cargando productos...</p>
      ) : productosFiltrados.length === 0 ? (
        <p className="text-zinc-500">No hay productos encontrados.</p>
      ) : (
        <>
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-zinc-500 uppercase text-xs">
                <th className="px-4 py-2 text-left">Codigo</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-right">Precio</th>
                <th className="px-4 py-2 text-right">Stock</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-center">Estado</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto.id} className="bg-white rounded-xl shadow-sm">
                  <td className="px-4 py-2">{producto.codigo}</td>
                  <td className="px-4 py-2">
                    {producto.nombre
                      ? producto.nombre.length > 15
                        ? producto.nombre.substring(0, 15) + "..."
                        : producto.nombre
                      : "-"}
                  </td>
                  <td className="px-4 py-2 text-right">${producto.precio}</td>
                  <td className="px-4 py-2 text-right">{producto.stock}</td>
                  <td className="px-4 py-2">
                    {producto.descripcion
                      ? producto.descripcion.length > 30
                        ? producto.descripcion.substring(0, 30) + "..."
                        : producto.descripcion
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-center capitalize">
                    <span
                      className={`text-sm font-medium ${
                        producto.estado ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {producto.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => editarProducto(producto)}
                      className="p-2 hover:bg-zinc-100 rounded-full"
                    >
                      <Pencil size={16} className="text-zinc-500" />
                    </button>
                    <button
                      onClick={() => eliminarProducto(producto.id)}
                      className="p-2 hover:bg-zinc-100 rounded-full"
                    >
                      {producto.estado === 1 ? (
                        <Trash2 size={16} className="text-red-500" />
                      ) : (
                        <RotateCcw size={16} className="text-green-500" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-6 gap-2">
            <button
              disabled={paginaActual === 1}
              onClick={() => obtenerProductos(paginaActual - 1, busqueda)}
              className="px-3 py-1 bg-zinc-200 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: ultimaPagina }, (_, i) => i + 1).map(
              (pagina) => (
                <button
                  key={pagina}
                  onClick={() => obtenerProductos(pagina, busqueda)}
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
              onClick={() => obtenerProductos(paginaActual + 1, busqueda)}
              className="px-3 py-1 bg-zinc-200 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      <Dialog
        open={modalAbierto}
        onClose={limpiarFormulario}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl relative w-full max-w-xl">
            <button
              onClick={limpiarFormulario}
              className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700"
            >
              <X />
            </button>
            <Dialog.Title className="text-lg font-bold mb-4 text-zinc-700">
              {idEditando ? "Editar Cliente" : "Agregar Cliente"}
            </Dialog.Title>

            {error && (
              <div className="mb-4 text-sm text-red-800 bg-red-200 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={manejarEnvio} className="space-y-4">
              <div className="flex gap-5">
                <input
                  type="text"
                  name="codigo"
                  placeholder="Codigo"
                  value={formulario.codigo}
                  onChange={manejarCambio}
                  disabled={!!idEditando}
                  className={`w-full px-4 py-2 rounded-xl border ${
                    idEditando ? "bg-zinc-100 text-zinc-400" : "border-zinc-300"
                  }`}
                />

                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-xl"
                />
              </div>
              <div className="flex gap-5">
                <input
                  type="text"
                  name="descripcion"
                  placeholder="Descripción"
                  value={formulario.descripcion}
                  onChange={manejarCambio}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-xl"
                />

                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={formulario.stock}
                  onChange={manejarCambio}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-xl"
                />
              </div>

              <div className="flex gap-5">
                <input
                  type="number"
                  name="precio"
                  placeholder="Precio"
                  value={formulario.precio}
                  onChange={manejarCambio}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="px-4 py-2 bg-zinc-200 rounded hover:bg-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                >
                  {idEditando ? "Actualizar" : "Agregar"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Productos;
