import React, { useState, useEffect } from "react";
import Axios from "axios";
import Swal from "sweetalert2";

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error de solicitud:", error.message);
    return Promise.reject(error);
  }
);

const GestionTrabajadores = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [edad, setEdad] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [cargo, setCargo] = useState("");
  const [id, setId] = useState("");
  const [editar, setEditar] = useState(false);
  const [empleadosList, setEmpleados] = useState([]);

  useEffect(() => {
    getEmpleados();
  }, []);

  const getEmpleados = async () => {
    try {
      const response = await Axios.get("http://localhost:5001/empleados1");
      if (response.status === 200) {
        setEmpleados(response.data);
      }
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  };

  const limpiarDatos = () => {
    setNombre("");
    setApellido("");
    setFechaNacimiento("");
    setEdad("");
    setTelefono("");
    setCorreo("");
    setCargo("");
    setEditar(false);
    setId("");
  };

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const cumpleanos = new Date(fecha);
    let edadCalculada = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
      edadCalculada--;
    }
    return edadCalculada;
  };

  const addEmpleado = async () => {
    if (
      !nombre ||
      !apellido ||
      !fechaNacimiento ||
      !telefono ||
      !correo ||
      !cargo
    ) {
      Swal.fire("Error", "Todos los campos son obligatorios.", "error");
      return;
    }

    const nuevoEmpleado = {
      nombre,
      apellido,
      edad: calcularEdad(fechaNacimiento), // Calcula la edad correctamente
      fecha_nacimiento: fechaNacimiento,
      telefono,
      correo,
      cargo,
    };

    console.log("Datos enviados al servidor:", nuevoEmpleado); // Para depuración

    try {
      const response = await Axios.post(
        "http://localhost:5001/empleados",
        nuevoEmpleado
      );
      if (response.status === 201) {
        await getEmpleados();
        limpiarDatos();
        Swal.fire(
          "Empleado registrado",
          "El empleado fue registrado con éxito",
          "success"
        );
      }
    } catch (error) {
      console.error("Error al agregar empleado:", error);
      Swal.fire("Error", "No se logró registrar el empleado.", "error");
    }
  };

  const updateEmpleado = async () => {
    if (
      !nombre ||
      !apellido ||
      !fechaNacimiento ||
      !telefono ||
      !correo ||
      !cargo
    ) {
      Swal.fire("Error", "Todos los campos son obligatorios.", "error");
      return;
    }

    try {
      const datosParaActualizar = {
        nombre,
        apellido,
        edad: calcularEdad(fechaNacimiento),
        fecha_nacimiento: fechaNacimiento,
        telefono,
        correo,
        cargo,
      };

      const response = await Axios.patch(
        `http://localhost:5001/empleados/${id}`,
        datosParaActualizar
      );
      if (response.status === 200) {
        await getEmpleados();
        limpiarDatos();
        Swal.fire(
          "Actualización exitosa",
          `El empleado ${nombre} fue actualizado con éxito`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      Swal.fire("Error", "No se logró actualizar el empleado.", "error");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white text-center">
          <h4>Gestión de Empleados</h4>
        </div>
        <div className="card-body">
          <form>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="form-control"
                  placeholder="Ingrese un Nombre"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="form-control"
                  placeholder="Ingrese un Apellido"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => {
                    setFechaNacimiento(e.target.value);
                    setEdad(calcularEdad(e.target.value));
                  }}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Edad</label>
                <input
                  type="number"
                  value={edad}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="form-control"
                  placeholder="Ingrese un Teléfono"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="form-control"
                  placeholder="Ingrese un Correo"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Cargo</label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="form-select"
                >
                  <option value="">Seleccione un Cargo</option>
                  <option value="Mesero">Mesero</option>
                  <option value="Chef">Chef</option>
                  <option value="Asistente Cocina">Asistente Cocina</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div className="card-footer text-center">
          {editar ? (
            <button onClick={updateEmpleado} className="btn btn-success">
              Actualizar
            </button>
          ) : (
            <button onClick={addEmpleado} className="btn btn-success">
              Registrar
            </button>
          )}
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover table-bordered text-center align-middle mt-4">
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Edad</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Cargo</th>
                  <th>Fecha Contratación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleadosList.map((empleado) => (
                  <tr key={empleado.id_empleado}>
                    <td>{empleado.id_empleado}</td>
                    <td>{empleado.nombre}</td>
                    <td>{empleado.apellido}</td>
                    <td>{empleado.edad}</td>
                    <td>{empleado.telefono}</td>
                    <td>{empleado.correo}</td>
                    <td>{empleado.cargo}</td>
                    <td>
                      {empleado.fecha_contratacion
                        ? new Date(
                            empleado.fecha_contratacion
                          ).toLocaleDateString("es-ES")
                        : "No disponible"}
                    </td>

                    <td>
                      <button
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {
                          setEditar(true);
                          setId(empleado.id_empleado);
                          setNombre(empleado.nombre);
                          setApellido(empleado.apellido);
                          setEdad(empleado.edad);
                          setTelefono(empleado.telefono);
                          setCorreo(empleado.correo);
                          setCargo(empleado.cargo);
                          setFechaNacimiento(
                            empleado.fecha_nacimiento
                              ? empleado.fecha_nacimiento.split("T")[0]
                              : ""
                          ); // Corregido
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionTrabajadores;
