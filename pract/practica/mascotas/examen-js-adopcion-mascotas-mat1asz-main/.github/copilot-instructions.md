# Contexto para GitHub Copilot — Parciales JS UCSE-DASS

## Sobre este proyecto

Este es un parcial práctico de "Programación II" (frontend vanilla JS + Express local en puerto 3000). No es un proyecto de producción, es un examen de ~90 min donde el archivo objetivo es `js/script.js`.

El código se escribe **paso por paso**, siguiendo una plantilla mental fija de 13 o 16 pasos según la familia. Cuando yo estoy escribiendo el paso N, ya tengo escritos los pasos anteriores en el mismo archivo — usá esos pasos previos como pista de qué patrón sigo.

## Reglas de estilo global

- Idioma: **español**. Nombres de variables, funciones, clases y comentarios en español, camelCase.
- Comillas: **simples** (`'texto'`), nunca dobles ni backticks salvo template strings.
- Async: siempre `async/await`, NUNCA `.then()`.
- Sin frameworks: JS vanilla puro, sin React/Vue/jQuery.
- Sin `let` cuando puede ser `const`. Las variables de estado global son `let` (porque se reasignan en `iniciar()`), el resto `const`.
- Siempre `evento.preventDefault()` como PRIMERA línea de cualquier `submit`.
- Nunca poner listeners de click en elementos generados dinámicamente — siempre en el contenedor padre, con **delegación de eventos** (`evento.target.classList.contains(...)`).

## Los dos tipos de examen (familias)

Detectá cuál es por los primeros pasos que ya escribí:

### Familia A — Catálogo + Filtro + Modal + Form + localStorage
Señales: hay `catalogoGrid`, `modalDetalle`, `formX`, `filtroX`, `inputBusqueda`, `historialLista`/`solicitudesLista`/`pedidosLista`/`favoritosLista`.
Ejemplos conocidos: Cafetería, Eventos, Adopción de Mascotas, GameHub.

### Familia B — Quiz / Adivinanza / Puntaje
Señales: hay `puntaje`, `feedback`, `scoreDisplay`, `btnNuevo`/`btnJugar`/`btnSiguiente`, `preguntaTexto` o `characterImage`/`pokemonSprite`.
Ejemplos conocidos: Trivia, Dragon Ball, Pokémon, Clima en Vivo.

---

## PATRONES TRANSVERSALES (las dos familias)

### Fetch de LISTA (array)
Estructura fija. Nombre siempre `obtener<PluralDelRecurso>()`. En el `catch` SIEMPRE `return []`, NUNCA `return null`.

```js
async function obtenerAnimales() {
  try {
    const respuesta = await fetch(`${API_URL}/animales`);
    if (!respuesta.ok) throw new Error('No se pudo obtener los animales');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}
```

### Fetch de UN elemento (objeto único, típicamente `/endpoint/:id`)
Nombre `obtenerPorId(id)` o `obtenerXPorId(id)`. En el `catch` SIEMPRE `return null`, NUNCA `return []`.

```js
async function obtenerPorId(id) {
  try {
    const respuesta = await fetch(`${API_URL}/animales/${id}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el elemento por id');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

### Fetch con query params opcionales (`?campo=valor`)
Cuando el README documenta `GET /api/x?param1=...&param2=...`, usar `URLSearchParams` (nunca concatenar `?` y `&` a mano):

```js
async function obtenerAnimalesFiltrados(especie, edad, refugio) {
  try {
    const params = new URLSearchParams();
    if (especie) params.append('especie', especie);
    if (edad) params.append('edad', edad);
    if (refugio) params.append('refugio', refugio);

    const respuesta = await fetch(`${API_URL}/animales?${params.toString()}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener animales filtrados');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}
