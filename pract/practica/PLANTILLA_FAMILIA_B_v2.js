/* ============================================================
   PLANTILLA FAMILIA B — QUIZ / ADIVINANZA
   v2 — mismo criterio que la Familia A v2: menos "pensar",
   más fórmula fija + checklist de qué dato buscar y dónde.
   Sirve para: Clima en Vivo, Trivia, Dragon Ball, Pokémon,
   y cualquier examen "mostrar algo + adivinar/responder +
   sumar puntaje + historial".

   CÓMO USARLA EL DÍA DEL EXAMEN:
   1. Leer el README completo primero y ubicar en la Tabla de
      Variantes (al final del archivo) cuál de las dos formas
      de responder usa ESTE examen: click en opción (Trivia) o
      texto libre (Dragon Ball / Pokémon).
   2. Ctrl+F "__" y reemplazar cada placeholder por el dato real.
   3. Borrar TODA la variante que no se usa (no dejarla comentada
      "por las dudas" — genera confusión y variables sin usar).
   4. Al final, Ctrl+F "__" de nuevo para confirmar que no quedó
      ningún placeholder sin reemplazar.
   ============================================================ */

// ==================== PASO 1 — Referencias al DOM ====================
// ↓ CAMBIA: copiar id="..." REALES del index.html
const __SELECT_FILTRO__ = document.getElementById("__id-select-categoria__"); // ej: sagaSelector, generationSelector, filtroCategoria
const __BTN_NUEVO__ = document.getElementById("__id-btn-nuevo__"); // ej: btnNuevo, btnJugar, btnSiguiente

const __TARJETA__ = document.getElementById("__id-tarjeta__"); // el contenedor que usa .hidden para mostrar/ocultar la pregunta
const __TEXTO_PRINCIPAL__ = document.getElementById("__id-texto-o-imagen__"); // ej: preguntaTexto (Trivia) O characterImage/pokemonSprite (imagen)
const __OPCIONES_CONTAINER__ = document.getElementById("__id-opciones__"); // SOLO Variante A (Trivia) — si no aplica, borrar
const __INPUT_RESPUESTA__ = document.getElementById("__id-input-respuesta__"); // SOLO Variante B (texto libre) — si no aplica, borrar
const __FORM_RESPUESTA__ = document.getElementById("__id-form__"); // SOLO si la respuesta se manda con submit, no con click directo

const __FEEDBACK__ = document.getElementById("__id-feedback__");
const __SCORE__ = document.getElementById("__id-score__");

const __HISTORIAL_LISTA__ = document.getElementById("__id-historial__");
const __BTN_LIMPIAR__ = document.getElementById("__id-btn-limpiar__");

// ==================== ESTADO GLOBAL ====================
// NUNCA CAMBIA el patrón — SOLO renombrar si hace falta
let elementoActual = null; // la pregunta/personaje/pokemon que está en pantalla ahora
let puntaje = 0;
let historial = []; // SIEMPRE []

// ==================== PASO 2 — Configuración ====================
const API_URL = "http://localhost:3000/api"; // ↓ CAMBIA el puerto si el README dice otro
const CLAVE_STORAGE = "__clave_exacta_del_readme__"; // ↓ CAMBIA, TAL CUAL del README (comillas y mayúsculas)

// ==================== PASO 3 — Fetch de LISTA (categorías/sagas/generaciones) ====================
// NUNCA CAMBIA la estructura. ↓ CAMBIA: endpoint.
async function obtenerCategorias() {
  try {
    const respuesta = await fetch(`${API_URL}/__endpoint_categorias__`);
    if (!respuesta.ok) throw new Error("No se pudieron obtener las categorías");
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return []; // SIEMPRE [] — es una lista
  }
}

// ==================== PASO 4 — Fetch de UN elemento ====================
// ⚠ Revisar el README: puede venir con query string, con path param,
//   o con las DOS variantes en el mismo examen (pasó en Pokémon).
//   Borrar la que no se use.

