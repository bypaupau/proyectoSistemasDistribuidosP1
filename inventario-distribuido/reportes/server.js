// ============================================================================
//  server.js  —  Servicio de reportes (Estudiante 2, Contenedor B)
//
//  Se conecta a PostgreSQL POR NOMBRE DE SERVICIO ("db"), no por IP, porque
//  ambos contenedores comparten la red interna de Docker.
//
//  Genera los 3 reportes que pide el enunciado:
//    1) Productos con stock bajo (menos de 5 unidades)
//    2) Top 5 productos con mayor valor total en inventario (cantidad x precio)
//    3) Resumen general (total de productos y valor total del inventario)
//
//  Los muestra de 3 formas (para ganar mas puntos):
//    - Pagina web   ->  http://localhost:4000/
//    - JSON         ->  /api/stock-bajo, /api/top-valor, /api/resumen
//    - CSV descarga ->  /export/csv
// ============================================================================

const path = require('path');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;

// --- Conexion a la base de datos (todo desde variables de entorno) ---
const pool = new Pool({
  host: process.env.DB_HOST,       // "db" (nombre del servicio en docker-compose)
  port: process.env.DB_PORT,       // 5432
  database: process.env.DB_NAME,   // inventario
  user: process.env.DB_USER,       // admin
  password: process.env.DB_PASSWORD,
});

// --- Vistas EJS y archivos estaticos ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------------------------------
//  CONSULTAS (cada reporte es una query SQL)
// ----------------------------------------------------------------------------

// 1) Productos con stock bajo (menos de 5 unidades).
function consultaStockBajo() {
  return pool.query(
    `SELECT id, nombre, descripcion, cantidad, precio
       FROM productos
      WHERE cantidad < 5
      ORDER BY cantidad ASC, nombre ASC`
  );
}

// 2) Top 5 productos por valor total en inventario (cantidad * precio).
function consultaTopValor() {
  return pool.query(
    `SELECT id, nombre, cantidad, precio,
            (cantidad * precio) AS valor_total
       FROM productos
      ORDER BY valor_total DESC
      LIMIT 5`
  );
}

// 3) Resumen general: cuantos productos hay y cuanto vale todo el inventario.
function consultaResumen() {
  return pool.query(
    `SELECT COUNT(*)::int                              AS total_productos,
            COALESCE(SUM(cantidad), 0)::int            AS unidades_totales,
            COALESCE(SUM(cantidad * precio), 0)::numeric(12,2) AS valor_inventario
       FROM productos`
  );
}

// Junta los 3 reportes en un solo objeto.
async function obtenerReportes() {
  const [stockBajo, topValor, resumen] = await Promise.all([
    consultaStockBajo(),
    consultaTopValor(),
    consultaResumen(),
  ]);
  return {
    stockBajo: stockBajo.rows,
    topValor: topValor.rows,
    resumen: resumen.rows[0],
  };
}

// ----------------------------------------------------------------------------
//  RUTA PRINCIPAL  ->  pagina web con los 3 reportes
// ----------------------------------------------------------------------------
app.get('/', async (req, res) => {
  try {
    const data = await obtenerReportes();
    res.render('reportes', data);
  } catch (err) {
    console.error('Error generando reportes:', err.message);
    res
      .status(500)
      .send('Error al conectar con la base de datos: ' + err.message);
  }
});

// ----------------------------------------------------------------------------
//  ENDPOINTS JSON  (utiles para probar con el navegador, curl o Postman)
// ----------------------------------------------------------------------------
app.get('/api/stock-bajo', async (req, res) => {
  try {
    const r = await consultaStockBajo();
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/top-valor', async (req, res) => {
  try {
    const r = await consultaTopValor();
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resumen', async (req, res) => {
  try {
    const r = await consultaResumen();
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------------
//  EXPORTAR CSV  ->  descarga un archivo con todos los productos y su valor
// ----------------------------------------------------------------------------
app.get('/export/csv', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, nombre, descripcion, cantidad, precio,
              (cantidad * precio) AS valor_total
         FROM productos
        ORDER BY valor_total DESC`
    );

    const encabezado = 'id,nombre,descripcion,cantidad,precio,valor_total';
    const filas = r.rows.map((p) => {
      // Encerramos texto entre comillas y escapamos comillas internas.
      const nombre = `"${String(p.nombre).replace(/"/g, '""')}"`;
      const desc = `"${String(p.descripcion || '').replace(/"/g, '""')}"`;
      return [p.id, nombre, desc, p.cantidad, p.precio, p.valor_total].join(',');
    });
    const csv = [encabezado, ...filas].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_inventario.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Error generando CSV:', err.message);
    res.status(500).send('Error generando CSV: ' + err.message);
  }
});

// --- Arranque ---
// 0.0.0.0 para que el servicio sea accesible desde fuera del contenedor.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio de reportes escuchando en http://0.0.0.0:${PORT}`);
});
