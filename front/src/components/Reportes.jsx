import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';

const Reportes = () => {
  const [ventasPorMesero, setVentasPorMesero] = useState([]);
  const [platosMasPedidos, setPlatosMasPedidos] = useState([]);
  const [ventasTotales, setVentasTotales] = useState([]);
  const [fechaHoraActual, setFechaHoraActual] = useState("");

  useEffect(() => {
    fetchDatos();
    actualizarFechaHora();
    const interval = setInterval(actualizarFechaHora, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDatos = async () => {
    try {
      const resMeseros = await axios.get('http://localhost:5001/reporte/ventas-meseros');
      const resPlatos = await axios.get('http://localhost:5001/reporte/platos-mas-pedidos');
      const resVentas = await axios.get('http://localhost:5001/reporte/ventas-totales');

      setVentasPorMesero(resMeseros.data);
      setPlatosMasPedidos(resPlatos.data);
      setVentasTotales(resVentas.data.map(venta => ({
        ...venta,
        fecha: new Date(venta.fecha).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      })));
    } catch (error) {
      console.error('Error obteniendo los reportes:', error);
    }
  };

  const actualizarFechaHora = () => {
    const fecha = new Date();
    const formatoFechaHora = fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
    setFechaHoraActual(formatoFechaHora);
  };

  const exportarExcel = () => {
    const libro = XLSX.utils.book_new();
    
    const hojaMeseros = XLSX.utils.json_to_sheet(ventasPorMesero);
    XLSX.utils.book_append_sheet(libro, hojaMeseros, "Ventas por Mesero");
    
    const hojaPlatos = XLSX.utils.json_to_sheet(platosMasPedidos);
    XLSX.utils.book_append_sheet(libro, hojaPlatos, "Platos Más Pedidos");
    
    const hojaVentas = XLSX.utils.json_to_sheet(ventasTotales);
    XLSX.utils.book_append_sheet(libro, hojaVentas, "Ventas Totales");
    
    XLSX.writeFile(libro, "Reportes_Restaurante.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Reportes del Restaurante</h2>
      <p className="text-center">Fecha y Hora Actual: {fechaHoraActual}</p>
      <button className="btn btn-primary mb-3" onClick={exportarExcel}>Exportar a Excel</button>
      
      <div className="row mt-4">
        <div className="col-md-12">
          <h4 className="text-center">Panel de Power BI</h4>
          <iframe 
            title="Power BI Report"
            width="100%"
            height="600px"
            src="https://app.powerbi.com/view?r=eyJrIjoiNjMzMjE3NjktOWVkMC00Y2QyLTliYjMtMWJiNzk1YzIwMDY4IiwidCI6IjM4YTFlMGExLWI2YjEtNDJlOS1iM2E5LTU5NzYyNjY3MGIxNyIsImMiOjR9"
            frameBorder="0" 
            allowFullScreen>
          </iframe>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <h4 className="text-center">Ventas por Mesero</h4>
          <Bar data={{ labels: ventasPorMesero.map(m => m.nombre), datasets: [{ label: 'Ventas por Mesero', data: ventasPorMesero.map(m => m.total_ventas), backgroundColor: 'rgba(54, 162, 235, 0.6)' }] }} />
        </div>
        <div className="col-md-6">
          <h4 className="text-center">Platos Más Pedidos</h4>
          <Pie data={{ labels: platosMasPedidos.map(p => p.nombre_plato), datasets: [{ label: 'Cantidad Pedida', data: platosMasPedidos.map(p => p.total_pedidos), backgroundColor: 'rgba(255, 99, 132, 0.6)' }] }} />
        </div>
      </div>
      <div className="mt-4">
        <h4 className="text-center">Ventas Totales</h4>
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total Ventas</th>
            </tr>
          </thead>
          <tbody>
            {ventasTotales.map((venta, index) => (
              <tr key={index}>
                <td>{venta.fecha}</td>
                <td>${venta.total_ventas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reportes;