// VARIANTE A — query string (traer uno al azar, opcionalmente filtrado)
async function obtenerElementoAleatorio(filtro) {
  try {
    const query = filtro ? `?categoria=${filtro}&random=true` : "?random=true"; // ↓ CAMBIA el nombre del query param si el README usa otro
    const respuesta = await fetch(`${API_URL}/__endpoint_elemento__${query}`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el elemento");
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null; // SIEMPRE null — es UN objeto, no una lista
  }
}

// VARIANTE B — path param (traer uno específico por id o nombre)
async function obtenerElementoPorId(idONombre) {
  try {
    const respuesta = await fetch(`${API_URL}/__endpoint_elemento__/${idONombre}`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el elemento");
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ==================== PASO 5 — Helper de mensajes ====================
// NUNCA CAMBIA
function mostrarMensaje(texto) {
  alert(texto);
}

// ==================== PASO 6 — Renderizar el <select> de categorías ====================
// NUNCA CAMBIA: limpiar antes de llenar, para no duplicar options hardcodeadas.
function renderizarSelectorCategorias(categorias) {
  if (!categorias) return;
  __SELECT_FILTRO__.innerHTML = "";
  categorias.forEach((cat) => {
    const option = document.createElement("option");
    // ↓ CAMBIA según el JSON real:
    // si categorias es array de STRINGS ["pop","rock"] → usar "cat" directo (value=cat, textContent=cat)
    // si categorias es array de OBJETOS [{id,nombre}] → usar cat.id / cat.nombre
    option.value = cat.id ?? cat; // funciona para los dos casos, pero VERIFICAR con el JSON real
    option.textContent = cat.nombre ?? cat;
    __SELECT_FILTRO__.appendChild(option);
  });
}

// ==================== PASO 7 — Renderizar el elemento (pregunta/imagen) ====================
// ↓ CAMBIA: qué campos tiene el objeto — mirar el JSON real de datos, NUNCA el README a ojo.
function renderizarElemento(datos) {
  if (!datos) return;
  elementoActual = datos;

  // VARIANTE imagen (Dragon Ball / Pokémon) — descomentar y adaptar, borrar la otra:
  // __TEXTO_PRINCIPAL__.src = datos.imagen;
  // __TEXTO_PRINCIPAL__.classList.add("silueta"); // arranca oculto/silueteado hasta acertar

  // VARIANTE texto con opciones (Trivia) — descomentar y adaptar, borrar la otra:
  // __TEXTO_PRINCIPAL__.textContent = datos.pregunta;
  // __OPCIONES_CONTAINER__.innerHTML = "";
  // datos.opciones.forEach((opcion, indice) => {
  //   const btn = document.createElement("button");
  //   btn.textContent = opcion;
  //   btn.addEventListener("click", () => validarRespuestaPorIndice(indice));
  //   __OPCIONES_CONTAINER__.appendChild(btn);
  // });

  __TARJETA__.classList.remove("hidden"); // NUNCA CAMBIA
  __FEEDBACK__.textContent = ""; // limpiar feedback anterior
}

// ==================== PASO 8 — Validar respuesta + sumar puntaje ====================
// FÓRMULA FIJA — elegir UNA variante según cómo responde el usuario:

// VARIANTE A — respuesta por click en opción (Trivia): compara ÍNDICES, no texto
function validarRespuestaPorIndice(indiceElegido) {
  const esCorrecta = indiceElegido === elementoActual.respuestaCorrecta; // ↓ CAMBIA el nombre del campo si no es "respuestaCorrecta"
  procesarResultado(esCorrecta);
}

// VARIANTE B — respuesta por texto libre (Dragon Ball/Pokémon): SIEMPRE normalizar los DOS lados
// Por qué toLowerCase().trim() en AMBOS lados: el usuario puede escribir con
// mayúsculas distintas o espacios de más ("  Goku ", "GOKU", "goku" tienen
// que dar todas "correcto"), y el dato que viene del server también puede
// traer mayúsculas que no coincidan exactas con lo que el usuario tipeó.
// Si solo normalizás un lado, "Goku" (server) vs "goku" (usuario) da FALSO
// aunque sea la respuesta correcta.
function validarRespuestaPorTexto() {
  const respuestaUsuario = __INPUT_RESPUESTA__.value.toLowerCase().trim();
  const respuestaCorrecta = elementoActual.nombre.toLowerCase().trim(); // ↓ CAMBIA el campo si no se llama "nombre"
  const esCorrecta = respuestaUsuario === respuestaCorrecta;
  procesarResultado(esCorrecta);
}

// NUNCA CAMBIA: guardarEnHistorial() se llama SIEMPRE, acierte o no,
// FUERA del if/else — nunca solo dentro de la rama "correcto".
function procesarResultado(esCorrecta) {
  if (esCorrecta) {
    puntaje += 10; // ↓ CAMBIA el valor de puntos si el README especifica otro
    __FEEDBACK__.textContent = "¡Correcto! 🎉";
    // __TEXTO_PRINCIPAL__.classList.remove("silueta"); // si es imagen, revelarla al acertar
  } else {
    __FEEDBACK__.textContent = "Incorrecto 😞";
  }
  __SCORE__.textContent = puntaje;

  guardarEnHistorial({
    // ↓ CAMBIA: campos exactos que pide el README para el historial
    pregunta: elementoActual.nombre || elementoActual.pregunta,
    correcta: esCorrecta,
    score: puntaje,
    fecha: new Date().toLocaleString("es-AR"),
  });
  renderizarHistorial();
}

// Conectar la validación con el evento correspondiente — elegir UNO:

// Si la respuesta es con click en botones (Variante A), ya se conecta
// dentro de renderizarElemento() con el addEventListener de cada botón.

// Si la respuesta es con FORM/submit (Variante B):
if (__FORM_RESPUESTA__) {
  __FORM_RESPUESTA__.addEventListener("submit", (evento) => {
    evento.preventDefault(); // NUNCA CAMBIA
    validarRespuestaPorTexto();
  });
}

// ==================== PASO 9 — localStorage ====================
// NUNCA CAMBIA
function leerHistorial() {
  const dato = localStorage.getItem(CLAVE_STORAGE);
  return dato ? JSON.parse(dato) : [];
}

function guardarEnHistorial(entrada) {
  historial.push(entrada);
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
}

// ==================== PASO 10 — Renderizar historial ====================
// ↓ CAMBIA: elegir UNA variante según lo que pida el CSS/README, borrar la otra

// VARIANTE <li> — historiales simples de lista
function renderizarHistorial() {
  __HISTORIAL_LISTA__.innerHTML = "";
  historial.forEach((entrada) => {
    const li = document.createElement("li");
    li.textContent = `${entrada.pregunta} — ${entrada.correcta ? "Acierto" : "Error"} (${entrada.fecha})`;
    __HISTORIAL_LISTA__.appendChild(li);
  });
}

// VARIANTE <div> + clases CSS — cuando el examen define estilo de "tarjeta" por entrada
// function renderizarHistorial() {
//   __HISTORIAL_LISTA__.innerHTML = "";
//   historial.forEach((entrada) => {
//     __HISTORIAL_LISTA__.innerHTML += `
//       <div class="__clase-css-entrada__">
//         ${entrada.pregunta} — ${entrada.correcta ? "Acierto" : "Error"} (${entrada.fecha})
//       </div>
//     `;
//   });
// }

// ==================== PASO 11 — Botón limpiar historial ====================
// NUNCA CAMBIA: resetea AMBAS cosas — historial Y puntaje juntos, no solo el historial.
__BTN_LIMPIAR__.addEventListener("click", () => {
  historial = [];
  puntaje = 0;
  localStorage.removeItem(CLAVE_STORAGE);
  __SCORE__.textContent = puntaje;
  renderizarHistorial();
});

// ==================== PASO 12 — Botón "nuevo elemento" / "jugar de nuevo" ====================
// NUNCA CAMBIA el patrón
__BTN_NUEVO__.addEventListener("click", async () => {
  const filtro = __SELECT_FILTRO__.value;
  const nuevoElemento = await obtenerElementoAleatorio(filtro); // ↓ CAMBIA si el examen usa obtenerElementoPorId en su lugar
  renderizarElemento(nuevoElemento);
});

// ==================== Modales (OPCIONAL — solo si el examen tiene) ====================
// NUNCA CAMBIA — genérico, sirve para cualquier cantidad de modales.
// Borrar este bloque completo si el examen no tiene modales.
document.querySelectorAll(".cerrar-modal").forEach((boton) => {
  boton.addEventListener("click", () => {
    boton.closest(".modal").classList.add("hidden");
  });
});

// ==================== PASO 13 — Inicialización ====================
// NUNCA CAMBIA el orden: 1) leer historial/puntaje persistido, 2) categorías, 3) primer elemento
async function iniciar() {
  historial = leerHistorial();

  // ↓ CAMBIA: SOLO si el README pide recuperar el puntaje persistido entre
  //   recargas de página. Si no lo pide, borrar este if — puntaje arranca en 0.
  if (historial.length > 0) {
    puntaje = historial[historial.length - 1].score;
    __SCORE__.textContent = puntaje;
  }

  renderizarHistorial();

  const categorias = await obtenerCategorias();
  renderizarSelectorCategorias(categorias);

  const primerElemento = await obtenerElementoAleatorio();
  renderizarElemento(primerElemento);
}

iniciar(); // NUNCA CAMBIA: siempre al final del archivo

/* ============================================================
   TABLA DE VARIANTES — para decidir en 30 segundos qué bloques
   usar y cuáles borrar, apenas lees el README

   TIPO DE EXAMEN     | CÓMO RESPONDE      | VALIDACIÓN          | ELEMENTO VISUAL
   -------------------|--------------------|--------------------|-----------------
   Trivia             | Click en opción    | por ÍNDICE          | Texto (pregunta)
   Dragon Ball        | Texto libre + form | por TEXTO normal.   | Imagen (silueta)
   Pokémon            | Texto libre + form | por TEXTO normal.   | Imagen (silueta)
   Clima en Vivo       | (verificar README) | según corresponda   | según corresponda

   REGLA DE ORO para elegir variante de PASO 4 (fetch de un elemento):
   - Si el README dice "elemento aleatorio, opcionalmente filtrado por
     categoría" → Variante A (query string ?categoria=X&random=true)
   - Si el README dice "elemento específico por id o nombre" → Variante B
     (path param /elemento/:id)
   - Si pide LAS DOS cosas en el mismo examen (ej. "traer uno al azar" +
     "buscar uno puntual por nombre") → dejar las dos funciones

   CHECKLIST ANTES DE EMPEZAR:
   1. Leer el README completo, anotar endpoints reales
   2. Anotar TODOS los id="..." del index.html
   3. Mirar el JSON real en server/data/*.json para saber los nombres
      exactos de campos (pregunta, respuestaCorrecta, nombre, imagen, etc.)
   4. Decidir: ¿respuesta por click (índice) o por texto libre (normalizar)?
   5. Decidir: ¿hay que persistir el puntaje entre recargas, o arranca
      siempre en 0? (se ve en la sección de localStorage del README)
   6. Decidir: ¿el historial se pinta como <li> simple o como <div> con
      clase CSS propia? (se ve mirando el CSS/HTML del examen)
   ============================================================ */
