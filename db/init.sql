-- Script de inicialización de la base de datos.
-- Postgres ejecuta automáticamente cualquier .sql que esté en
-- /docker-entrypoint-initdb.d la primera vez que se crea el volumen.

-- Tabla de productos con los campos mínimos que pide la tarea.
CREATE TABLE IF NOT EXISTS productos (
  id          SERIAL PRIMARY KEY,          -- id autoincremental
  nombre      VARCHAR(120) NOT NULL,
  descripcion TEXT,
  cantidad    INTEGER NOT NULL DEFAULT 0,  -- cantidad en stock
  precio      NUMERIC(10, 2) NOT NULL,     -- precio unitario
  categoria   VARCHAR(60) NOT NULL DEFAULT 'General'  -- categoria del producto
);

-- Productos de tecnología de ejemplo (para ver la app con datos).
-- Algunos con stock bajo (<5) a propósito, para que el reporte de
-- "bajo stock" de tu compañero tenga algo que mostrar.
INSERT INTO productos (nombre, descripcion, cantidad, precio, categoria) VALUES
  ('Laptop Lenovo IdeaPad 3',   'Ryzen 5, 16GB RAM, 512GB SSD',        12, 2499900.00, 'Computadoras'),
  ('Mouse Logitech M170',       'Inalámbrico, receptor USB',           40,   45900.00, 'Perifericos'),
  ('Teclado mecánico Redragon', 'Switch rojo, retroiluminado RGB',      8,  129900.00, 'Perifericos'),
  ('Monitor Samsung 24"',       'Full HD, 75Hz, panel IPS',             3,  579900.00, 'Monitores'),
  ('Audífonos Sony WH-1000XM4', 'Cancelación de ruido, Bluetooth',      2,  899900.00, 'Audio'),
  ('Disco SSD Kingston 1TB',    'NVMe M.2, lectura 3500MB/s',          25,  319900.00, 'Almacenamiento'),
  ('Webcam Logitech C920',      '1080p, micrófono integrado',           4,  249900.00, 'Perifericos'),
  ('Hub USB-C 7 en 1',          'HDMI, USB 3.0, lector SD',            15,  159900.00, 'Accesorios');
