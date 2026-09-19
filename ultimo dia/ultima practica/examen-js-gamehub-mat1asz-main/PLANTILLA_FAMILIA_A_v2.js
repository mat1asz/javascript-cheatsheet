/* ============================================================
   PLANTILLA FAMILIA A — COTIZADOR / CATÁLOGO CON MODAL
   v2 — actualizada después de resolver Cafetería completo.
   Sirve para: Billetera, Préstamos, Seguros, Cafetería, Eventos,
   Adopción de Mascotas, GameHub, y cualquier examen con:
   catálogo + filtro combinado + modal por :id + cálculo + localStorage.

   CÓMO USARLA EL DÍA DEL EXAMEN:
   1. Ctrl+F "__" y reemplazar cada placeholder por el dato REAL
      de index.html / README / JSON de ESE examen.
   2. Los bloques "NUNCA CAMBIA" se copian tal cual.
   3. Al final, Ctrl+F "__" de nuevo — si aparece algo, quedó sin cambiar.
   4. Revisar la sección "VARIANTES" al final: cada examen usa
      combinaciones distintas, ahí está la tabla de decisión.
   ============================================================ */

// ==================== PASO 1 — Referencias al DOM ====================
// ↓ CAMBIA: copiar id="..." REALES del index.html (Ctrl+F "id=")
const __SELECT_FILTRO_1__ = document.getElementById('__id-filtro-1__'); // ej: filtroCategoria, filtroGenero, filtroPlataforma, filtroEspecie
const __SELECT_FILTRO_2__ = document.getElementById('__id-filtro-2__'); // SOLO si hay un 2do filtro tipo select (ej: filtroEdad, filtroRefugio) — si no hay, borrar
const __INPUT_BUSQUEDA__ = document.getElementById('__id-busqueda__'); // ej: inputBusqueda

const __GRID__ = document.getElementById('__id-grid__'); // ej: catalogoGrid, eventosGrid
const __MODAL__ = document.getElementById('__id-modal__'); // ej: modalDetalle, modalCompra
const __DETALLE_CONTENT__ = document.getElementById('__id-detalle-content__'); // ej: detalleContent, compraContent

const __FORM__ = document.getElementById('__id-form__'); // ej: formPedido, formCompra, formAdopcion — si es solo "favoritos" sin form, borrar
const __CANTIDAD__ = document.getElementById('__id-cantidad__'); // input numérico de cantidad, si aplica
const __TOTAL_CALCULADO__ = document.getElementById('__id-total__'); // ej: precioTotalCalculado, totalPagar
// agregar más const de inputs del form según el README (cliente, notas, teléfono, etc.)

const __HISTORIAL_LISTA__ = document.getElementById('__id-historial__'); // ej: pedidosLista, historialLista, solicitudesLista, favoritosLista
const __BTN_LIMPIAR__ = document.getElementById('__id-btn-limpiar__');

// ==================== ESTADO GLOBAL ====================
// NUNCA CAMBIA el patrón — SOLO cambian los nombres
let __CATALOGO_1__ = []; // ej: productos, eventos, animales, videojuegos — SIEMPRE [], es un array
let __CATALOGO_2__ = []; // ej: categorias, generos, especies, plataformas — SIEMPRE []
let __CATALOGO_3__ = []; // SOLO si el examen trae un 3er catálogo (ej: Adopción tiene refugios) — si no, borrar
let historial = []; // SIEMPRE [] — es el array de pedidos/compras/solicitudes/favoritos
let elementoActual = null; // guarda el elemento que está mostrándose en el modal AHORA MISMO

// ==================== PASO 2 — Configuración ====================
const API_URL = 'http://localhost:3000/api'; // ↓ CAMBIA el puerto si el README dice otro
const CLAVE_STORAGE = '__clave_exacta_del_readme__'; // ↓ CAMBIA — TAL CUAL, comillas y mayúsculas

// ==================== PASO 3 — Fetch de catálogos completos (arrays) ====================
// NUNCA CAMBIA la estructura. ↓ CAMBIA: endpoint y nombre de función.
// Repetir esta función una vez por cada catálogo que haya (2 o 3).
async function obtener__Catalogo1__() {
  try {
    const respuesta = await fetch(`${API_URL}/__endpoint_1__`);
    if (!respuesta.ok) throw new Error('No se pudo obtener __catalogo1__');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return []; // SIEMPRE [] acá — el catálogo es una lista
  }
}

