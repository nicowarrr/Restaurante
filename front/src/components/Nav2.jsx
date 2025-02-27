/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { Link, Outlet } from "react-router-dom";
import imagenes from "../assets/img/imagenes";

const Nav2 = () => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid">
          {/* Logo a la izquierda */}
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img
              src={imagenes.img2}
              className="img-fluid"
              style={{
                maxWidth: "60px",
                maxHeight: "60px",
                marginRight: "10px",
              }}
            />
            <span className="fs-5 fw-bold text-uppercase">Restaurante Enaccion</span>
          </Link>

          {/* Botón de colapsar para pantallas pequeñas */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Contenido del menú */}
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNavDropdown"
          >
            <ul className="navbar-nav">
         
            
              <li className="nav-item">
                <Link to="/" className="nav-link text-light">
                  Menú
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Comanda" className="nav-link text-light">
                  Comandas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/ListaComanda" className="nav-link text-light">
                  Lista Comandas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/Comanda2" className="nav-link text-light">
                  Registro Comanda
                </Link>
              </li>
              
              <li className="nav-item">
                <Link to="/RegistroPersonas" className="nav-link text-light">
                  Registro Empleados
                </Link>
              </li>
          
              
              
            </ul>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="container mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Nav2;
