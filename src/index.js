// punto de entrada de la aplicación de inventario .
const path = require('path');
// levanta el servidor Express, configura EJS como motor de vistas

const express = require('express');
require('dotenv').config();

// y monta las rutas de productos. toda la config sensible (IP de la base de datos, credenciales, puerto) se lee desde variables de entorno definidas en el archivo .env.
const productosRouter = require('./routes/productos');

const app = express();
const PORT = process.env.PORT || 3000;

// configuración de vistas (EJS) 
// las vistas viven en la carpeta /views (un nivel arriba de /src).
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// middlewares
// Para leer datos enviados desde formularios HTML (req.body).
app.use(express.urlencoded({ extended: true }));
// para aceptar también JSON (útil si se prueba con curl/Postman).
app.use(express.json());
// archivos estáticos (CSS, imágenes) desde /public.
app.use(express.static(path.join(__dirname, '..', 'public')));

// rutas 
// health check: confirma rápido que el contenedor está vivo.
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// todo lo relacionado con productos cuelga de /productos.
app.use('/productos', productosRouter);

// La raíz redirige al listado de productos.
app.get('/', (req, res) => res.redirect('/productos'));

// --- Arranque ---
// 0.0.0.0 hace que el servidor escuche en todas las interfaces de red,
// requisito para que sea accesible desde la red Tailscale (no solo localhost).
app.listen(PORT, '0.0.0.0', () => {
  console.log(`App de inventario escuchando en http://0.0.0.0:${PORT}`);
});
