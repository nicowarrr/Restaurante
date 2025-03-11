import React, { useState, useEffect } from "react";
import Axios from "axios";

const ComandasCocina = () => {
  const [comandas, setComandas] = useState([]);
  const [comandasPreparacion, setComandasPreparacion] = useState([]);
  const [comandasEntregadas, setComandasEntregadas] = useState([]);
  const [isUserActive, setIsUserActive] = useState(true);

  useEffect(() => {
    const obtenerComandas = async () => {
      try {
        const response = await Axios.get("http://localhost:5001/comandas3");
        console.log("Respuesta de la API:", response.data);
        if (response.status === 200 && Array.isArray(response.data)) {
          setComandas(response.data.filter(comanda => comanda.estado_detalle === 1)); // En preparación
          setComandasPreparacion(response.data.filter(comanda => comanda.estado_detalle === 2)); // Listas
          setComandasEntregadas(response.data.filter(comanda => comanda.estado_detalle === 3)); // Entregadas
        }
      } catch (error) {
        console.error("Error al obtener comandas:", error);
      }
    };
    obtenerComandas();

    let interval = setInterval(() => {
      if (!isUserActive) {
        obtenerComandas();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isUserActive]);

  useEffect(() => {
    let activityTimeout;

    const resetActivity = () => {
      setIsUserActive(true);
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => setIsUserActive(false), 30000);
    };

    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("scroll", resetActivity);

    activityTimeout = setTimeout(() => setIsUserActive(false), 30000);

    return () => {
      window.removeEventListener("mousemove", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      window.removeEventListener("scroll", resetActivity);
      clearTimeout(activityTimeout);
    };
  }, []);

  const cambiarEstadoComanda = async (id, nuevoEstado) => {
    try {
      const requestBody = { estado_detalle: nuevoEstado };
      if (nuevoEstado === 3) {
        requestBody.fecha_entrega = new Date().toISOString().slice(0, 19).replace("T", " ");
      }
      await Axios.put(`http://localhost:5001/comandas3/${id}`, requestBody);

      setComandas(prev => prev.filter(comanda => comanda.id_detalle !== id));
      setComandasPreparacion(prev => prev.filter(comanda => comanda.id_detalle !== id));
      setComandasEntregadas(prev => prev.filter(comanda => comanda.id_detalle !== id));

      if (nuevoEstado === 2) {
        setComandasPreparacion(prev => [...prev, { id_detalle: id, estado_detalle: 2 }]);
      } else if (nuevoEstado === 3) {
        setComandasEntregadas(prev => [...prev, { id_detalle: id, estado_detalle: 3, fecha_entrega: requestBody.fecha_entrega }]);
      }
    } catch (error) {
      console.error("Error al cambiar el estado de la comanda:", error);
    }
  };

  
  const marcarComandaEntregada = async (id) => {
    try {
      const fechaEntrega = new Date().toISOString().slice(0, 19).replace("T", " ");
  
      const response = await Axios.put(`http://localhost:5001/comandas3/${id}`, { 
        estado_detalle: 3, 
        fecha_entrega: fechaEntrega 
      });
  
      if (response.status === 200) {
        setComandasPreparacion(prev => prev.filter(comanda => comanda.id_detalle !== id));
        setComandasEntregadas(prev => [...prev, { ...response.data.comanda, estado_detalle: 3, fecha_entrega: fechaEntrega }]);
      }
    } catch (error) {
      console.error("Error al marcar la comanda como entregada:", error);
    }
  };
  
  

  return (
    <div className="container mt-4 table-responsive" >
      <h2>Comandas en Preparación</h2>
      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>Fecha</th>
            <th>Mesero</th>
            <th>Mesa</th>
            <th>Pedido</th>
            <th>Cantidad</th>
            <th>Detalles</th>
            <th>Acciones</th>
            
          </tr>
        </thead>
        <tbody>
          {comandas.map((comanda) => (
            <tr key={comanda.estado_detalle}>
              <td>
                Fecha: {comanda.fecha_pedido?.slice(0, 10)}<br />
                Hora: {comanda.fecha_pedido?.slice(11, 19)}
              </td>
              <td>{comanda.nombre_empleado}</td>
              <td>{comanda.numero_mesa}</td>
              <td>{comanda.nombre_plato}</td>
              <td>{comanda.cantidad}</td>
              <td>{comanda.detalles}</td>
              <td>
                <button className="btn btn-success mx-2" 
                  onClick={() => cambiarEstadoComanda(comanda.id_detalle, 2)}>
                  Comanda Lista
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComandasCocina;
