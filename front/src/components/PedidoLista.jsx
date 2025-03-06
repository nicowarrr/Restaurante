import React, { useState, useEffect } from "react";
import Axios from "axios";
import '../styles/ListaPedido.css';

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

      <div className="total-ventas">
        Total Ventas: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(
          comandas.reduce((total, comanda) => total + comanda.precio_unitario * comanda.cantidad, 0)
        )}
      </div>

      {/* Selector de fecha */}
      {/* Selector de fecha */}
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
            <th>Cantidad</th>
            <th>Hora Pedido</th>
            <th>Hora Entrega</th>
            <th>Tiempo Entrega</th>
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
              <td colSpan="9" className="text-center">
                No hay comandas entregadas en esta fecha
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination">
        <button 
          className="page-item" 
          onClick={() => paginate(Math.max(1, paginaActual - 1))}>
          Anterior
        </button>

        {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(startPage + index)}
            className={`page-item ${paginaActual === startPage + index ? 'active' : ''}`}
          >
            {startPage + index}
          </button>
        ))}

        <button 
          className="page-item" 
          onClick={() => paginate(Math.min(totalPaginas, paginaActual + 1))}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ComandasLista;
