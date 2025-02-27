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

// Rutas API

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

//Agregar un nuevo empleado
app.post('/empleados', async (req, res) => {
  const { nombre, apellido, edad, fecha_nacimiento, fecha_contratacion, telefono, correo, cargo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO empleado (nombre, apellido, edad, fecha_nacimiento, fecha_contratacion, telefono, correo, cargo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [nombre, apellido, edad, fecha_nacimiento, fecha_contratacion, telefono, correo, cargo]
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
  const {telefono, correo, cargo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE empleado
       SET telefono = $1,
           correo = $2,
           cargo = $3,
       WHERE id_empleado = $4
       RETURNING *`,
      [telefono, correo, cargo, id_empleado]
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
        e.nombre AS nombre_empleado,
        mn.nombre_plato,
        ms.numero AS numero_mesa,
        d.cantidad,
        c.fecha_pedido,
        c.fecha_entrega
      FROM 
        comanda c
      JOIN 
        empleado e ON c.id_empleado = e.id_empleado
      JOIN
        detalle d ON c.id_numero_orden = d.id_numero_orden
      JOIN
        menu mn ON d.id_plato = mn.id_plato
      JOIN
        mesa ms ON c.id_mesa = ms.id_mesa`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener las comandas');
  }
});

//Agregar nueva comanda

app.post('/comandas', async (req, res) => {
  const { id_plato, id_empleado, numero_mesa, cantidad, detalles } = req.body;
  try {

    const query = `
    INSERT INTO comanda (id_numero_orden, id_empleado, id_mesa, id_estado, fecha_pedido, fecha_entrega) 
    VALUES ($1, $2, $3, $4,  CURRENT_TIMESTAMP - INTERVAL '3 hours', $6) 
    RETURNING *;
  `;
    const result = await pool.query(
     query,
      [id_plato, id_empleado, numero_mesa, cantidad, detalles]
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

app.get('/mesa', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mesa ORDER BY id_mesa ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener mesas');
  }
});

app.post('/mesa', async (req, res) => {
  const { numero, capacidad } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO mesa (numero, capacidad) VALUES ($1, $2) RETURNING *',
      [numero, capacidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar la mesa');
  }
});

app.get('/estado', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estado ORDER BY id_estado ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener estados');
  }
});

app.get('/detalle', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM detalle ORDER BY id_detalle ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener detalles');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
