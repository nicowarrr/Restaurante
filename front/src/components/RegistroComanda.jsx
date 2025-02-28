import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Select from "react-select";
import Axios from "axios";
import Swal from "sweetalert2";

const RegistroComanda = () => {
  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
    getValues,
  } = useForm();

  const [meseroOptions, setMeseroOptions] = useState([]);
  const [selectedMesero, setSelectedMesero] = useState(null);
  const [menuOptions, setMenuOptions] = useState([]);
  const [menuSeleccionado, setMenuSeleccionado] = useState("");
  const [mesaOptions, setMesaOptions] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [orden, setOrden] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [filteredComandas, setFilteredComanda] = useState([]);
  const [comandasPreparacion, setComandasPreparacion] = useState([]);
  const [comandasEntregadas, setComandasEntregadas] = useState([]);
  

  const cargarEmpleados = async () => {
    try {
      const endpoints = [
        {
          url: "http://localhost:5001/meseros",
          setState: setMeseroOptions,
          labelFn: (item) => `${item.nombre} ${item.apellido}`,
          idKey: "id_empleado",
        }
      ];

      const responses = await Promise.all(
        endpoints.map(({ url }) => Axios.get(url))
      );

      responses.forEach((response, index) => {
        if (response.status === 200 && Array.isArray(response.data)) {
          const { setState, labelFn, idKey } = endpoints[index];
          setState(
            response.data.map((item) => ({
              value: item[idKey],
              label: labelFn(item),
            }))
          );
        } else {
          throw new Error(`Error en el endpoint: ${endpoints[index].url}`);
        }
      });
    } catch (error) {
      console.error("Error al cargar las opciones:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al cargar los datos. Intente nuevamente.",
        icon: "error",
      });
    }
  };

  const cargarMenu = async () => {
    try {
      const endpoints = [
        {
          url: "http://localhost:5001/menu",
          setState: setMenuOptions,
          labelFn: (item) => `${item.id_plato} - ${item.nombre_plato}`,
          idKey: "id_plato",
        }
      ];

      const responses = await Promise.all(
        endpoints.map(({ url }) => Axios.get(url))
      );

      responses.forEach((response, index) => {
        if (response.status === 200 && Array.isArray(response.data)) {
          const { setState, labelFn, idKey } = endpoints[index];
          setState(
            response.data.map((item) => ({
              value: item[idKey],
              label: labelFn(item),
            }))
          );
        } else {
          throw new Error(`Error en el endpoint: ${endpoints[index].url}`);
        }
      });
    } catch (error) {
      console.error("Error al cargar las opciones:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al cargar los datos. Intente nuevamente.",
        icon: "error",
      });
    }
  };

  const cargarMesas = async () => {
    try {
      const response = await Axios.get("http://localhost:5001/mesa");
      if (response.status === 200) {
        setMesaOptions(response.data.map((item) => ({ value: item.id_mesa, label: item.numero })));
      } else {
        throw new Error("Error al cargar las mesas");
      }
    } catch (error) {
      console.error("Error al cargar las mesas:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un problema al cargar las mesas. Intente nuevamente.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    const obtenerComandas = async () => {
      try {
        const response = await Axios.get('http://localhost:5001/comandas');
        console.log("Respuesta de la API:", response.data);
        if (response.status === 200) {
          // Filtrar comandas según el estado
          setComandas(response.data.filter(comanda => comanda.id_estado === 1)); // En preparacion
          setComandasPreparacion(response.data.filter(comanda => comanda.id_estado === 2)); // Lista para servir
          setComandasEntregadas(response.data.filter(comanda => comanda.id_estado === 3)); // Entregada
        }
      } catch (error) {
        console.error("Error al obtener comandas:", error);
      }
    };
    obtenerComandas();
  }, []);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        await cargarEmpleados();
        await cargarMenu();
        await cargarMesas();

      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    cargarDatosIniciales();
  }, []);

  const onSubmit = async (data) => {
    if (!selectedMesero?.value) {
      Swal.fire({
        title: "Error",
        text: "Por favor selecciona mesero.",
        icon: "error",
      });
      return;
    }

    try {
      const comandaResponse = await Axios.post("http://localhost:5001/comandas", {
        id_empleado: selectedMesero?.value,
        id_mesa: mesaSeleccionada,
        id_estado: 1,
        detalles: data.detalles || "//",
      });

      const numeroOrden = comandaResponse.data.id_numero_orden;

      for (const item of orden) {
        const detalleData = {
          id_plato: item.id_plato,
          id_numero_orden: numeroOrden,
          cantidad: item.cantidad,
      };
      console.log("Datos enviados al backend:", detalleData);
      await Axios.post("http://localhost:5001/detalle", detalleData);
  
    }
    Swal.fire({
      title: "Éxito",
      text: "Comanda(s) enviada(s) correctamente.",
      icon: "success",
    });
    handleReset();
  } catch (error) {
    console.error("Error al enviar la comanda:", error);
    console.log("fallo", data);
    Swal.fire({
      title: "Error",
      text: "Ocurrió un problema al enviar la comanda. Intente nuevamente.",
      icon: "error",
    });
  }
  };

  const handleReset = () => {
    reset(); // Resetea el formulario
    setSelectedMesero(null);
    setOrden([]);
  };
  
  const agregarOrden = () => {
    if (!menuSeleccionado || cantidad < 1) return;
    const menu = menuOptions.find((item) => item.label === menuSeleccionado); 
    const nuevaOrden = [...orden, { id_plato: menu.value, menu: menuSeleccionado, cantidad }];
    setOrden(nuevaOrden);
    setMenuSeleccionado("");
    setCantidad(1);
  };

  const eliminarOrden = (index) => {
    const nuevaOrden = orden.filter((_, i) => i !== index);
    setOrden(nuevaOrden);
  };

  const handleClear = () => {
    handleReset(); // Limpia todos los estados
    setFilteredComanda(comandas); // Restaura la lista completa
    Swal.fire({
      title: "Comanda limpia",
      text: "Se han restablecido los resultados.",
      icon: "info",
      timer: 2000,
    });
  };

  const marcarComandaEntregada = async (id) => {
    try {
      const response = await Axios.put(`http://localhost:5001/comandas/${id}`, { estado: 2 });
      if (response.status === 200) {
        // Buscar la comanda en la lista de comandasPreparacion
        const comandaMovida = comandasPreparacion.find(comanda => comanda.id_numero_orden === id);
        
        if (comandaMovida) {
          // Actualizar el estado de la comanda y moverla a comandasEntregadas
          setComandasPreparacion(comandasPreparacion.filter(comanda => comanda.id_numero_orden !== id));
          setComandasEntregadas(prev => [...prev, { ...comandaMovida, estado: 2 }]);
        } else {
          console.error("Comanda no encontrada en comandasPreparacion");
        }
      }
    } catch (error) {
      console.error("Error al marcar la comanda como entregada:", error);
    }
  };

  // Función para cambiar el estado de la comanda 
  
  return (
    <div className="container mt-4 p-4 rounded shadow bg-light">
      <h2 className="text-center mb-4 text-primary">Registrar comanda</h2>
      <form onSubmit={handleFormSubmit(onSubmit)} className="needs-validation">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="nombre_cliente" className="form-label fw-bold">
              Nombre Mesero
            </label>
            <Select
              options={meseroOptions}
              value={selectedMesero}
              onChange={(option) => {
                setSelectedMesero(option);
                setValue("id_empleado", option?.value || "");
              }}
              placeholder="Seleccione un mesero"
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="numero_telefono" className="form-label fw-bold">
              N° de Mesa
            </label>
            <select
            className="form-select"
            value={mesaSeleccionada}
            onChange={(e) => setMesaSeleccionada(e.target.value)}
            >
              <option value="">Seleccione una mesa</option>
              {mesaOptions.map((mesa) => (
                <option key={mesa.value} value={mesa.label}>
                  {mesa.label}
                </option>
              ))}
            </select>
            {errors.NumeroMesa && (
              <p className="text-danger">{errors.NumeroMesa.message}</p>
            )}
          </div>

          <div className="container mt-4">
            <h2>Seleccionar Menú</h2>
            <div className="d-flex gap-2">
              <select
                className="form-select"
                value={menuSeleccionado}
                onChange={(e) => setMenuSeleccionado(e.target.value)}
              >
                <option value="">Seleccione un menú</option>
                {menuOptions.map((menu) => (
                  <option key={menu.value} value={menu.label}>
                    {menu.label}
                  </option>
                ))}
              </select>
              <div className="d-flex gap-2">
                <input
                  type="number"
                  className="form-control"
                  value={cantidad}
                  min="1"
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={agregarOrden}
                >
                  Agregar
                </button>
              </div>
            </div>

            <h3 className="mt-4">Orden Actual</h3>
            {orden.length === 0 ? (
              <p>No hay items en la orden.</p>
            ) : (
            <ul className="list-group">
              {orden.map((item, index) => (
                <li 
                key={index} 
                className="list-group-item d-flex justify-content-between"
                >
                  {item.menu} x {item.cantidad}
                  <button className="btn btn-danger btn-sm" onClick={() => eliminarOrden(index)}>Eliminar</button>
                </li>
              ))}
            </ul>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="detalles" className="form-label fw-bold">
              Detalles
            </label>
            <textarea
              className="form-control"
              {...register("detalles", {
                maxLength: {
                  value: 255,
                  message: "Los detalles no pueden exceder los 255 caracteres",
                },
              })}
              rows="3"
              placeholder="Ingrese detalles de la orden"
            ></textarea>
            {errors.Detalles && (
              <p className="text-danger">{errors.Detalles.message}</p>
            )}
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold shadow-sm rounded"
            >
              Enviar comanda
            </button>
          </div>
          <div className="col-md-6">
            <button
              type="button"
              className="btn btn-secondary w-100 py-2 fw-bold shadow-sm rounded"
              onClick={handleClear}
            >
              Limpiar
            </button>
          </div>
        </div>
        <div>
          <h2>Comandas Listas</h2>
          <table className="table table-bordered mt-3">
            <thead className="table-dark">
              <tr>
                <th>Mesero</th>
                <th>Mesa</th>
                <th>Pedido</th>
                <th>Cantidad</th>
                <th>Detalles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comandasPreparacion.map((comanda, index) => (
                <tr key={index} style={{ backgroundColor: "yellow" }}>
                  <td>{comanda.nombre_empleado}</td>
                  <td>{comanda.numero_mesa}</td>
                  <td>{comanda.nombre_plato}</td>
                  <td>{comanda.cantidad}</td>
                  <td>{comanda.detalles}</td>
                  <td>
                  <button
                    type="button"
                      className="btn btn-primary mx-2"
                      onClick={() => marcarComandaEntregada(comanda.id_numero_orden,2)}>
                      Entregada
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </form>
        </div>
  );
};

export default RegistroComanda;