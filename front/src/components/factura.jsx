import { useState, useEffect } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";

const FacturaPopUp = ({popUp, closePopUp, idNumeroOrden, actualizarComandas}) => {
    const [factura, setFactura] = useState(null);

    useEffect(() => {
        if (popUp && idNumeroOrden) {
            Axios.get(`http://localhost:5001/ventas/${idNumeroOrden}`)
            .then((response) => setFactura(response.data))
            .catch((error) => console.error("Error al obtener la factura:", error));
        }
    }, [popUp, idNumeroOrden]);

    const generarPDF = () => {
        if (!factura) return;
        const doc = new jsPDF(); 
        
        doc.setFont("courier", "bold");
        doc.setFontSize(12);

        doc.text("RUT: 11.111.111-1", 10, 10);
        doc.text("BOLETA ELECTRONICA", 10, 15);
        doc.text(`N° Boleta: ${idNumeroOrden}`, 10, 20);

        doc.setFont("courier", "normal");
        doc.text("ENACCION RESTAURANT", 10, 30);
        doc.text(`FECHA EMISION: ${new Date().toLocaleDateString()}`, 10, 35);

        doc.text("-------------------------------------------------", 10, 40);
        
        doc.setFont("courier", "bold");
        doc.text("CANTIDAD   DESCRIPCION            VALOR", 10, 45);
        doc.setFont("courier", "normal");
        
        
        let y = 55;
        factura.detalles.forEach((detalle) => {
          doc.text(`${detalle.cantidad}          ${detalle.nombre_plato}         $${detalle.total_parcial}`, 20, y);
          y += 10;
        });
        doc.text("-------------------------------------------------", 10, y);

        doc.setFont("courier", "bold");
        doc.text(`Total: $${factura.totalFactura}`, 100, y + 10);
        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text("El IVA de la Boleta: $988", 80, y + 15);
        doc.setFontSize(12);
        doc.text("-------------------------------------------------", 10, y + 20);
        
        doc.setFontSize(10);
        doc.text("Timbre Electronico SII", 10, y + 25);
        doc.text("Res.74 de 2020", 10, y + 30);
        doc.text("DTE Generada con Rjc Software", 10, y + 35);

        doc.save(`Factura ${idNumeroOrden}.pdf`);
      };
    
    const marcarBoletaPagada = async (id_numero_orden) => {
    try {
        const response = await Axios.put(`http://localhost:5001/comandas/${id_numero_orden}`, { id_estado: 5 });
        if (response.status === 200) {
        Swal.fire({
            title: "Éxito",
            text: "Factura pagada correctamente.",
            icon: "success",
        });
        actualizarComandas();
        }
        
    } catch (error) {
        console.error("Error al marcar la factura como pagada:", error);
        Swal.fire({
        title: "Error",
        text: "Error al pagar la factura.",
        icon: "error",
        });
    }
    };
    
    return (
        popUp && (
            <div className="ventana-popup">
              <div className="contenido-popup">
                <button className="btn btn-primary mx-2" onClick={closePopUp}>X</button>
                <h2>Factura</h2>
                <p>Rut: 11.111.111-1</p>
                <p>BOLETA ELECTRONICA</p>
                <p><strong>N° de Comanda: {idNumeroOrden}</strong></p>
                <p>Fecha Emision: {new Date().toLocaleDateString()} </p>
                <p>-------------------</p>
                {factura ? (
                    <>
                    {factura.detalles.map((detalle) => (
                      <p key={detalle.id_detalle}>
                        {detalle.cantidad} x {detalle.nombre_plato} - ${detalle.total_parcial}
                      </p>
                    ))}
                    <p>-------------------</p>
                    <p><strong>Total: ${factura.totalFactura}</strong></p>
                    <button type="button" className="btn btn-success mt-3" onClick={generarPDF}>Descargar PDF</button>
                    <button type="button" className="btn btn-success mt-3" onClick={() => {
                        actualizarComandas();
                        closePopUp();
                        marcarBoletaPagada(idNumeroOrden, 3);
                        }}
                        >
                            Pagar
                        </button>
                  </>
                ): (
                    <p>Cargando factura...</p>
                )}

              </div>
            </div>
          )
    );
};

export default FacturaPopUp;