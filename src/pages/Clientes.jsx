import { useState, useEffect } from "react";
import api from "../api/axios";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [form, setForm] = useState({
    identificacion: "",
    nombre: "",
    email: "",
    telefono: "",
  });

  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    cargarClientes(1, search);
    setCurrentPage(1); 
  }, [search]);

  const cargarClientes = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/clientes?page=${page}&search=${searchTerm}`);
      setClientes(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    } catch (err) {
      setError("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form) {
      setError("Todos los campos son obligatorios");
      return;
    }
    try {
      if (editId) {
        await api.put(`/clientes/${editId}`, form);
        Swal.fire({
          title: "Registro Exitosa!",
          text: `El cliente ha sido creado correctamente.`,
          icon: "success",
          customClass: {
            confirmButton:
              "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
          },
          buttonsStyling: false,
        });
      } else {
        await api.post("/clientes", form);
        Swal.fire({
          title: "Actualizacion Exitosa!",
          text: `El cliente ha sido actualizado correctamente.`,
          icon: "success",
          customClass: {
            confirmButton:
              "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
          },
          buttonsStyling: false,
        });
      }
      resetForm();
      cargarClientes();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;

        const traducirError = (campo, mensajes) => {
          switch (campo) {
            case "email":
              if (mensajes.includes("The email has already been taken.")) {
                return "El correo electrónico ya está registrado.";
              }
              break;
            case "identificacion":
              if (
                mensajes.includes("The identificacion has already been taken.")
              ) {
                return "La identificación ya está registrada.";
              }
              break;
            default:
              return mensajes.join(", ");
          }
        };

        const mensajesTraducidos = Object.entries(errors).map(
          ([campo, mensajes]) => traducirError(campo, mensajes)
        );

        setError(`Error al guardar cliente: ${mensajesTraducidos.join(", ")}`);
      } else {
        setError("Error al guardar cliente.");
      }
    }
  };

  const resetForm = () => {
    setForm({
      identificacion: "",
      nombre: "",
      email: "",
      telefono: "",
    });
    setEditId(null);
    setError("");
    setModalOpen(false);
  };

  const handleEditar = (cliente) => {
    setForm({
      identificacion: cliente.identificacion,
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
    });
    setEditId(cliente.id);
    setModalOpen(true);
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
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
        await api.delete(`/clientes/${id}`);
        cargarClientes();
        Swal.fire({
          text: `El estado del cliente ha sido modificado`,
          icon: "success",
          customClass: {
            confirmButton:
              "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
          },
          buttonsStyling: false,
        });
      } catch {
        Swal.fire({
          title: "Error",
          text: `No se pudo cambiar el estado del cliente`,
          icon: "error",
          customClass: {
            confirmButton:
              "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
          },
          buttonsStyling: false,
        });
      }
    }
  };

  const clientesFiltrados = clientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.identificacion
        .toString()
        .trim()
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Agregar Cliente
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
      />

      {loading ? (
        <p>Cargando clientes...</p>
      ) : clientesFiltrados.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <>
          <table className="w-full border-collapse bg-white rounded shadow">
            <thead>
              <tr className="bg-indigo-100 text-indigo-700">
                <th className="border px-4 py-2 text-left">Identificacion</th>
                <th className="border px-4 py-2 text-left">Nombre</th>
                <th className="border px-4 py-2 text-right">Correo</th>
                <th className="border px-4 py-2 text-right">Telefono</th>
                <th className="border px-4 py-2 text-center">Estado</th>
                <th className="border px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50">
                  <td className="border px-4 py-2">{p.identificacion}</td>
                  <td className="border px-4 py-2">
                    {p.nombre
                      ? p.nombre.length > 15
                        ? p.nombre.substring(0, 15) + "..."
                        : p.nombre
                      : "-"}
                  </td>
                  <td className="border px-4 py-2 text-right">{p.email}</td>
                  <td className="border px-4 py-2 text-right">{p.telefono}</td>
                  <td className="border px-4 py-2 text-center capitalize">
                    {p.estado ? "Activo" : "Inactivo"}
                  </td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEditar(p)}
                      className="text-white rounded-md py-1 px-3 bg-indigo-600 hover:bg-indigo-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="text-white rounded-md py-1 px-3 bg-red-600 hover:bg-red-800"
                    >
                      {p.estado ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => cargarClientes(currentPage - 1, search)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Anterior
            </button>

            {[...Array(lastPage)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => cargarClientes(page, search)}
                  className={`px-3 py-1 rounded ${
                    page === currentPage
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === lastPage}
              onClick={() => cargarClientes(currentPage + 1, search)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      <Dialog
        open={modalOpen}
        onClose={resetForm}
        className="fixed z-50 inset-0 overflow-y-auto bg-black/55"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white p-6 rounded-md shadow-xl w-auto relative">
            <button
              onClick={resetForm}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X />
            </button>
            <Dialog.Title className="text-lg font-semibold mb-4">
              {editId ? "Editar Cliente" : "Agregar Cliente"}
            </Dialog.Title>

            {error && (
              <div className="mb-4 bg-red-400 px-3 py-2 rounded-md border border-red-800 text-red-900 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-5">
                <input
                  type="number"
                  name="identificacion"
                  placeholder="Identificacion"
                  value={form.identificacion}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-2 border rounded 
                    ${
                      editId
                        ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                        : "border-gray-300"
                    }
                  `}
                  disabled={!!editId}
                />

                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex gap-5">
                <input
                  type="email"
                  name="email"
                  placeholder="Correo"
                  value={form.email}
                  onChange={handleChange}
                  className={`flex-1 px-4 py-2 border rounded 
                    ${
                      editId
                        ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                        : "border-gray-300"
                    }
                  `}
                  disabled={!!editId}
                />

                <input
                  type="number"
                  name="telefono"
                  placeholder="Telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editId ? "Actualizar" : "Agregar"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Clientes;
