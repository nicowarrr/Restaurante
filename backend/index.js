require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configurar conexión con PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

//verificar conexion con el servidor
pool.connect()
  .then(() => {
    console.log("Conexión a la base de datos establecida con éxito");
  })
  .catch((err) => {
    console.error("Error al conectar con la base de datos:", err);
    process.exit(1); // Salir con error si no se puede conectar
  });

/* 🔹 RUTAS DE EMPLEADOS */

// Obtener todos los empleados
app.get('/empleados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM empleado ORDER BY id_empleado ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener empleados');
  }
});

// Agregar un nuevo empleado
app.post('/empleados', async (req, res) => {
  const { nombre, apellido, edad, fecha_nacimiento, telefono, correo, cargo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO empleado (nombre, apellido, edad, fecha_nacimiento, telefono, correo, cargo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, apellido, edad, fecha_nacimiento, telefono, correo, cargo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar el empleado');
  }
});

// Actualizar un empleado existente
app.patch('/empleados/:id_empleado', async (req, res) => {
  const { id_empleado } = req.params;
  const { nombre, apellido, edad, fecha_nacimiento, telefono, correo, cargo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE empleado
       SET nombre = $1,
           apellido = $2,
           edad = $3,
           fecha_nacimiento = $4,
           telefono = $5,
           correo = $6,
           cargo = $7
       WHERE id_empleado = $8
       RETURNING *`,
      [nombre, apellido, edad, fecha_nacimiento, telefono, correo, cargo, id_empleado]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Empleado no encontrado");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el empleado');
  }
});

//Obtener todos los platos del menú

app.get('/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener el menú');
  }
});

//obtener todas las comandas
app.get('/comandas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.id_numero_orden, 
        m.nombre_plato, 
        e.nombre AS nombre_empleado, 
        c.fecha_pedido, 
        c.numero_mesa, 
        c.cantidad, 
        c.detalles,
        c.estado
      FROM 
        comanda c
      JOIN 
        menu m ON c.id_plato = m.id_plato
      JOIN 
        empleados e ON c.id_empleado = e.id_empleado`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener las comandas');
  }
});

//Agregar nueva comanda

app.post('/comandas', async (req, res) => {
  const { id_numero_comanda, id_plato, id_empleado, numero_mesa, cantidad, detalles } = req.body;
  try {
    const query = 
    `INSERT INTO comanda (id_numero_comanda ,id_plato, id_empleado, fecha_pedido, numero_mesa, cantidad, detalles, id_numero_orden) 
    VALUES ($1, $2, CURRENT_TIMESTAMP - INTERVAL '3 hours', $3, $4, $5, $6) 
    RETURNING *;`;
    
    const result = await pool.query(
      query,
      [id_numero_comanda, id_plato, id_empleado, numero_mesa, cantidad, detalles, id_numero_orden]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar la comanda');
  }
});

// Ruta para actualizar el estado de la comanda
app.put('/comandas/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (typeof estado !== 'number' ) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const query = 'UPDATE comanda SET estado = $1 WHERE id_numero_orden = $2';

  pool.query(query, [estado, id], (error, results) => {
    if (error) {
      console.error('Error al actualizar el estado:', error);
      return res.status(500).json({ error: 'Error al actualizar el estado' });
    }

    if (results.rowCount > 0) {
      res.status(200).json({ message: `Estado de la comanda actualizado a ${estado}` });
    } else {
      res.status(404).json({ message: 'Comanda no encontrada' });
    }
  });
});

// Eliminar comanda por id
app.delete('/comandas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM comanda WHERE id_numero_orden = $1 RETURNING *',
      [id]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ message: `Comanda con id ${id} eliminada` });
    } else {
      res.status(404).json({ message: `Comanda con id ${id} no encontrada` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar la comanda');
  }
});

//Obtener todos los empleados que son "Meseros/as"
app.get('/meseros', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM empleados WHERE cargo = 'Mesero'");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener empleados');
  }
});

// Obtener ventas por mesero
app.get('/reporte/ventas-meseros', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.nombre, COUNT(c.id_numero_orden) AS total_ventas
       FROM comanda c
       JOIN empleados e ON c.id_empleado = e.id_empleado
       GROUP BY e.nombre
       ORDER BY total_ventas DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo ventas por mesero:", err);
    res.status(500).send("Error al obtener las ventas por mesero");
  }
});

// Obtener platos más pedidos
app.get('/reporte/platos-mas-pedidos', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.nombre_plato, COUNT(c.id_plato) AS total_pedidos
       FROM comanda c
       JOIN menu m ON c.id_plato = m.id_plato
       GROUP BY m.nombre_plato
       ORDER BY total_pedidos DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo platos más pedidos:", err);
    res.status(500).send("Error al obtener los platos más pedidos");
  }
});

// Obtener ventas totales por día
app.get('/reporte/ventas-totales', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT CAST(c.fecha_pedido AS DATE) AS fecha, 
              SUM(m.precio * c.cantidad) AS total_ventas
       FROM comanda c
       JOIN menu m ON c.id_plato = m.id_plato
       GROUP BY fecha
       ORDER BY fecha DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error obteniendo ventas totales:", err);
    res.status(500).send("Error al obtener las ventas totales");
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
