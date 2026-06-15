# Sistema de Inventario Distribuido — Estudiante 2 (Base de datos + Reportes)

Parte del proyecto de Sistemas Distribuidos. Este repositorio contiene los **dos
contenedores** que administra el Estudiante 2:

1. **`db`** — Base de datos **PostgreSQL** con datos persistentes (volumen) y un
   script de inicializacion que crea la tabla `productos`.
2. **`reportes`** — Servicio web que se conecta a la base por la **red interna de
   Docker** (por nombre de servicio) y genera reportes del inventario.

La aplicacion de inventario (Estudiante 1) corre en **otra maquina** y se conecta
a esta base de datos a traves de **Tailscale**.

---

## Arquitectura

```
   Maquina compañera (Est. 1)                 Tu maquina (Est. 2)
  ┌───────────────────────────┐              ┌──────────────────────────────┐
  │   App inventario           │              │  red interna Docker          │
  │   (Node/Express) :3000      │              │  ┌────────────────────────┐  │
  └──────────────┬─────────────┘              │  │ db (PostgreSQL) :5432   │  │
                 │                             │  │ volumen + init.sql      │  │
                 │   Tailscale (VPN)           │  └───────────┬────────────┘  │
                 └────────────────────────────┼──────────────┘  ▲            │
                       IP Tailscale : 5432     │                 │ por nombre │
                                               │  ┌──────────────┴─────────┐  │
                                               │  │ reportes :4000          │  │
                                               │  └────────────────────────┘  │
                                               └──────────────────────────────┘
```

- La app del Estudiante 1 llega a `db` **por la IP de Tailscale** + puerto 5432
  (el puerto esta publicado al host).
- El servicio `reportes` llega a `db` **por nombre de servicio** (`db`), porque
  comparten la red interna de Docker. No usa IP.

---

## Eleccion del motor de base de datos: PostgreSQL

Se eligio **PostgreSQL** por:

- La app del Estudiante 1 ya usa el driver `pg` (PostgreSQL) y el puerto `5432`,
  asi que mantiene la consistencia entre ambos servicios.
- Es relacional, ideal para datos estructurados de inventario (productos con
  campos fijos: nombre, cantidad, precio).
- Soporta agregaciones (`SUM`, `COUNT`, ordenamientos) que los reportes necesitan,
  directamente en SQL.
- Imagen oficial en Docker Hub con soporte nativo para scripts de inicializacion
  y volumenes de persistencia.

---

## Requisitos

- **Docker Desktop** instalado (incluye `docker` y `docker compose`).
  Descarga: https://www.docker.com/products/docker-desktop/

No necesitas instalar Node ni PostgreSQL en tu maquina: todo corre dentro de los
contenedores.

---

## Como correr el proyecto

Desde la carpeta del proyecto (donde esta `docker-compose.yml`):

```bash
docker compose up --build
```

Esto:
1. Crea la red interna `red-inventario`.
2. Levanta PostgreSQL, crea la base `inventario` y ejecuta `db/init.sql`
   (crea la tabla `productos` y carga datos de ejemplo).
3. Construye y levanta el servicio de reportes.

Luego abre en el navegador:

- **Reportes (web):** http://localhost:4000
- **Base de datos:** disponible en `localhost:5432`
  (usuario `admin`, contraseña `secreto`, base `inventario`)

Para apagar todo:

```bash
docker compose down
```

Para apagar **y borrar los datos** (resetear la base):

```bash
docker compose down -v
```

---

## Los reportes

El servicio `reportes` genera los tres reportes requeridos:

| Reporte | Que muestra |
|---|---|
| Bajo stock | Productos con menos de 5 unidades |
| Top 5 por valor | Los 5 productos con mayor `cantidad × precio` |
| Resumen | Total de productos y valor total del inventario |

Se pueden ver de tres formas:

- **Pagina web:** `http://localhost:4000/`
- **JSON:** `/api/stock-bajo`, `/api/top-valor`, `/api/resumen`
- **CSV descargable:** `/export/csv`

---

## Persistencia

Los datos se guardan en el volumen Docker `inventario-data`. Si reinicias el
contenedor de la base (`docker compose restart db`) los datos **se conservan**.
Solo se borran con `docker compose down -v`.

---

## Conectar la app del Estudiante 1 (Tailscale)

1. Instala Tailscale en tu maquina y en la de tu compañera, y entren a la misma
   red (tailnet): https://tailscale.com/download
2. Obten tu IP de Tailscale:
   ```bash
   tailscale ip -4
   ```
   (algo como `100.x.y.z`)
3. Tu compañera pone esa IP en el `.env` de SU app (ver `.env.example`):
   ```
   DB_HOST=100.x.y.z
   DB_PORT=5432
   DB_NAME=inventario
   DB_USER=admin
   DB_PASSWORD=secreto
   ```
4. Mientras tus contenedores esten levantados (`docker compose up`), su app se
   conecta a tu base por Tailscale.

---

## Estructura de archivos

```
inventario-distribuido/
├── docker-compose.yml        # orquesta los 2 contenedores + red + volumen
├── .env.example              # referencia para la app del Estudiante 1
├── db/
│   └── init.sql              # crea la tabla productos + datos de ejemplo
└── reportes/
    ├── Dockerfile            # imagen del servicio de reportes
    ├── package.json
    ├── server.js             # logica de los reportes (Express + pg)
    ├── public/
    │   └── style.css
    └── views/
        └── reportes.ejs      # pagina web de reportes
```
