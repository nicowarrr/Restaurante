import React, { useState, useEffect } from "react";
import Axios from "axios";

const ComandasCocina = () => {
  const [comandas, setComandas] = useState([]);
  const [comandasPreparacion, setComandasPreparacion] = useState([]);
  const [comandasEntregadas, setComandasEntregadas] = useState([]);

  // Obtener las comandas al cargar el componente
  useEffect(() => {
    const obtenerComandas = async () => {
      try {
        const response = await Axios.get('http://localhost:5001/comandas');
        console.log("Respuesta de la API:", response.data);
        if (response.status === 200) {
          // Filtrar comandas según el estado
          setComandas(response.data.filter(comanda => comanda.estado === 0)); // Solo comandas no listas
          setComandasPreparacion(response.data.filter(comanda => comanda.estado === 1)); // Solo comandas listas
          setComandasEntregadas(response.data.filter(comanda => comanda.estado === 2)); // Solo comandas listas
        }
      } catch (error) {
        console.error("Error al obtener comandas:", error);
      }
    };
    obtenerComandas();
  }, []);

  

  // Función para eliminar la comanda
const eliminarPorID = async (id) => {
  try {
    const response = await Axios.delete(`http://localhost:5001/comandas/${id}`);
    if (response.status === 200) {
      // Filtrar las comandas eliminadas de ambas listas (no listas y listas)
      const nuevasComandas = comandas.filter(comanda => comanda.id_numero_orden !== id);
      const nuevasComandasPreparacion = comandasPreparacion.filter(comanda => comanda.id_numero_orden !== id);

      // Actualizar el estado de las comandas
      setComandas(nuevasComandas);
      setComandasPreparacion(nuevasComandasPreparacion);

      console.log("Comanda eliminada correctamente");
    }
  } catch (error) {
    console.error("Error al eliminar comanda:", error);
  }
};


  // Función para cambiar el estado de la comanda
  const cambiarEstadoComanda = async (id, nuevoEstado) => {
    try {
      const response = await Axios.put(`http://localhost:5001/comandas/${id}`, { estado: nuevoEstado });
      if (response.status === 200) {
        // Actualizar la lista de comandas
        const updatedComandas = comandas.map(comanda =>
          comanda.id_numero_orden === id ? { ...comanda, estado: nuevoEstado } : comanda
        );
        setComandas(updatedComandas);

        // Si la comanda pasa a lista, moverla a la lista de comandas preparadas
        if (nuevoEstado === 1) {
          const comandaMovida = updatedComandas.find(comanda => comanda.id_numero_orden === id);
          setComandasPreparacion([...comandasPreparacion, comandaMovida]);
          setComandas(updatedComandas.filter(comanda => comanda.id_numero_orden !== id));
        } else {
          const comandaMovida = updatedComandas.find(comanda => comanda.id_numero_orden === id);
          setComandasPreparacion(comandasPreparacion.filter(comanda => comanda.id_numero_orden !== id));
          setComandas([...comandas, comandaMovida]);
        }
      }
      
    } catch (error) {
      console.error("Error al cambiar el estado de la comanda:", error);
    }
    
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
  
  


  return (
    <div className="container mt-4">
      {/* Comandas en Cocina (No listas) */}
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
          {comandas.map((comanda, index) => (
            <tr key={index}>
              <td>
                Fecha: {comanda.fecha_pedido.slice(0,10)}<br />
                Hora: {comanda.fecha_pedido.slice(11,19)}
              </td>
              <td>{comanda.nombre_empleado}</td>
              <td>{comanda.numero_mesa}</td>
              <td>{comanda.nombre_plato}</td>
              <td>{comanda.cantidad}</td>
              <td>{comanda.detalles}</td>
              <td>
                <button
                  className="btn btn-success mx-2"
                  onClick={() => cambiarEstadoComanda(comanda.id_numero_orden, 1)}
                >
                  Comanda Lista
                </button>
                <button
                className="btn btn-danger mx-2"
                onClick={() => eliminarPorID(comanda.id_numero_orden)}
              >
                Eliminar
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

