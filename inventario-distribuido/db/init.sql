-- ============================================================================
--  init.sql  —  Se ejecuta AUTOMÁTICAMENTE la primera vez que arranca el
--  contenedor de PostgreSQL (Docker corre todo lo que esté en
--  /docker-entrypoint-initdb.d/ cuando el volumen está vacío).
--
--  Crea la tabla `productos` con el MISMO esquema que espera la app del
--  Estudiante 1 (columnas: id, nombre, descripcion, cantidad, precio).
--  Si cambias estos nombres, la app de tu compañera se rompe.
-- ============================================================================

CREATE TABLE IF NOT EXISTS productos (
  id          SERIAL        PRIMARY KEY,      -- la base genera el id sola
  nombre      VARCHAR(150)  NOT NULL,         -- obligatorio
  descripcion TEXT,                           -- opcional
  cantidad    INTEGER       NOT NULL DEFAULT 0,  -- stock (entero)
  precio      NUMERIC(10,2) NOT NULL DEFAULT 0   -- precio unitario (2 decimales)
);

-- ----------------------------------------------------------------------------
--  Datos de ejemplo para que los reportes muestren información desde el inicio.
--  (Pensados para que haya stock bajo, productos caros, etc.)
-- ----------------------------------------------------------------------------
INSERT INTO productos (nombre, descripcion, cantidad, precio) VALUES
  ('Teclado mecanico',  'Switches azules, retroiluminado',     12,  45.90),
  ('Mouse inalambrico', 'Ergonomico, 1600 DPI',                 3,  19.99),
  ('Monitor 24"',       'Full HD, 75Hz',                        8, 149.00),
  ('Laptop 14"',        'Core i5, 16GB RAM, 512GB SSD',         5, 820.00),
  ('Audifonos',         'Over-ear con cancelacion de ruido',    2,  89.50),
  ('Webcam 1080p',      'Con microfono integrado',              4,  35.00),
  ('Disco SSD 1TB',     'NVMe M.2',                            20,  74.25),
  ('Memoria RAM 8GB',   'DDR4 3200MHz',                         1,  28.75),
  ('Hub USB-C',         '7 puertos',                           15,  22.40),
  ('Cargador 65W',      'GaN, USB-C',                           6,  31.00);
