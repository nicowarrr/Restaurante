import React, { useState, useEffect } from "react";
import Axios from "axios";

const ComandasLista = () => {
  const [comandas, setComandas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(""); // Estado para la fecha seleccionada

  useEffect(() => {
    const obtenerComandas = async () => {
      try {
        const response = await Axios.get("http://localhost:5001/comandas");
        console.log("Respuesta de la API:", response.data);

        if (response.status === 200) {
          // Si hay una fecha seleccionada, filtrar las comandas entregadas por esa fecha
          const comandasFiltradas = response.data.filter((comanda) => {
            return (
              comanda.estado === 2 &&
              comanda.fecha_pedido.startsWith(fechaSeleccionada)
            );
          });
          setComandas(comandasFiltradas);
        }
      } catch (error) {
        console.error("Error al obtener comandas:", error);
      }
    };

    if (fechaSeleccionada) {
      obtenerComandas();
    }
  }, [fechaSeleccionada]); // Se ejecuta cada vez que cambia la fecha seleccionada

  return (
    <div className="container mt-4">
      <h2>Lista de Comandas Vendidas</h2>

      {/* Selector de fecha */}
      {/* Selector de fecha */}
      <div className="mb-3">
        <label htmlFor="fecha" className="form-label">
          Selecciona una fecha:
        </label>
        <input
          type="date"
          id="fecha"
          className="form-control"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          max={new Date().toISOString().split("T")[0]} // Limita hasta la fecha actual
        />
      </div>

      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>N° Orden</th>
            <th>Mesero</th>
            <th>Mesa</th>
            <th>Pedido</th>
            <th>Detalles</th>
            <th>Cantidad</th>
            <th>Hora Pedido</th>
            <th>Hora Entrega</th>
            <th>Tiempo Entrega</th>
          </tr>
        </thead>
        <tbody>
          {comandas.length > 0 ? (
            comandas.map((comanda, index) => {
              let tiempoPreparacion = "Error en cálculo";

              if (comanda.fecha_pedido && comanda.hora_entrega) {
                const fechaPedido = new Date(comanda.fecha_pedido); // Fecha completa con hora

                // Extraer solo la hora de `hora_entrega` y aplicarla sobre `fechaPedido`
                const [hh, mm, ss] = comanda.hora_entrega.split(":");
                const horaEntrega = new Date(fechaPedido); // Copia la fecha completa
                horaEntrega.setHours(
                  parseInt(hh, 10),
                  parseInt(mm, 10),
                  parseInt(ss, 10)
                );

                // Manejar casos donde `hora_entrega` pertenece al día siguiente
                if (horaEntrega < fechaPedido) {
                  horaEntrega.setDate(horaEntrega.getDate() + 1); // Avanzar al siguiente día
                }

                if (!isNaN(fechaPedido) && !isNaN(horaEntrega)) {
                  const diferenciaMs = horaEntrega - fechaPedido;
                  const totalMinutos = Math.floor(diferenciaMs / 60000);
                  const segundos = Math.floor((diferenciaMs % 60000) / 1000);

                  if (totalMinutos >= 60) {
                    const horas = Math.floor(totalMinutos / 60);
                    const minutos = totalMinutos % 60;
                    tiempoPreparacion = `${horas}h ${minutos}min ${segundos}seg`;
                  } else {
                    tiempoPreparacion = `${totalMinutos}min ${segundos}seg`;
                  }
                }
              }

              return (
                <tr key={index}>
                  <td>{comanda.id_numero_orden}</td>
                  <td>{comanda.nombre_empleado}</td>
                  <td>{comanda.numero_mesa}</td>
                  <td>{comanda.nombre_plato}</td>
                  <td>{comanda.detalles}</td>
                  <td>{comanda.cantidad}</td>
                  <td>
                    
                    {comanda.fecha_pedido
                      ? comanda.fecha_pedido.slice(11, 19)
                      : "N/A"}
                  </td>
                  <td>
                    
                    {comanda.hora_entrega ? comanda.hora_entrega : "N/A"}
                  </td>
                  <td>{tiempoPreparacion}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No hay comandas entregadas en esta fecha
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ComandasLista;
