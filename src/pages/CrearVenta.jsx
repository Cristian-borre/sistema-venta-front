import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";

const CrearVenta = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");

  const [productoId, setProductoId] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");

  const [items, setItems] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [total, setTotal] = useState(0);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resClientes = await api.get("/clientes");
        setClientes(resClientes.data.data);
        const resProductos = await api.get("/productos");
        setProductos(resProductos.data.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const nuevoTotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    setTotal(nuevoTotal);
  }, [items]);

  const agregarItem = () => {
    if (!productoId || cantidad <= 0) return;

    const producto = productos.find((p) => p.id === parseInt(productoId));
    if (!producto) return;

    const itemExistente = items.find((item) => item.id === producto.id);
    const cantidadTotal = (itemExistente?.cantidad || 0) + cantidad;

    if (cantidadTotal > producto.stock) {
      Swal.fire({
        text: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`,
        icon: "warning",
        customClass: {
          confirmButton:
            "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700",
        },
        buttonsStyling: false,
      });
      return;
    }

    let nuevosItems;
    if (itemExistente) {
      nuevosItems = items.map((item) =>
        item.id === producto.id
          ? {
              ...item,
              cantidad: item.cantidad + cantidad,
              subtotal: (item.cantidad + cantidad) * item.precio,
            }
          : item
      );
    } else {
      const subtotal = producto.precio * cantidad;
      nuevosItems = [...items, { ...producto, cantidad, subtotal }];
    }

    setItems(nuevosItems);
    setProductoId("");
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
      await api.post("/ventas", venta);
      Swal.fire(
        "Registro Exitoso!",
        "Venta registrada exitosamente.",
        "success"
      );
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Crear Venta</h2>
      {mensaje && <p className="mb-4 text-red-600">{mensaje}</p>}

      {/* Buscar cliente */}
      <div className="mb-2">
        <label className="block mb-1">Buscar cliente:</label>
        <input
          list="clientesList"
          value={busquedaCliente}
          onChange={(e) => {
            const valor = e.target.value;
            setBusquedaCliente(valor);
            const cliente = clientes.find(
              (c) =>
                c.estado === 1 &&
                `${c.nombre} (${c.identificacion})` === valor
            );
            if (cliente) setClienteId(cliente.id);
          }}
          className="w-full border px-3 py-2 rounded"
          placeholder="Nombre o identificación"
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

      {/* Buscar producto */}
      <div className="mb-4 flex gap-4">
        <div className="mb-2">
          <label className="block mb-1">Buscar producto:</label>
          <input
            list="productosList"
            value={busquedaProducto}
            onChange={(e) => {
              const valor = e.target.value;
              setBusquedaProducto(valor);
              const producto = productos.find(
                (p) =>
                  p.estado === 1 && `${p.nombre} (${p.codigo})` === valor
              );
              if (producto) setProductoId(producto.id);
            }}
            className="w-full border px-3 py-2 rounded"
            placeholder="Nombre o código"
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
        <div>
          <label className="block mb-1">Cantidad:</label>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="flex items-end mb-2">
          <button
            onClick={agregarItem}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar
          </button>
        </div>
      </div>

      {/* Tabla de productos agregados */}
      {items.length > 0 && (
        <table className="w-full bg-white rounded shadow border-collapse mb-4">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border px-4 py-2 text-left">Producto</th>
              <th className="border px-4 py-2 text-right">Precio</th>
              <th className="border px-4 py-2 text-center">Cantidad</th>
              <th className="border px-4 py-2 text-right">Subtotal</th>
              <th className="border px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{item.nombre}</td>
                <td className="border px-4 py-2 text-right">
                  ${item.precio.toLocaleString("es-CO")}
                </td>
                <td className="border px-4 py-2 text-center flex justify-center items-center gap-2">
                  <button
                    onClick={() => cambiarCantidad(index, "disminuir")}
                    className="px-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                  >
                    -
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(index, "incrementar")}
                    className="px-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                  >
                    +
                  </button>
                </td>
                <td className="border px-4 py-2 text-right">
                  ${item.subtotal.toLocaleString("es-CO")}
                </td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => eliminarItem(index)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Total y guardar */}
      <div className="mb-4 text-right">
        <strong>Total: </strong>${total.toLocaleString("es-CO")}
      </div>
      <div className="text-right">
        <button
          onClick={guardarVenta}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Guardar Venta
        </button>
      </div>
    </div>
  );
};

export default CrearVenta;
