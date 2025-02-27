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
  // Declaración de estados
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [edad, setEdad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [pais, setPais] = useState("");
  const [cargo, setCargo] = useState("");
  const [anios, setAnios] = useState("");
  const [direccion, setDireccion] = useState("");
  const [id, setId] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [editar, setEditar] = useState(false);
  const [empleadosList, setEmpleados] = useState([]);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  // Estados para errores
  const [errorNombre, setErrorNombre] = useState("");
  const [errorApellido, setErrorApellido] = useState("");
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorCargo, setErrorCargo] = useState("");
  const [errorAnios, setErrorAnios] = useState("");
  const [errorCampos, setErrorCampos] = useState("");

  // Función para calcular la edad a partir de la fecha de nacimiento
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

  // Validaciones de los campos
  const validarCamposObligatorios = () => {
    if (!nombre || !apellido || !telefono || !correo || !cargo) {
      setErrorCampos("Todos los campos son obligatorios.");
      return false;
    } else {
      setErrorCampos("");
      return true;
    }
  };

  const validarNombre = () => {
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/.test(nombre)) {
      setErrorNombre("El nombre solo puede contener letras.");
      return false;
    } else {
      setErrorNombre("");
      return true;
    }
  };

  const validarApellido = () => {
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/.test(apellido)) {
      setErrorApellido("El apellido solo puede contener letras.");
      return false;
    } else {
      setErrorApellido("");
      return true;
    }
  };

  const validarTelefono = () => {
    if (telefono.length !== 9) {
      setErrorTelefono("El número de teléfono debe tener exactamente 9 dígitos.");
      return false;
    } else {
      setErrorTelefono("");
      return true;
    }
  };

  const validarCorreo = () => {
    if (!correo.includes("@")) {
      setErrorCorreo("El correo debe contener el símbolo @.");
      return false;
    } else {
      setErrorCorreo("");
      return true;
    }
  };

  const validarCargo = () => {
    if (!cargo) {
      setErrorCargo("El cargo es obligatorio.");
      return false;
    } else {
      setErrorCargo("");
      return true;
    }
  };

  const validarAnios = () => {
    if (anios && isNaN(parseInt(anios, 10))) {
      setErrorAnios("Los años deben ser un número.");
      return false;
    } else {
      setErrorAnios("");
      return true;
    }
  };

  // Función para obtener los empleados
  const getEmpleados = async () => {
    try {
      const response = await Axios.get("http://localhost:5001/empleados");
      if (response.status === 200) {
        setEmpleados(response.data);
      }
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  };

  useEffect(() => {
    getEmpleados();
  }, []);

  // Función para limpiar los datos del formulario
  const limpiarDatos = () => {
    setNombre("");
    setApellido("");
    setFechaNacimiento("");
    setEdad("");
    setTelefono("");
    setCorreo("");
    setCargo("");
    setAnios("");
    setEditar(false);
    setId("");
  };

  // Función para agregar un nuevo empleado
  const add = async () => {
    if (
      !validarCamposObligatorios() ||
      !validarNombre() ||
      !validarApellido() ||
      !validarTelefono() ||
      !validarCorreo() ||
      !validarCargo()
    ) {
      return;
    }
    try {
      const nuevoEmpleado = {
        nombre,
        apellido,
        edad,
        telefono,
        correo,
        cargo,
      };
      const response = await Axios.post("http://localhost:5001/empleados", nuevoEmpleado);
      if (response.status === 200 || response.status === 201) {
        await getEmpleados();
        limpiarDatos();
        Swal.fire({
          title: "Empleado registrado",
          text: "El empleado fue registrado con éxito",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      console.error("Error al agregar empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se logró registrar el empleado!",
      });
    }
  };

  // Función para actualizar un empleado existente
  const updateEmpleado = async () => {
    if (
      !validarCamposObligatorios() ||
      !validarNombre() ||
      !validarApellido() ||
      !validarTelefono() ||
      !validarCorreo() ||
      !validarCargo() ||
      !validarAnios()
    ) {
      return;
    }
    try {
      const datosParaActualizar = {
        id,
        nombre,
        apellido,
        edad: parseInt(edad, 10),
        telefono,
        correo,
        cargo,
        anios: parseInt(anios, 10),
      };
      const response = await Axios.patch(`http://localhost:5001/empleados/${id}`, datosParaActualizar);
      if (response.status === 200) {
        await getEmpleados();
        limpiarDatos();
        Swal.fire({
          title: "Actualización exitosa",
          text: `El empleado ${nombre} fue actualizado con éxito`,
          icon: "success",
          timer: 4000,
        });
      }
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se logró actualizar el empleado!",
      });
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
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(value)) {
                        setNombre(value);
                      }
                    }}
                    className="form-control"
                    placeholder="Ingrese un Nombre"
                  />
                </div>
                {errorNombre && <div className="text-danger mt-1">{errorNombre}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Apellido</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(value)) {
                        setApellido(value);
                      }
                    }}
                    className="form-control"
                    placeholder="Ingrese un Apellido"
                  />
                </div>
                {errorApellido && <div className="text-danger mt-1">{errorApellido}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Fecha de Nacimiento</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-calendar"></i>
                  </span>
                  <input
                    type="date"
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                    value={fechaNacimiento}
                    onChange={(e) => {
                      setFechaNacimiento(e.target.value);
                      setEdad(calcularEdad(e.target.value));
                    }}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Edad</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-bar-chart"></i>
                  </span>
                  <input
                    type="number"
                    value={edad}
                    readOnly
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Teléfono</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,9}$/.test(value)) {
                        setTelefono(value);
                      }
                    }}
                    className="form-control"
                    placeholder="Ingrese un Teléfono"
                  />
                </div>
                {errorTelefono && <div className="text-danger mt-1">{errorTelefono}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Correo</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="form-control"
                    placeholder="Ingrese un Correo"
                  />
                </div>
                {errorCorreo && <div className="text-danger mt-1">{errorCorreo}</div>}
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
                {errorCargo && <div className="text-danger mt-1">{errorCargo}</div>}
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
            <button onClick={add} className="btn btn-success">
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleadosList.map((empleado, index) => (
                  <tr key={empleado.id_empleado || index}>
                    <td>{empleado.id_empleado}</td>
                    <td>{empleado.nombre}</td>
                    <td>{empleado.apellido}</td>
                    <td>{empleado.edad}</td>
                    <td>{empleado.telefono}</td>
                    <td>{empleado.correo}</td>
                    <td>{empleado.cargo}</td>
                    <td>
                      <div className="btn-group" role="group">
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
                          }}
                        >
                          Editar
                        </button>
                      </div>
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
