import React from 'react';
import imagenes from '../assets/img/imagenes';

function Footer() {
  return (
    <footer className="footer mt-auto py-4" style={{ backgroundColor: '#212529', color: '#f8f9fa' }}>
      <div className="container">
        <div className="row">
          {/* Columna de descripción */}
          <div className="col-12 col-md-4">
            <h5 className="text-uppercase" style={{ fontWeight: 'bold' }}>Restaurante Enaccion</h5>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              Llevamos más de 30 años de experiencia cultivando nuestra sasón y cultura, brindando atencion de calidad junto a nuestro gran equipo de chefs y garsones, 
              somos Restaurante Enaccion.
            </p>
          </div>

          {/* Columna vacía para diseño */}
          <div className="col-12 col-md-4 d-flex align-items-center justify-content-center">
            <img
              src={imagenes.img2} // Ruta del logo
              alt="Logo Restaurante Enaccion"
              style={{ maxWidth: '150px', borderRadius: '8px' }}
            />
          </div>

          {/* Columna de contacto */}
          <div className="col-12 col-md-4">
            <h5 className="text-uppercase" style={{ fontWeight: 'bold' }}>Contacto</h5>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              Dirección: Av. Providencia 3653<br />
              Teléfono: <a href="tel:+56964409440" style={{ color: '#f8f9fa', textDecoration: 'underline' }}>+569 644 09440</a><br />
              Email: <a href="restorant.enaccion@gmail.com" style={{ color: '#f8f9fa', textDecoration: 'underline' }}>restorant.enaccion@gmail.com</a>
            </p>
          </div>
        </div>
        <hr style={{ borderColor: '#6c757d' }} />
        <div className="text-center" style={{ fontSize: '0.85rem', color: '#adb5bd' }}>
          &copy; {new Date().getFullYear()} Restaurante Enaccion. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

export default Footer;