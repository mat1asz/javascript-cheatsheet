/* ============================================================
   PLANTILLA FAMILIA A — COTIZADOR / CALCULADORA
   Sirve para: Billetera, Birra y Bíceps, Préstamos, Seguros,
   y cualquier examen donde el objetivo sea "elegir opciones +
   calcular un resultado con una fórmula + guardar historial".

   CÓMO USARLA EL DÍA DEL EXAMEN:
   1. Ctrl+F "__" (doble guión bajo) y reemplazá cada placeholder
      por el dato real de ESE examen (no de uno que ya resolviste).
   2. Los bloques "NUNCA CAMBIA" se dejan tal cual.
   3. Al final, Ctrl+F "__" de nuevo: si aparece alguno, quedó
      un placeholder sin reemplazar (te pasó con __BTN_LIMPIAR__).
   ============================================================ */

// ==================== PASO 1 — Referencias al DOM ====================
// ↓ CAMBIA: copiá los id="..." REALES del index.html (Ctrl+F "id="),
//   nunca de memoria ni copiados de otro examen ya resuelto.
const __INPUT_1__ = document.getElementById("__id-input-1__"); // ej: monto, metros2
const __SELECT_1__ = document.getElementById("__id-select-1__"); // ej: plan, propiedad, tasa
const __SELECT_2__ = document.getElementById("__id-select-2__"); // si hay un 2do select (sucursal, ubicacion, plazo)
// agregá más const si el examen tiene más selects/inputs/checkboxes

const __FORM__ = document.getElementById("__id-form__");
const __RESULTADO_1__ = document.getElementById("__id-resultado-1__"); // ej: precioMensual, cuotaMensual, valorPoliza
const __RESULTADO_2__ = document.getElementById("__id-resultado-2__"); // si hay un 2do resultado (ej: precioTotal)

const __HISTORIAL_LISTA__ = document.getElementById("__id-historial__");
const __BTN_LIMPIAR__ = document.getElementById("__id-btn-limpiar__");

// ==================== ESTADO GLOBAL ====================
// NUNCA CAMBIA: el patrón de guardar el/los catálogo(s) traídos del backend
let __CATALOGO_1__ = null; // acá guardo lo que trae el fetch, para no pedirlo de nuevo
let __CATALOGO_2__ = null; // si hay un 2do catálogo (ej: sucursales) — si no hay, borrar esta línea
let historial = [];

// ==================== PASO 2 — Configuración ====================
const API_URL = "http://localhost:3000/api"; // ↓ CAMBIA el puerto si el README dice otro
const CLAVE_STORAGE = "__clave_exacta_del_readme__";
// ↓ CAMBIA — copiá TAL CUAL del README (comillas, mayúsculas).
// ⚠ Una vez definida acá, NUNCA vuelvas a escribir la clave "a mano"
//   en otra parte del código: siempre usá CLAVE_STORAGE.

