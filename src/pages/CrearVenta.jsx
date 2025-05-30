import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import debounce from "lodash.debounce";
import { useApi } from "../hooks/useApi";

const CrearVenta = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");

  const [productoId, setProductoId] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [items, setItems] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [total, setTotal] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const { request } = useApi();

  useEffect(() => {
    const nuevoTotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    setTotal(nuevoTotal);
  }, [items]);

  const buscarClientes = debounce(async (search) => {
    try {
      const res = await request({
        method: "get",
        url: "/clientes",
        params: { search },
      });
      setClientes(res.data.data);
    } catch (err) {
      console.error("Error buscando clientes", err);
    }
  }, 300);

  useEffect(() => {
    if (busquedaCliente.length >= 2) {
      buscarClientes(busquedaCliente);
    }
  }, [busquedaCliente]);

  const buscarProductos = debounce(async (search) => {
    try {
      const res = await request({
        method: "get",
        url: "/productos",
        params: { search },
      });
      setProductos(res.data.data);
    } catch (err) {
      console.error("Error buscando productos", err);
    }
  }, 300);

  useEffect(() => {
    if (busquedaProducto.length >= 2) {
      buscarProductos(busquedaProducto);
    }
  }, [busquedaProducto]);

  const agregarItem = () => {
    if (!productoSeleccionado || cantidad <= 0) {
      setMensaje("Debes seleccionar un producto válido y una cantidad mayor a cero.");
      return;
    }

    const producto = productoSeleccionado;

    const itemExistente = items.find((item) => item.id === producto.id);
    const cantidadTotal = (itemExistente?.cantidad || 0) + cantidad;

    if (cantidadTotal > producto.stock) {
      Swal.fire({
        text: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
        icon: "warning",
        customClass: {
          confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
        },
        buttonsStyling: false,
      });
      return;
    }

    const nuevosItems = itemExistente
      ? items.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + cantidad,
                subtotal: (item.cantidad + cantidad) * item.precio,
              }
            : item
        )
      : [
          ...items,
          { ...producto, cantidad, subtotal: producto.precio * cantidad },
        ];

    setItems(nuevosItems);
    setProductoId("");
    setProductoSeleccionado(null);
    setCantidad(1);
    setBusquedaProducto("");
    setMensaje("");
  };

  const eliminarItem = (index) => {
    const nuevosItems = [...items];
    nuevosItems.splice(index, 1);
    setItems(nuevosItems);
  };

  const guardarVenta = async () => {
    if (!clienteId || items.length === 0) {
      setMensaje("Debe seleccionar un cliente y agregar al menos un producto.");
      return;
    }
    try {
      const venta = {
        cliente_id: clienteId,
        detalles: items.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
        })),
      };
      await request({
        method: "post",
        url: "/ventas",
        data: venta,
      });
      Swal.fire({
        title: `Registro Exitoso!`,
        text: `Venta registrada exitosamente.`,
        icon: "success",
        customClass: {
          confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
        },
        buttonsStyling: false,
      });
      setClienteId("");
      setBusquedaCliente("");
      setItems([]);
      setTotal(0);
    } catch (error) {
      setMensaje(
        "Error al guardar la venta: Cantidad insuficiente de Stock para el producto deseado."
      );
    }
  };

  const cambiarCantidad = (index, operacion) => {
    const nuevosItems = [...items];
    const item = nuevosItems[index];

    if (operacion === "incrementar") {
      if (item.cantidad + 1 > item.stock) {
        Swal.fire({
          text: `No hay suficiente stock para aumentar la cantidad de ${item.nombre}.`,
          icon: "warning",
          customClass: {
            confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
          },
          buttonsStyling: false,
        });
        return;
      }
      item.cantidad += 1;
    } else if (operacion === "disminuir") {
      if (item.cantidad > 1) {
        item.cantidad -= 1;
      } else {
        nuevosItems.splice(index, 1);
        setItems(nuevosItems);
        return;
      }
    }

    item.subtotal = item.precio * item.cantidad;
    setItems(nuevosItems);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800 border-b pb-2">
        Crear Venta
      </h2>
      {mensaje && (
        <p className="mb-4 text-red-600 bg-red-100 p-3 rounded border border-red-300">
          {mensaje}
        </p>
      )}

      <div className="mb-6">
        <label htmlFor="cliente" className="block mb-2 font-medium text-gray-700">
          Buscar cliente:
        </label>
        <input
          id="cliente"
          list="clientesList"
          value={busquedaCliente}
          onChange={(e) => {
            const valor = e.target.value;
            setBusquedaCliente(valor);
            const cliente = clientes.find(
              (c) => c.estado === 1 && `${c.nombre} (${c.identificacion})` === valor
            );
            if (cliente) setClienteId(cliente.id);
            else setClienteId("");
          }}
          placeholder="Nombre o identificación"
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <datalist id="clientesList">
          {clientes
            .filter((c) => c.estado === 1)
            .map((cliente) => (
              <option
                key={cliente.id}
                value={`${cliente.nombre} (${cliente.identificacion})`}
              />
            ))}
        </datalist>
      </div>

      <div className="mb-8 grid grid-cols-12 gap-4 items-end">
        <div className="col-span-7">
          <label htmlFor="producto" className="block mb-2 font-medium text-gray-700">
            Buscar producto:
          </label>
          <input
            id="producto"
            list="productosList"
            value={busquedaProducto}
            onChange={(e) => {
              const valor = e.target.value;
              setBusquedaProducto(valor);
              const producto = productos.find(
                (p) => p.estado === 1 && `${p.nombre} (${p.codigo})` === valor
              );
              if (producto) {
                setProductoId(producto.id);
                setProductoSeleccionado(producto);
              } else {
                setProductoId("");
                setProductoSeleccionado(null);
              }
            }}
            placeholder="Nombre o código"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <datalist id="productosList">
            {productos
              .filter((p) => p.estado === 1)
              .map((producto) => (
                <option
                  key={producto.id}
                  value={`${producto.nombre} (${producto.codigo})`}
                />
              ))}
          </datalist>
        </div>

        <div className="col-span-3">
          <label htmlFor="cantidad" className="block mb-2 font-medium text-gray-700">
            Cantidad:
          </label>
          <input
            id="cantidad"
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="col-span-2">
          <button
            onClick={agregarItem}
            disabled={!productoSeleccionado || cantidad <= 0}
            className="w-full bg-indigo-600 text-white py-2 rounded-md shadow hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Agregar producto a la venta"
          >
            Agregar
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="overflow-x-auto mb-6 rounded border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  Producto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Precio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-semibold text-gray-700"
                >
                  Cantidad
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Subtotal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-sm font-semibold text-gray-700"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-3 whitespace-nowrap text-gray-800 font-medium">
                    {item.nombre}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-right text-gray-700">
                    ${item.precio.toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => cambiarCantidad(index, "disminuir")}
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-400 focus:outline-none"
                        aria-label={`Disminuir cantidad de ${item.nombre}`}
                      >
                        –
                      </button>
                      <span className="px-3 font-semibold">{item.cantidad}</span>
                      <button
                        onClick={() => cambiarCantidad(index, "incrementar")}
                        className="px-2 py-1 rounded-md bg-gray-300 hover:bg-gray-400 focus:outline-none"
                        aria-label={`Incrementar cantidad de ${item.nombre}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-right text-gray-700">
                    ${item.subtotal.toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-center">
                    <button
                      onClick={() => eliminarItem(index)}
                      className="text-red-600 hover:underline font-medium"
                      aria-label={`Eliminar ${item.nombre} de la venta`}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end items-center gap-6">
        <div className="text-xl font-semibold text-gray-800">
          Total: ${total.toLocaleString("es-CO")}
        </div>
        <button
          onClick={guardarVenta}
          className="bg-green-600 text-white px-6 py-3 rounded-md shadow hover:bg-green-700 transition"
          aria-label="Guardar venta"
        >
          Guardar Venta
        </button>
      </div>
    </div>
  );
};

export default CrearVenta;
