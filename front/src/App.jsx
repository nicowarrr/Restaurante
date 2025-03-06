import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Registro from "./pages/Registro";
import Ventas from "./pages/Ventas";
import Footer from "./components/Footer";
import { UserProvider } from "./context/UserContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Comanda from "./pages/Comanda";
import Comanda2 from "./pages/Comanda2";
import ListaComanda from "./pages/ListaComanda";



function App() {
  return (
    <UserProvider>
        <div>
          <Routes>
            <Route path="/Comanda" element={<Comanda />} />
            <Route path="/Comanda2" element={<Comanda2 />} />
            <Route path="/Registro" element={<Registro />} />
            <Route path="/ListaComanda" element={<ListaComanda />} />
            <Route path="/" element={<Ventas />} />
          </Routes>
          <div className="footer">
            <Footer />
          </div>
        </div>
    </UserProvider>
  );
}

export default App;