async function obtener__Catalogo2__() {
  try {
    const respuesta = await fetch(`${API_URL}/__endpoint_2__`);
    if (!respuesta.ok) throw new Error('No se pudo obtener __catalogo2__');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}
// Copiar de nuevo si hay un 3er catálogo. Si no, borrar esta función extra.

// ==================== PASO 4 — Fetch de UN elemento por id (para el modal) ====================
// NUNCA CAMBIA la estructura. Se usa SIEMPRE que exista /endpoint/:id en el README
// (Cafetería, Eventos, Adopción y GameHub lo tienen los 4 — es casi seguro que aparezca).
async function obtenerPorId(id) {
  try {
    const respuesta = await fetch(`${API_URL}/__endpoint_1__/${id}`); // ↓ CAMBIA el endpoint base
    if (!respuesta.ok) throw new Error('No se pudo obtener el elemento por id');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null; // SIEMPRE null acá — es UN objeto, no una lista
  }
}
async function obtenerVideojuegos() {
  try {
    const respuesta = await fetch(`${API_URL}/videojuegos`);
    const datos = await respuesta.json();

    // ⬇️ ESTAS 4 LÍNEAS SE AGREGAN SOLO SI EL JSON ES OBJETO { }
    const listaCompleta = [];
    for (const clave in datos) {
      datos[clave].forEach((elemento) => listaCompleta.push({ ...elemento, plataforma: clave }));
    }

    return listaCompleta; // ✅ ahora sí es una lista
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ==================== PASO 5 — Helper de mensajes ====================
// NUNCA CAMBIA
function mostrarMensaje(texto) {
  alert(texto);
}

// ==================== PASO 6 — Renderizar los <select> de filtro ====================
// NUNCA CAMBIA el patrón. Se llama UNA VEZ POR CADA select que necesite catálogo.
function renderizarSelectArray(lista, elementoSelect) {
  if (!lista) return;
  elementoSelect.innerHTML = '';
  lista.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id; // ↓ CAMBIA si el campo id se llama distinto (mirar el JSON real)
    option.textContent = item.nombre; // ↓ CAMBIA si el campo texto se llama distinto
    elementoSelect.appendChild(option);
  });
}

// ==================== PASO 7 — Renderizar las tarjetas del catálogo ====================
// ↓ CAMBIA TODO el contenido de adentro — es el HTML comentado que el README
//   trae en el propio index.html ("PLANTILLA PARA COPIAR Y PEGAR EN JS").
//   Buscar ese bloque comentado, copiarlo tal cual dentro de los backticks.
// NUNCA CAMBIA la ESTRUCTURA de las dos funciones (crear 1 tarjeta + recorrer lista).
function crearTarjeta__Elemento__(item) {
  return `
    <!-- ↓ PEGAR ACÁ el bloque HTML comentado del index.html, tal cual -->
    <!-- reemplazando cada variable de esa plantilla (ej. "producto") por "item" -->

  `;
  // ⚠ CHEQUEO ANTES DE ESCRIBIR EL return: ¿el HTML comentado usa algo como
  //   ${algunaVariable ? 'x' : 'y'} (ej: favorito, seleccionado, activo)?
  //   SI SÍ → agregar ANTES del return:
  //   const algunaVariable = historial.some((fav) => fav.id === item.id);
  //   SI NO → no hace falta nada, seguir directo con el return.
  //
  //   SI ME OLVIDO Y LA USO SIN DECLARARLA: en la consola (F12) aparece
  //   "Uncaught ReferenceError: algunaVariable is not defined"
  //   apuntando a la línea del template literal donde la usé.
  //   SOLUCIÓN: agregar la línea de arriba, antes del return, con el
  //   mismo nombre exacto que usa el HTML comentado.
}

function renderizar__Elementos__(lista) {
  __GRID__.innerHTML = '';
  lista.forEach((item) => {
    __GRID__.innerHTML += crearTarjeta__Elemento__(item);
  });
}

// ==================== PASO 8 — Filtro combinado (selects + búsqueda de texto) ====================
// FÓRMULA FIJA — no hay que "pensarla", se arma siempre así:
// - por cada select de filtro: condicion = valorSelect === "" || item.campo === valorSelect
// - para el texto: item.campoTexto.toLowerCase().includes(textoBuscado)
// - se combinan TODAS las condiciones con && dentro de un solo .filter()
function aplicarFiltros() {
  const filtro1 = __SELECT_FILTRO_1__.value;
  // const filtro2 = __SELECT_FILTRO_2__.value; // descomentar si hay un 2do select de filtro
  const textoBuscado = __INPUT_BUSQUEDA__.value.toLowerCase().trim();

  const listaFiltrada = __CATALOGO_1__.filter((item) => {
    const coincideFiltro1 = filtro1 === '' || item.__campo_filtro_1__ === filtro1; // ↓ CAMBIA el nombre del campo
    // const coincideFiltro2 = filtro2 === "" || item.__campo_filtro_2__ === filtro2;
    const coincideTexto = item.nombre.toLowerCase().includes(textoBuscado); // ↓ CAMBIA/agregar más campos con ||

    return coincideFiltro1 && coincideTexto; // ↓ CAMBIA: agregar "&& coincideFiltro2" si hay 2do select
  });

  renderizar__Elementos__(listaFiltrada);
}

__SELECT_FILTRO_1__.addEventListener('change', aplicarFiltros);
// __SELECT_FILTRO_2__.addEventListener("change", aplicarFiltros); // si hay 2do select
__INPUT_BUSQUEDA__.addEventListener('input', aplicarFiltros);

// ==================== PASO 9 — Delegación de eventos: clic en tarjeta/botón → abrir modal ====================
// NUNCA CAMBIA el patrón (listener en el GRID padre, no en cada tarjeta).
// Por qué: las tarjetas se crean DESPUÉS de que carga la página, así que
// no se les puede poner addEventListener directo — hay que escuchar en el
// contenedor padre (que sí existe siempre) y revisar evento.target.
__GRID__.addEventListener('click', async (evento) => {
  if (evento.target.classList.contains('btn-fav')) {
    const id = evento.target.dataset.id;
    const item = await obtenerPorId(id);
    elementoActual = item;

    __DETALLE_CONTENT__.innerHTML = `
      <!-- ↓ PEGAR el bloque HTML comentado del modal (detail-header-info o similar) -->
    `;

    __MODAL__.classList.remove('hidden');
  }
});

// ==================== PASO 10 — Cerrar modal ====================
// NUNCA CAMBIA — es 100% genérico, sirve igual en cualquier examen con modal
document.querySelectorAll('.cerrar-modal').forEach((boton) => {
  boton.addEventListener('click', () => {
    boton.closest('.modal').classList.add('hidden');
  });
});

// ==================== PASO 11 — Cálculo dinámico (si el examen tiene cantidad × precio) ====================
// Borrar este bloque si el examen es tipo "favoritos" sin cálculo (ej. GameHub).
__CANTIDAD__.addEventListener('input', () => {
  if (!elementoActual) return;
  const total = elementoActual.__campo_precio__ * Number(__CANTIDAD__.value); // ↓ CAMBIA el nombre del campo precio
  __TOTAL_CALCULADO__.textContent = `$${total}`;
});

// ==================== PASO 12 — localStorage: leer y guardar ====================
// NUNCA CAMBIA
function leerHistorial() {
  const dato = localStorage.getItem(CLAVE_STORAGE);
  return dato ? JSON.parse(dato) : [];
}

function guardarEnHistorial(entrada) {
  historial.push(entrada);
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
}

// ==================== PASO 13 — Renderizar historial ====================
// ↓ CAMBIA los campos que se muestran, según la estructura que pide el README
function renderizarHistorial() {
  __HISTORIAL_LISTA__.innerHTML = '';
  historial.forEach((entrada) => {
    __HISTORIAL_LISTA__.innerHTML += `
      <div class="__clase_item_historial__">
        <p>${entrada.__campoA__} — $${entrada.__campoB__} — ${entrada.fecha}</p>
      </div>
    `;
  });
}

// ==================== PASO 14 — VARIANTE A: submit de formulario (Cafetería/Eventos/Adopción) ====================
// Usar esta variante SI el README pide un <form> con datos del comprador/adoptante/cliente.
__FORM__.addEventListener('submit', (evento) => {
  evento.preventDefault(); // NUNCA CAMBIA: siempre primera línea

  const cantidad = Number(__CANTIDAD__.value); // si aplica
  const total = elementoActual.__campo_precio__ * cantidad; // si aplica

  // ↓ CAMBIA: armar el objeto EXACTO que pide el README (sección Almacenamiento Local)
  const nuevaEntrada = {
    id: Date.now(),
    __campoA__: elementoActual.nombre,
    __campoB__: total,
    fecha: new Date().toLocaleString('es-AR'),
  };

  guardarEnHistorial(nuevaEntrada);
  renderizarHistorial();

  __MODAL__.classList.add('hidden');
  __FORM__.reset();
});

// ==================== PASO 14 — VARIANTE B: toggle de favorito (GameHub, sin formulario) ====================
// Usar esta variante SI el README pide "agregar/quitar de favoritos" sin formulario de datos.
// Descomentar y adaptar, borrar la Variante A si el examen es de este tipo.
/*
function toggleFavorito(item) {
  const yaExiste = historial.some((fav) => fav.id === item.id);
  if (yaExiste) {
    historial = historial.filter((fav) => fav.id !== item.id);
  } else {
    historial.push({ id: item.id, nombre: item.nombre, fecha: new Date().toLocaleString("es-AR") });
  }
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
  renderizarHistorial();
}
  -->BIEN HECHA -->
  function toggleFavorito(item) {
  const yaExiste = historial.some((fav) => fav.id === item.id);
  if (yaExiste) {
    historial = historial.filter((fav) => fav.id !== item.id);
  } else {
    historial.push({
      id: item.id,
      nombre: item.nombre,
      plataforma: item.plataforma,
      calificacion: item.calificacion,
    });
  }
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
  renderizarHistorial();
}
*/

// ==================== PASO 15 — Botón limpiar historial ====================
// NUNCA CAMBIA
__BTN_LIMPIAR__.addEventListener('click', () => {
  historial = [];
  localStorage.removeItem(CLAVE_STORAGE);
  renderizarHistorial();
});
// ==================== PASO 14b — Botón "quitar" individual dentro de cada item del historial ====================
// SOLO SI el bloque HTML comentado del historial/favoritos trae un botón por item
// (ej: una papelerita al lado de cada favorito) además del botón que limpia TODO.
// Si el examen no tiene esto, borrar este bloque entero.
//
// NUNCA CAMBIA el patrón: delegación de eventos sobre el CONTENEDOR de la lista
// (el mismo motivo que en el Paso 9 — los items del historial también se crean
// DESPUÉS de cargar la página, así que no se les puede poner addEventListener directo).
__HISTORIAL_LISTA__.addEventListener('click', (evento) => {
  const boton = evento.target.closest('.__clase_boton_quitar__'); // ↓ CAMBIA: btn-quitar-fav, btn-eliminar, etc.
  if (boton) {
    const id = Number(boton.dataset.id); // ↓ Number() porque dataset.id SIEMPRE es string
    historial = historial.filter((entrada) => entrada.id !== id);
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
    renderizarHistorial();
    // ↓ SOLO si el catálogo principal también muestra el estado (ej: la estrella de favorito
    //   en cada tarjeta) — para que se actualice visualmente al sacarlo desde la lista:
    renderizar__Elementos__(__CATALOGO_1__);
  }
});

// ==================== PASO 16 — Inicialización ====================
// NUNCA CAMBIA el orden: 1) leer historial, 2) fetch catálogos, 3) renderizar todo
async function iniciar() {
  historial = leerHistorial();

  __CATALOGO_1__ = await obtener__Catalogo1__();
  __CATALOGO_2__ = await obtener__Catalogo2__();
  // __CATALOGO_3__ = await obtener__Catalogo3__(); // si hay 3er catálogo

  renderizar__Elementos__(__CATALOGO_1__);
  renderizarSelectArray(__CATALOGO_2__, __SELECT_FILTRO_1__);
  // renderizarSelectArray(__CATALOGO_3__, __SELECT_FILTRO_2__); // si hay 2do select con catálogo propio

  renderizarHistorial();
}

iniciar(); // NUNCA CAMBIA: siempre al final del archivo

/* ============================================================
   TABLA DE VARIANTES — según lo que vimos en los 4 modelos
   ============================================================

   EXAMEN            | CATÁLOGOS | FILTROS         | COMMIT #5 ES...
   ------------------|-----------|-----------------|---------------------------
   Cafetería         | 2         | categ. + texto  | Variante A (form pedido)
   Eventos           | 2         | género + texto  | Variante A (form compra)
   Adopción Mascotas | 3         | especie+edad+   | Variante A (form adopción)
                     |           | refugio + texto |
   GameHub           | 2         | plataf. + texto | Variante B (toggle favorito)

   CHECKLIST ANTES DE EMPEZAR CUALQUIER EXAMEN NUEVO:
   1. Leer el README completo, anotar los 3-5 endpoints reales
   2. Anotar TODOS los id="..." del index.html (Ctrl+F "id=")
   3. Mirar el JSON real en server/data/*.json — de ahí salen los
      nombres de campo, NUNCA de memoria ni de otro examen
   4. Buscar el bloque HTML comentado en index.html ("PLANTILLA
      PARA COPIAR Y PEGAR EN JS") — ahí está la estructura de tarjeta
      y de detalle del modal, ya resuelta, solo hay que envolverla
      en backticks y una función
   5. Definir CLAVE_STORAGE tal cual la dice el README
   6. Decidir: ¿el commit #5 es formulario (Variante A) o favoritos
      sin formulario (Variante B)? Se ve en la Tabla de Entregas
      del README, columna "Tarea a Realizar" del issue #5
   ============================================================ */
