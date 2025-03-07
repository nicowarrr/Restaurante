import { useState, useEffect } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";

const FacturaPopUp = ({
  popUp,
  closePopUp,
  idNumeroOrden,
  actualizarComandas,
  detallesPreparacion,
  setDetallesPreparacion,
  actualizarDetalle1,
}) => {
  const [factura, setFactura] = useState(null);

  useEffect(() => {
    if (popUp && idNumeroOrden) {
      Axios.get(`http://localhost:5001/ventas/${idNumeroOrden}`)
        .then((response) => {
          const detallesFiltrados = response.data.detalles.filter(
            (detalle) => parseInt(detalle.estado_detalle, 10) !== 6
          );
          const totalFactura = detallesFiltrados.reduce(
            (acc, detalle) => acc + detalle.total_parcial,
            0
          );
          setFactura({
            ...response.data,
            detalles: detallesFiltrados,
            totalFactura,
          });
        })
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
      doc.text(
        `${detalle.cantidad}          ${detalle.nombre_plato}         $${detalle.total_parcial}`,
        20,
        y
      );
      y += 10;
    });
    doc.text("-------------------------------------------------", 10, y);
    doc.setFont("courier", "bold");
    doc.text(`Total: $${factura.totalFactura}`, 100, y + 10);
    doc.setFontSize(10);
    doc.setFont("courier", "normal");
    doc.text(`El IVA de la Boleta: $${Math.round(factura.totalFactura*0.19)}`, 77, y + 15);
    doc.setFontSize(12);
    doc.text("-------------------------------------------------", 10, y + 20);
    doc.setFontSize(10);
    doc.text("Timbre Electronico SII", 10, y + 25);
    doc.text("Res.74 de 2025", 10, y + 30);
    doc.text("DTE Generada con Rjc Software", 10, y + 35);
    doc.save(`Boleta ${idNumeroOrden}.pdf`);
  };

  const marcarBoletaPagada = async (id_numero_orden) => {
    try {
      const response = await Axios.put(
        `http://localhost:5001/comandas/${id_numero_orden}`,
        { id_estado: 5 }
      );
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

  const actualizarDetalle = async (idNumeroOrden) => {
    try {
      const response = await Axios.put("http://localhost:5001/detalle", {
        id_numero_orden: idNumeroOrden,
      });
      if (response.status === 200) {
        setDetallesPreparacion((prevDetalles) =>
          prevDetalles.filter((detalle) => detalle.estado_detalle !== 5)
        );
        actualizarDetalle1();
        console.log("Estado actualizado");
      }
    } catch (error) {
      console.error("Error al actualizar el estado");
    }
  };

  return (
    popUp && (
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Boleta</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closePopUp}
              ></button>
            </div>
            <div className="modal-body">
              <p>
                <strong>RUT:</strong> 11.111.111-1
              </p>
              <p>
                <strong>BOLETA ELECTRONICA</strong>
              </p>
              <p>
                <strong>N° de Comanda:</strong> {idNumeroOrden}
              </p>
              <p>
                <strong>Fecha Emisión:</strong>{" "}
                {new Date().toLocaleDateString()}
              </p>
              <hr />
              {factura ? (
                <>
                  {factura.detalles.map((detalle) => (
                    <p key={detalle.id_detalle}>
                      {detalle.cantidad} x {detalle.nombre_plato} - $
                      {detalle.total_parcial}
                    </p>
                  ))}
                  <hr />
                  <p className="fw-bold">Total: ${factura.totalFactura}</p>
                </>
              ) : (
                <p>Cargando factura...</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                onClick={closePopUp}
              >
                Cerrar
              </button>
              {factura && (
                <>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={generarPDF}
                  >
                    Descargar PDF
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      actualizarComandas();
                      closePopUp();
                      marcarBoletaPagada(idNumeroOrden, 3);
                      actualizarDetalle(idNumeroOrden)
                    }}
                  >
                    Pagar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default FacturaPopUp;
