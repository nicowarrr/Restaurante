import React, { useState, useEffect } from "react";
import Axios from "axios";

const ComandasLista = () => {
  const [comandas, setComandas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");

  useEffect(() => {
    const obtenerComandas = async () => {
      try {
        const response = await Axios.get("http://localhost:5001/comandas2");
        if (response.status === 200) {
          const comandasFiltradas = response.data.filter(comanda => 
            new Date(comanda.fecha_pedido).toISOString().split("T")[0] === fechaSeleccionada
          );
          setComandas([...comandasFiltradas]);
        }
      } catch (error) {
        console.error("Error al obtener comandas:", error);
      }
    };

    if (fechaSeleccionada) {
      obtenerComandas();
    }
  }, [fechaSeleccionada]);

  const formatTiempoEntrega = (fechaPedido, fechaEntrega) => {
    if (!fechaEntrega) return "No entregado";
    
    const tiempoMs = new Date(fechaEntrega) - new Date(fechaPedido);
    if (tiempoMs < 0) return "Tiempo inválido";
    
    const segundos = Math.floor((tiempoMs / 1000) % 60);
    const minutos = Math.floor((tiempoMs / (1000 * 60)) % 60);
    const horas = Math.floor((tiempoMs / (1000 * 60 * 60)));
    
    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    } else {
      return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lista de Comandas Vendidas</h2>

      <div className="mb-3">
        <label htmlFor="fecha" className="form-label">Selecciona una fecha:</label>
        <input
          type="date"
          id="fecha"
          className="form-control"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
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
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {comandas.length > 0 ? (
            comandas.map((comanda, index) => (
              <tr key={index}>
                <td>{comanda.id_numero_orden}</td>
                <td>{comanda.nombre_empleado}</td>
                <td>{comanda.numero_mesa}</td>
                <td>{comanda.nombre_plato}</td>
                <td>{comanda.detalles}</td>
                <td>{comanda.cantidad}</td>
                <td>{comanda.fecha_pedido.slice(11, 19)}</td>
                <td>{comanda.fecha_entrega ? comanda.fecha_entrega.slice(11, 19) : "No entregado"}</td>
                <td>{formatTiempoEntrega(comanda.fecha_pedido, comanda.fecha_entrega)}</td>
                <td>{comanda.estado}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
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
