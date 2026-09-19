# Examen Práctico de JavaScript — Biblioteca Comunitaria 📚

## Contexto

Una biblioteca comunitaria quiere una web para que los vecinos consulten el catálogo de libros disponibles y soliciten préstamos. Tenés que completar el archivo `js/script.js` (el HTML y el CSS ya están armados) siguiendo las 5 entregas de abajo.

## Cómo levantar el proyecto

```
npm install
npm start          # levanta el server en http://localhost:3000
```

Abrí `index.html` con Live Server (no lo abras con doble click, falla el fetch por CORS).

## Endpoints del backend

| Método | Endpoint | Devuelve |
|---|---|---|
| GET | `/api/libros` | Array con todos los libros del catálogo |
| GET | `/api/generos` | Array de géneros disponibles (`{ id, nombre }`) |
| GET | `/api/libros/:id` | Un libro puntual por su ID numérico, con todos sus datos |

## Estructura de un libro (server/data/libros.json)

```json
{
  "id": 1,
  "titulo": "Cien Años de Soledad",
  "autor": "Gabriel García Márquez",
  "genero": "novela",
  "año": 1967,
  "paginas": 471,
  "copiasDisponibles": 3,
  "imagen": "...",
  "sinopsis": "...",
  "estanteria": "A-12"
}
```

## Elementos clave del DOM (ya están en el `index.html`)

- `#filtroGenero` — select de filtro por género
- `#catalogoGrid` — contenedor donde van las tarjetas de libros
- `#modalDetalle` / `#detalleContent` — modal con la ficha del libro
- `#formPrestamo`, `#inputNombreSolicitante`, `#inputDni`, `#btnConfirmarPrestamo`
- `#prestamosLista`, `#btnLimpiarPrestamos`

## Tabla de Entregas

| # | Commit sugerido | Tarea a realizar |
|---|---|---|
| 1 | `feat(html): vincular css y script js al html` | Vincular `css/styles.css` y `js/script.js` en el `index.html` |
| 2 | `feat(js): consumir api de libros con fetch y async await` | Traer `libros` y `generos` del backend con `fetch`/`async-await`, con `try/catch` |
| 3 | `feat(js): renderizar tarjetas de libros y filtros en el dom` | Pintar las tarjetas en `#catalogoGrid` y poblar `#filtroGenero` |
| 4 | `feat(js): implementar filtrado y ficha de prestamo` | Al cambiar `#filtroGenero`, filtrar las tarjetas mostradas. Al hacer click en una tarjeta, abrir el modal con la ficha completa del libro |
| 5 | `feat(js): persistir y gestionar prestamos en localstorage` | Al enviar `#formPrestamo`, guardar la solicitud en `localStorage` y listarla en `#prestamosLista` |

## Almacenamiento Local

- Clave: `biblioteca_prestamos`
- Estructura: Arreglo de objetos con `{ id, tituloLibro, genero, solicitante, dni, fecha }`

## Notas

- No hay input de búsqueda de texto en este examen — solo el filtro por género.
- No hay cálculo de cantidad/precio — es préstamo, no compra.
- El botón "Limpiar Historial" vacía todos los préstamos guardados.
