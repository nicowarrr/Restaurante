import { useState, useEffect } from "react";
import Axios from "axios";
import jsPDF from "jspdf";

const FacturaPopUp = ({popUp, closePopUp, idNumeroOrden}) => {
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
        let pageWidth = doc.internal.pageSize.width;
        let y = 10
        
        doc.setFont("courier", "bold");
        doc.setFontSize(12);

        let textosCentrados = [
            "RUT: 11.111.111-1",
            "BOLETA ELECTRONICA",
            `N°       ${idNumeroOrden}`,
            "ENACCION RESTAURANT",
            `FECHA EMISION: ${new Date().toLocaleDateString()}`
        ];

        textosCentrados.forEach(texto => {
            let textWidth = doc.getTextWidth(texto);
            doc.text((pageWidth - textWidth) / 2, y, texto);
            y += 5;
        });
        
        doc.text("-------------------------------------------------", 10, y);
        y += 5;
        
        doc.setFont("courier", "bold");
        doc.text("CANTIDAD   DESCRIPCION            VALOR", 10, y);
        y += 5;
        doc.setFont("courier", "normal");
    
        factura.detalles.forEach((detalle) => {
            doc.text(detalle.cantidad, 10, y);
            doc.text(detalle.descripcion, 30, y);
            doc.text(detalle.valor, pageWidth - doc.getTextWidth(detalle.valor) - 10, y);
            y += 5;
        });

        doc.text("-------------------------------------------------", 10, y);
        y += 5;

        doc.setFont("courier", "bold");
        let total = `TOTAL                 $    ${factura.totalFactura}`;
        doc.text(pageWidth - doc.getTextWidth(total) - 10, y, total);
        y += 5;

        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text("El IVA de la Boleta: $988", 80, y + 15);
        doc.setFontSize(12);
        doc.text("-------------------------------------------------", 10, y + 20);
        
        doc.setFontSize(10);
        doc.text("Timbre Electronico SII", 10, y + 25);
        doc.text("Res.74 de 2025", 10, y + 30);
        doc.text("DTE Generada con Rjc Software", 10, y + 35);

        doc.save(`Factura ${idNumeroOrden}.pdf`);
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
                    <button className="btn btn-success mt-3" onClick={generarPDF}>Descargar PDF</button>
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