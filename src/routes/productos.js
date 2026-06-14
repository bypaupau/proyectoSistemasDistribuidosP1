// Rutas del CRUD de productos.
// Cada ruta usa el pool de conexión a Postgres (src/db/connection.js).
// Se usan consultas parametrizadas ($1, $2, ...) para evitar inyección SQL.

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// -----------------------------------------------------------------------------
// LISTAR todos los productos  ->  GET /productos
// Si llega ?busqueda=texto, filtra por nombre o por id.
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const { busqueda } = req.query;
    let resultado;

    if (busqueda && busqueda.trim() !== '') {
      // Consulta por nombre (parcial, sin distinguir mayúsculas) o por id exacto.
      const idNumerico = parseInt(busqueda, 10);
      resultado = await pool.query(
        `SELECT * FROM productos
         WHERE nombre ILIKE $1 OR id = $2
         ORDER BY id`,
        [`%${busqueda}%`, isNaN(idNumerico) ? -1 : idNumerico]
      );
    } else {
      resultado = await pool.query('SELECT * FROM productos ORDER BY id');
    }

    res.render('index', { productos: resultado.rows, busqueda: busqueda || '' });
  } catch (err) {
    console.error('Error al listar productos:', err.message);
    res.status(500).send('Error al conectar con la base de datos: ' + err.message);
  }
});

// -----------------------------------------------------------------------------
// FORMULARIO de alta  ->  GET /productos/nuevo
// (Debe ir antes de la ruta /:id para que "nuevo" no se interprete como id.)
// -----------------------------------------------------------------------------
router.get('/nuevo', (req, res) => {
  res.render('nuevo');
});

// -----------------------------------------------------------------------------
// CONSULTAR un producto por id  ->  GET /productos/:id
// Responde JSON (útil para probar la API directamente).
// -----------------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Error al consultar producto:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// REGISTRAR un nuevo producto  ->  POST /productos
// Recibe: nombre, descripcion, cantidad, precio (desde el formulario).
// -----------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, cantidad, precio } = req.body;

    if (!nombre || cantidad === undefined || precio === undefined) {
      return res.status(400).send('Faltan campos obligatorios (nombre, cantidad, precio).');
    }

    await pool.query(
      `INSERT INTO productos (nombre, descripcion, cantidad, precio)
       VALUES ($1, $2, $3, $4)`,
      [nombre, descripcion || '', parseInt(cantidad, 10), parseFloat(precio)]
    );

    res.redirect('/productos');
  } catch (err) {
    console.error('Error al registrar producto:', err.message);
    res.status(500).send('Error al registrar producto: ' + err.message);
  }
});

// -----------------------------------------------------------------------------
// FORMULARIO de edición  ->  GET /productos/:id/editar
// -----------------------------------------------------------------------------
router.get('/:id/editar', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('editar', { producto: resultado.rows[0] });
  } catch (err) {
    console.error('Error al cargar formulario de edición:', err.message);
    res.status(500).send('Error: ' + err.message);
  }
});

// -----------------------------------------------------------------------------
// ACTUALIZAR un producto (incluye stock)  ->  POST /productos/:id/actualizar
// Permite actualizar nombre, descripción, cantidad (stock) y precio.
// -----------------------------------------------------------------------------
router.post('/:id/actualizar', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, cantidad, precio } = req.body;

    const resultado = await pool.query(
      `UPDATE productos
       SET nombre = $1, descripcion = $2, cantidad = $3, precio = $4
       WHERE id = $5`,
      [nombre, descripcion || '', parseInt(cantidad, 10), parseFloat(precio), id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.redirect('/productos');
  } catch (err) {
    console.error('Error al actualizar producto:', err.message);
    res.status(500).send('Error al actualizar producto: ' + err.message);
  }
});

// -----------------------------------------------------------------------------
// ELIMINAR un producto  ->  POST /productos/:id/eliminar
// -----------------------------------------------------------------------------
router.post('/:id/eliminar', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM productos WHERE id = $1', [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.redirect('/productos');
  } catch (err) {
    console.error('Error al eliminar producto:', err.message);
    res.status(500).send('Error al eliminar producto: ' + err.message);
  }
});

module.exports = router;