```

Cada `if (param) params.append(...)` DEBE tener el nombre del query param **literalmente** como lo escribe el README (`'especie'`, `'edad'`, `'refugio'`, no inventar).

### Configuración estándar
```js
const API_URL = 'http://localhost:3000/api';
const CLAVE_STORAGE = 'clave_del_readme'; // TEXTO LITERAL del README, respetando mayúsculas y guiones bajos
```

### localStorage — leer, guardar, limpiar
Bloque NUNCA CAMBIA:
```js
function leerHistorial() {
  const dato = localStorage.getItem(CLAVE_STORAGE);
  return dato ? JSON.parse(dato) : [];
}

function guardarEnHistorial(entrada) {
  historial.push(entrada);
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
}
```

Botón limpiar en Familia A: solo resetea `historial`.
Botón limpiar en Familia B: resetea `historial` Y `puntaje` juntos, y actualiza el DOM del score.

### Renderizar un `<select>` desde un array
NUNCA CAMBIA — SIEMPRE `innerHTML = ''` primero para no duplicar options hardcodeadas del HTML:

```js
function renderizarSelectArray(lista, elementoSelect) {
  if (!lista) return;
  elementoSelect.innerHTML = '';
  lista.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.nombre;
    elementoSelect.appendChild(option);
  });
}
```

Si el array es de strings puros (no objetos), usar `option.value = cat` y `option.textContent = cat`. Si son objetos, usar `.id` y `.nombre` (VERIFICAR contra el JSON real de `server/data/*.json`).

### Delegación de eventos para clicks en tarjetas dinámicas
NUNCA poner `addEventListener` sobre cada tarjeta generada — SIEMPRE sobre el contenedor padre:

```js
catalogoGrid.addEventListener('click', async (evento) => {
  if (evento.target.classList.contains('btn-adoptar')) { // clase del botón inventada por mí en la tarjeta
    const id = evento.target.dataset.id;
    const item = await obtenerPorId(id);
    elementoActual = item;
    // renderizar el modal usando item.*, después modalDetalle.classList.remove('hidden')
  }
});
```

La clase del botón (`btn-adoptar`, `btn-comprar`, `btn-ordenar`) es un **gancho para JS**, no necesita existir en el CSS. Sí necesita estar en el `class="..."` del botón de la tarjeta (Paso 7), y coincidir letra por letra con lo que ponés en el `classList.contains(...)`.

### Cerrar modal — NUNCA CAMBIA
Es 100% genérico, sirve para cualquier examen con modales:
```js
document.querySelectorAll('.cerrar-modal').forEach((boton) => {
  boton.addEventListener('click', () => {
    boton.closest('.modal').classList.add('hidden');
  });
});
```

---

## FAMILIA A — 16 PASOS

### Estado global (siempre `let`, siempre arrays vacíos o null)
Contar los `let` así:
- Uno por cada endpoint que devuelve LISTA (excluyendo `/:id` y excluyendo variantes con query params del mismo endpoint).
- SIEMPRE `let historial = []` aparte, independiente de si hay endpoint o no.
- SIEMPRE `let elementoActual = null` (guarda el objeto abierto en el modal).

Ejemplo Adopción (3 endpoints de lista `/animales`, `/refugios`, `/especies`, `/edades`):
```js
let animales = [];
let refugios = [];
let especies = [];
let edades = [];
let historial = [];
let elementoActual = null;
```

### Paso 1 — Referencias al DOM (todas las `const` juntas al inicio)
Copiar CADA `id="..."` del `index.html` a un `const` con el mismo nombre. Convención de nombres:
- `filtroX` para selects de filtro
- `inputBusqueda` para input de texto de búsqueda
- `catalogoGrid` / `xGrid` para el contenedor de tarjetas
- `modalX` para modales
- `detalleContent` / `xContent` para el contenido del modal
- `formX` para formularios
- `btnX` para botones
- `xLista` / `xListado` para listas del historial

### Paso 3 — Un `obtenerX()` por cada catálogo
Repetir la estructura de "Fetch de LISTA" arriba, una vez por catálogo.

### Paso 4 — `obtenerPorId(id)` con el endpoint del catálogo principal
El `${API_URL}/xxx/${id}` usa el endpoint del catálogo PRINCIPAL (ej. `/animales/${id}`, no `/refugios/${id}`).

### Paso 7 — Tarjeta del catálogo
Función `crearTarjeta<Singular>(item)` que devuelve un template string, y función `renderizar<Plural>(lista)` que hace `innerHTML = ''` y `.forEach` sumando cada tarjeta.

Para armar el HTML de la tarjeta:
1. Buscar en `index.html` si hay un bloque `<!-- comentario -->` con el HTML modelo — si existe, copiarlo tal cual reemplazando la variable de ejemplo por `item`.
2. Si NO hay bloque comentado, armar la tarjeta cruzando 3 fuentes:
   - **README**: qué datos hay que mostrar (nombre, raza, edad, etc.)
   - **CSS** (`css/styles.css`): qué clases existen (`.animal-card`, `.card-image`, `.card-title`, `.card-body`, `.card-shelter`, `.tag`, `.btn-primary`, etc.)
   - **JSON** (`server/data/*.json`): nombres EXACTOS de campo (`item.nombre`, `item.imagen`, no `item.foto`)

Nombres típicos de campo en tarjetas: `nombre`, `imagen`, `descripcion`, `precio`, `especie`, `raza`, `edad`, `refugio`, `temperamento` (array). Para arrays de texto renderizados como tags, usar `.map(t => `<span class="tag">${t}</span>`).join('')`.

El botón de acción SIEMPRE debe llevar `data-id="${item.id}"` para que el Paso 9 lo pueda leer.

### Paso 8 — Filtro combinado
Contar los selects reales del HTML (mirar Paso 1) — puede haber 1, 2, o 3. Fórmula fija por cada select:
```
const coincideX = filtroXValor === '' || item.campoX === filtroXValor;
```
Para búsqueda de texto:
```
const coincideTexto = item.nombre.toLowerCase().includes(textoBuscado) || item.raza.toLowerCase().includes(textoBuscado);
```
El README dice EXACTAMENTE en qué campos buscar (nombre, raza, título, artista, etc.) — puede ser 1 o varios con `||`.

Combinar todo con `&&` dentro de UN `.filter()`, terminar con `renderizar<Plural>(listaFiltrada)`.

Los `addEventListener('change', aplicarFiltros)` van UNO POR CADA SELECT + un `addEventListener('input', aplicarFiltros)` para el input de texto.

### Paso 9 — Delegación de eventos + apertura del modal
Ver "Delegación de eventos" arriba. Después de llenar `elementoActual`, armar `detalleContent.innerHTML = `template``:
- Usar clases CSS del proyecto (buscar `.detail-header-info`, `.detail-img`, `.detail-meta-grid`, `.detail-meta-item`, `.detail-history` en el CSS).
- Los campos del objeto de `/:id` pueden incluir MÁS datos que el objeto de la lista — por ejemplo `datosRefugio` (objeto anidado) que solo aparece en `/animales/:id`. Verificar con el `server.js` y el JSON.
- Booleanos (`vacunas: true`) mostrar como `${item.vacunas ? 'Sí' : 'No'}`, nunca `${item.vacunas}` (mostraría "true"/"false").
- Arrays de texto en el modal: `.join(', ')` (a diferencia de la tarjeta que usaba `.map`), porque en el modal se muestran como texto plano dentro de un `<p>`.

### Paso 11 — Cálculo dinámico (SOLO exámenes de compra/pedido)
Se BORRA si el examen no tiene cantidad × precio (ej. Adopción, GameHub sin cálculo). Cuando aplica:
```js
inputCantidad.addEventListener('input', () => {
  if (!elementoActual) return;
  const total = elementoActual.precio * Number(inputCantidad.value);
  totalCalculado.textContent = `$${total}`;
});
```

### Paso 13 — Renderizar historial (Familia A)
Los campos del `entrada.X` deben coincidir EXACTAMENTE con los que armaste en el Paso 14 al hacer `guardarEnHistorial(nuevaEntrada)`.

### Paso 14 — Submit del formulario (VARIANTE A)
Se usa cuando el README pide un `<form>` con datos del comprador/adoptante/cliente. El objeto `nuevaEntrada` combina:
- Campos generados: `id: Date.now()`, `fecha: new Date().toLocaleString('es-AR')`
- Campos del animal/producto que está en el modal: `elementoActual.id`, `elementoActual.nombre`, `elementoActual.especie` (etc.)
- Campos del formulario: `inputX.value`, `selectX.value`

La estructura EXACTA del objeto debe copiar el ejemplo del README (sección "Almacenamiento Local" / "localStorage").

Después de guardar: `modalX.classList.add('hidden')` + `formX.reset()`.

### Paso 14 — Toggle favorito (VARIANTE B — GameHub sin formulario)
```js
function toggleFavorito(item) {
  const yaExiste = historial.some((fav) => fav.id === item.id);
  if (yaExiste) {
    historial = historial.filter((fav) => fav.id !== item.id);
  } else {
    historial.push({ id: item.id, nombre: item.nombre, fecha: new Date().toLocaleString('es-AR') });
  }
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
  renderizarHistorial();
}
```

### Paso 16 — Inicialización — ORDEN FIJO
```js
async function iniciar() {
  historial = leerHistorial();

  // fetch de TODOS los catálogos
  animales = await obtenerAnimales();
  especies = await obtenerEspecies();
  refugios = await obtenerRefugios();
  edades = await obtenerEdades();

  // render inicial del catálogo principal
  renderizarAnimales(animales);

  // llenar CADA select con SU catálogo correspondiente (la raíz de palabra debe rimar)
  renderizarSelectArray(especies, filtroEspecie);
  renderizarSelectArray(edades, filtroEdad);
  renderizarSelectArray(refugios, filtroRefugio);

  renderizarHistorial();
}

iniciar();
```

---

## FAMILIA B — 13 PASOS

### Estado global
```js
let elementoActual = null;
let puntaje = 0;
let historial = [];
```

### Paso 4 — Fetch de UN elemento (dos variantes posibles)
**Variante A — query string (elemento aleatorio, opcionalmente filtrado):**
```js
async function obtenerElementoAleatorio(filtro) {
  try {
    const query = filtro ? `?categoria=${filtro}&random=true` : '?random=true';
    const respuesta = await fetch(`${API_URL}/endpoint${query}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el elemento');
    return await respuesta.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

**Variante B — path param (elemento específico por id o nombre):**
```js
async function obtenerElementoPorId(idONombre) {
  try {
    const respuesta = await fetch(`${API_URL}/endpoint/${idONombre}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el elemento');
    return await respuesta.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
```

Ambas devuelven `null` en catch (objeto único, no lista).

### Paso 7 — Renderizar elemento (dos variantes según tipo visual)
**Trivia (texto + botones de opciones):**
```js
preguntaTexto.textContent = datos.pregunta;
opcionesContainer.innerHTML = '';
datos.opciones.forEach((opcion, indice) => {
  const btn = document.createElement('button');
  btn.textContent = opcion;
  btn.addEventListener('click', () => validarRespuestaPorIndice(indice));
  opcionesContainer.appendChild(btn);
});
```

**Dragon Ball / Pokémon (imagen silueteada):**
```js
imagenElemento.src = datos.imagen;
imagenElemento.classList.add('silueta');
```

Al final SIEMPRE:
```js
tarjeta.classList.remove('hidden');
feedback.textContent = '';
```

### Paso 8 — Validación de respuesta
**Por índice (Trivia — click en botón):**
```js
function validarRespuestaPorIndice(indiceElegido) {
  const esCorrecta = indiceElegido === elementoActual.respuestaCorrecta;
  procesarResultado(esCorrecta);
}
```

**Por texto libre (Dragon Ball / Pokémon — form submit):** SIEMPRE normalizar los DOS lados con `.toLowerCase().trim()`:
```js
function validarRespuestaPorTexto() {
  const respuestaUsuario = inputRespuesta.value.toLowerCase().trim();
  const respuestaCorrecta = elementoActual.nombre.toLowerCase().trim();
  const esCorrecta = respuestaUsuario === respuestaCorrecta;
  procesarResultado(esCorrecta);
}
```

### `procesarResultado(esCorrecta)` — NUNCA CAMBIA la estructura
`guardarEnHistorial()` va FUERA del `if/else` — se llama SIEMPRE, acierte o no. Nunca solo dentro de la rama "correcto".
```js
function procesarResultado(esCorrecta) {
  if (esCorrecta) {
    puntaje += 10; // valor puede variar según README
    feedback.textContent = '¡Correcto! 🎉';
  } else {
    feedback.textContent = 'Incorrecto 😞';
  }
  scoreDisplay.textContent = puntaje;

  guardarEnHistorial({
    pregunta: elementoActual.nombre || elementoActual.pregunta,
    correcta: esCorrecta,
    score: puntaje,
    fecha: new Date().toLocaleString('es-AR'),
  });
  renderizarHistorial();
}
```

### Paso 13 — Inicialización (Familia B)
```js
async function iniciar() {
  historial = leerHistorial();

  // recuperar puntaje SOLO si el README lo pide explícitamente
  if (historial.length > 0) {
    puntaje = historial[historial.length - 1].score;
    scoreDisplay.textContent = puntaje;
  }

  renderizarHistorial();
  const categorias = await obtenerCategorias();
  renderizarSelectorCategorias(categorias);
  const primerElemento = await obtenerElementoAleatorio();
  renderizarElemento(primerElemento);
}

iniciar();
```

---

## ERRORES RECURRENTES A DETECTAR Y CORREGIR

Si veo alguno de estos patrones en el código, corregir automáticamente o sugerir el fix:

### 1. `return null` donde va `return []` (y viceversa)
- Si la función se llama `obtener<Plural>` → catch debe devolver `[]`
- Si la función se llama `obtenerPorId` / `obtenerElementoAleatorio` / `obtenerElementoPorId` → catch debe devolver `null`

### 2. Comparación string vs número en filtros
`elementoSelect.value` SIEMPRE devuelve string. Si el campo del objeto es número (típico: `refugioId: 1`, `id: 3`), hay que convertir:
```js
// MAL: item.refugioId === filtroRefugioValor    // "1" === 1 → false SIEMPRE
// BIEN:
const coincideRefugio = filtroRefugioValor === '' || item.refugioId === Number(filtroRefugioValor);
```

### 3. `refugio` vs `refugioId` (o cualquier "nombre vs id")
Los objetos suelen traer AMBOS: `refugio: "Patitas del Sol"` (string, para mostrar) y `refugioId: 1` (número, para filtrar/relacionar). En la tarjeta usar `refugio` (texto), en el filtro usar `refugioId` (id).

### 4. Typos plural/singular
Los más comunes: `crearTarjetaAnimales` (plural, mal) vs `crearTarjetaAnimal` (singular, bien). `renderizarCategoria` (singular, mal) vs `renderizarCategorias` (plural, bien). Regla: `crearTarjeta<Singular>` (crea UNA tarjeta), `renderizar<Plural>` (recorre TODAS).

### 5. Función duplicada
Si aparece dos veces la misma `async function obtenerX()`, la segunda pisa a la primera y el linter da error. Borrar la duplicada.

### 6. `let historial` faltante
Si veo `historial.push(...)`, `historial.forEach(...)` o `historial = leerHistorial()` sin la declaración `let historial = []` al principio del archivo, agregarla.

### 7. Botón de acción sin `data-id`
Todo botón dentro de una tarjeta que abra el modal debe tener `data-id="${item.id}"` — si falta, `evento.target.dataset.id` va a dar `undefined`.

### 8. Cruzar catálogos con selects
Regla mnemónica: nombre del catálogo (plural) y nombre del select (singular con "filtro") tienen que RIMAR:
- `especies` ↔ `filtroEspecie` ✓
- `edades` ↔ `filtroEdad` ✓
- `refugios` ↔ `filtroRefugio` ✓
- `especies` ↔ `filtroEdad` ✗ (cruzado, mal)

### 9. Falta `innerHTML = ''` antes de renderizar un `<select>`
Si no se limpia, cada llamada duplica las options hardcodeadas del HTML original.

### 10. Nombres de campo inventados
Los nombres de campo del `item` (`item.nombre`, `item.raza`, `item.imagen`) SIEMPRE deben verificarse contra `server/data/*.json` — NUNCA asumir de memoria por parecido a otro examen.

### 11. `evento.preventDefault()` faltante en submit
En cualquier `formX.addEventListener('submit', ...)`, la primera línea debe ser `evento.preventDefault()`, si no la página se recarga y se pierde el estado.

### 12. Listeners sobre elementos dinámicos
Si veo `.forEach((item) => { crearBoton.addEventListener('click', ...) })` sobre tarjetas del catálogo — mal, usar delegación en el contenedor padre.

### 13. Comparación de texto sin normalizar (Familia B)
En quiz de texto libre, si comparo `input.value === elemento.nombre` sin `.toLowerCase().trim()` en AMBOS lados, "Goku" nunca va a matchear con "goku".

### 14. Botón limpiar de Familia B que solo limpia historial
En Familia B, `btnLimpiar` debe resetear `historial`, `puntaje` Y actualizar `scoreDisplay.textContent = 0`. Si solo hace `historial = []`, falta lo demás.

### 15. Falta `.map(...).join('')` en template strings con arrays
Si un campo es array (`item.temperamento = ["Juguetón", "Sociable"]`) y aparece como `${item.temperamento}` en un template, se renderiza mal (se ve la coma automática de Array.toString()). Debe ser `${item.temperamento.map(t => `<span class="tag">${t}</span>`).join('')}` en tarjetas, o `${item.temperamento.join(', ')}` para texto plano en modal.

---

## ANTI-PATRONES (NUNCA sugerir esto)

- ❌ `document.querySelector('.animal-card').addEventListener(...)` para tarjetas generadas dinámicamente
- ❌ `.then().catch()` en vez de `async/await + try/catch`
- ❌ `fetch(url).then(r => r.json()).then(datos => ...)`
- ❌ Concatenar query params a mano: `` `?param1=${a}&param2=${b}` `` — usar `URLSearchParams`
- ❌ `var` — usar `const` o `let`
- ❌ `innerHTML +=` en loops muy grandes sin `innerHTML = ''` previo (dobla el DOM)
- ❌ Guardar en historial DENTRO del if de "acierto" — va SIEMPRE afuera
- ❌ Crear una función `obtenerX()` sin `try/catch`
- ❌ Retornar `undefined` implícitamente en el catch (sin `return` explícito)
- ❌ Poner el `iniciar()` al inicio del archivo — SIEMPRE al final
- ❌ Poner `const` para variables que se reasignan en `iniciar()` (deben ser `let`)
- ❌ Frameworks (React, Vue, jQuery) — es vanilla puro
- ❌ Importar módulos con `import` — todo en un solo archivo, sin `type="module"`
- ❌ `localStorage.setItem(clave, objeto)` sin `JSON.stringify()` — siempre stringify al guardar y parse al leer