// ==================== PASO 3 — Fetch de catálogos (GET, sin :id) ====================
// NUNCA CAMBIA la estructura async/try/fetch/if(!ok)/json/catch
// ↓ CAMBIA el endpoint, el nombre de función, y qué devuelve el catch
//   (mirá el JSON real: si empieza con "[" => catch devuelve [];
//    si empieza con "{" => catch devuelve null)
async function obtenerCatalogo1() {
  try {
    const respuesta = await fetch(`${API_URL}/__endpoint_1__`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el catálogo");
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null; // ← cambiar a [] si el dato es un array
  }
}
// Si el examen trae un 2do catálogo (ej: planes + sucursales por separado),
// copiá esta función de nuevo cambiando endpoint y nombre. Si no hay 2do
// catálogo, borrá esta función y el __CATALOGO_2__ de arriba.
async function obtenerCatalogo2() {
  try {
    const respuesta = await fetch(`${API_URL}/__endpoint_2__`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el catálogo");
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ==================== Paso 4 (CONDICIONAL) — Fetch dinámico con :id ====================
// ⚠ ESTE PASO NO SIEMPRE EXISTE. Solo se usa si ALGÚN endpoint del README
//   tiene un parámetro variable en la URL (ej: /planes/:id o ?tipo=X).
//   Si NINGÚN endpoint del README lo tiene (pasó en Seguros), borrá esta
//   función entera y no pierdas tiempo buscando dónde usarla.
async function obtenerPorId(id) {
  try {
    const respuesta = await fetch(`${API_URL}/__endpoint__/${id}`);
    if (!respuesta.ok) throw new Error("No se pudo obtener el elemento");
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// ==================== PASO 5 — Helper de mensajes ====================
// NUNCA CAMBIA — se define igual siempre, se use o no
function mostrarMensaje(texto) {
  alert(texto);
}

// ==================== PASO 6 — Renderizar los <select> ====================
// NUNCA CAMBIA: el patrón forEach + createElement("option") + appendChild,
// sea cual sea la variante. Siempre limpiar antes de llenar.

// VARIANTE 1 — si el catálogo es un ARRAY de objetos: [{id, nombre}, ...]
// Se escribe UNA sola vez con parámetros, y se LLAMA una vez por cada
// select que tenga esa misma forma de dato (no se duplica la función).
function renderizarSelectArray(lista, elementoSelect) {
  if (!lista) return;
  elementoSelect.innerHTML = ""; // evita duplicar si ya había options hardcodeadas
  lista.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.__campo_id__; // ↓ CAMBIA: nombre real del campo id
    option.textContent = item.__campo_nombre__; // ↓ CAMBIA: nombre real del campo texto
    elementoSelect.appendChild(option);
  });
}

// VARIANTE 2 — si el catálogo es un OBJETO plano: {clave: valor, ...}
function renderizarSelectObjeto(objeto, elementoSelect) {
  if (!objeto) return;
  elementoSelect.innerHTML = "";
  Object.keys(objeto).forEach((clave) => {
    // ⚠ Object.keys() es SOLO para objetos {clave: valor}.
    //   Si el catálogo ya es un array, usá renderizarSelectArray y
    //   NO envuelvas el array en Object.keys().
    const option = document.createElement("option");
    option.value = clave;
    option.textContent = `${clave} (${objeto[clave]})`; // ↓ CAMBIA el formato de texto
    elementoSelect.appendChild(option);
  });
}

// ==================== PASO 7 — Calcular y renderizar el resultado ====================
// ↓ CAMBIA: LA función más importante — la fórmula sale del README,
//   sección "Fórmula de Cálculo". Copiá los pasos TAL CUAL los da el
//   enunciado, en el mismo orden, sin inventar ni redondear de más.
function calcularResultado() {
  const valorInput = Number(__INPUT_1__.value);
  const opcion1 = __SELECT_1__.value;
  const opcion2 = __SELECT_2__.value;

  // ↓ CAMBIA: buscá en el catálogo el objeto que corresponde a la opción elegida
  // ej: const plan = __CATALOGO_1__.find(p => p.id === opcion1);

  // ↓ CAMBIA: aplicá la fórmula EXACTA del README, paso por paso
  // ej (Préstamos): interesTotal = monto * tasa * (meses/12); total = monto + interesTotal; cuota = total / meses;
  const resultado1 = 0; // reemplazar por el cálculo real
  const resultado2 = 0; // si hay un segundo resultado — si no hay, borrar

  __RESULTADO_1__.textContent = resultado1.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
  __RESULTADO_2__.textContent = resultado2.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });

  return { resultado1, resultado2 };
}

// ==================== PASO 9 — localStorage: leer y guardar ====================
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
// NUNCA CAMBIA: limpiar innerHTML antes de repintar
function renderizarHistorial() {
  __HISTORIAL_LISTA__.innerHTML = "";
  historial.forEach((entrada) => {
    const li = document.createElement("li");
    // ↓ CAMBIA: qué campos de "entrada" mostrás — TIENEN que ser los
    //   mismos nombres que usaste al guardar en el Paso 8, y salen
    //   del README de ESTE examen, no de uno anterior.
    li.textContent = `${entrada.__campoA__} — $${entrada.__campoB__} — ${entrada.fecha}`;
    __HISTORIAL_LISTA__.appendChild(li);
  });
}

// ==================== PASO 8 — Evento submit del formulario ====================
__FORM__.addEventListener("submit", (evento) => {
  evento.preventDefault(); // NUNCA CAMBIA: siempre primera línea

  // ↓ CAMBIA: validaciones básicas antes de calcular
  if (!__INPUT_1__.value || Number(__INPUT_1__.value) <= 0) {
    mostrarMensaje("Ingresá un valor válido");
    return;
  }

  const { resultado1 } = calcularResultado();

  // ↓ CAMBIA: qué campos exactos pide el README para guardar (Almacenamiento Local)
  const nuevaEntrada = {
    __campoA__: __SELECT_1__.value,
    __campoB__: resultado1,
    fecha: new Date().toLocaleString("es-AR"),
  };

  guardarEnHistorial(nuevaEntrada);
  renderizarHistorial();
});

// ==================== PASO 11 — Botón limpiar historial ====================
// NUNCA CAMBIA el patrón
__BTN_LIMPIAR__.addEventListener("click", () => {
  historial = [];
  localStorage.removeItem(CLAVE_STORAGE);
  renderizarHistorial();
});

// ==================== PASO 12 — Inicialización ====================
async function iniciar() {
  historial = leerHistorial();

  __CATALOGO_1__ = await obtenerCatalogo1();
  renderizarSelectArray(__CATALOGO_1__, __SELECT_1__); // ↓ CAMBIA la variante si el catálogo es objeto

  // Si hay un 2do catálogo/select, se llama una 2da vez (NO se crea otra función):
  __CATALOGO_2__ = await obtenerCatalogo2();
  renderizarSelectArray(__CATALOGO_2__, __SELECT_2__);
  // Si el examen tiene un solo catálogo/select, borrá estas 2 líneas de arriba.

  renderizarHistorial();
}

iniciar(); // NUNCA CAMBIA: siempre al final, después de definidas todas las funciones
