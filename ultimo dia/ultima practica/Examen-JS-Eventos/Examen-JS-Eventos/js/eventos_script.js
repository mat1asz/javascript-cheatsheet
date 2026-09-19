const filtroGenero = document.getElementById('filtroGenero');
const inputBusqueda = document.getElementById('inputBusqueda');
const eventosGrid = document.getElementById('eventosGrid');
const modalCompra = document.getElementById('modalCompra');
const compraContent = document.getElementById('compraContent');
const formCompra = document.getElementById('formCompra');
const cantidadEntradas = document.getElementById('cantidadEntradas');
const totalPagar = document.getElementById('totalPagar');
const btnConfirmar = document.getElementById('btnConfirmar');
const historialLista = document.getElementById('historialLista');
const btnLimpiarHistorial = document.getElementById('btnLimpiarHistorial');

let eventos = [];
let generos = [];
let historial = [];
let elementoActual = null;

const API_URL = 'http://localhost:3000/api';
const CLAVE_STORAGE = 'eventos_compras';

//GET http://localhost:3000/api/eventos : Devuelve la lista completa de eventos
async function obtenerEventos() {
  try {
    const respuesta = await fetch(`${API_URL}/eventos`);
    if (!respuesta.ok) throw new Error('No se pudo obtener la lista de eventos');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//GET http://localhost:3000/api/generos : Devuelve la lista de géneros disponibles ( id, nombre )
async function obtenerGeneros() {
  try {
    const respuesta = await fetch(`${API_URL}/generos`);
    if (!respuesta.ok) throw new Error('No se pudo obtener los géneros');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//GET http://localhost:3000/api/eventos/:id : Devuelve un evento por su ID numérico
async function obtenerPorId(id) {
  try {
    const respuesta = await fetch(`${API_URL}/eventos/${id}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el evento por id');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function mostrarMensaje(texto) {
  alert(texto);
}

function renderizarSelectArray(lista, elementoSelect) {
  if (!lista) return;
  // filtroGenero ya trae "Todos los géneros" en el HTML, por eso NO
  // va elementoSelect.innerHTML = ''.
  lista.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.nombre;
    elementoSelect.appendChild(option);
  });
}

// OJO: este examen NO tiene el bloque HTML comentado con la plantilla lista
// (los otros exámenes sí lo traían). Acá tuve que armar la tarjeta yo mismo,
// mirando las clases que ya existen en el CSS (.event-card, .badge-genre,
// .badge-sold-out, .badge-low-stock) y lo que pide el README sobre
// "AGOTADO" y "Últimas entradas".
function crearTarjetaEvento(item) {
  const agotado = item.tickets_disponibles === 0;
  const pocasEntradas = !agotado && item.tickets_disponibles < 500;

  let badgeDisponibilidad = '';
  if (agotado) {
    badgeDisponibilidad = `<span class="badge badge-sold-out">AGOTADO</span>`;
  } else if (pocasEntradas) {
    badgeDisponibilidad = `<span class="badge badge-low-stock">Últimas entradas</span>`;
  }

  return `
    <div class="event-card" data-id="${item.id}">
      <img src="${item.imagen}" alt="${item.nombre}" />
      <div class="event-card-body">
        <h3>${item.nombre}</h3>
        <p class="artist">${item.artista}</p>
        <div class="event-info">
          <p><i class="fas fa-calendar"></i> ${item.fecha}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${item.ubicacion}</p>
          <p><i class="fas fa-ticket-alt"></i> $${item.precio}</p>
        </div>
        <span class="badge badge-genre">${item.genero}</span>
        ${badgeDisponibilidad}
        <button type="button" class="btn-primary btn-comprar" data-id="${item.id}" ${agotado ? 'disabled' : ''}>
          <i class="fas fa-ticket-alt"></i> ${agotado ? 'Agotado' : 'Comprar'}
        </button>
      </div>
    </div>
  `;
}

function renderizarEventos(lista) {
  eventosGrid.innerHTML = '';
  lista.forEach((item) => {
    eventosGrid.innerHTML += crearTarjetaEvento(item);
  });
}

// BUG que ya me comí una vez acá: el backend arma el value de cada option
// como un "slug" (minúscula, con guiones: "rock-indie"), pero item.genero
// viene tal cual en el JSON ("Rock Indie", con mayúscula y espacio).
// Si comparo directo, el filtro nunca encuentra nada — hay que aplicarle
// la MISMA transformación al género del evento antes de comparar.
//
// El README también pide buscar por "nombre O artista", por eso el
// || entre los dos .includes().
function aplicarFiltros() {
  const filtro1 = filtroGenero.value;
  const textoBuscado = inputBusqueda.value.toLowerCase().trim();

  const listaFiltrada = eventos.filter((item) => {
    const coincideGenero =
      filtro1 === '' || item.genero.toLowerCase().replace(/[\s/]+/g, '-') === filtro1;
    const coincideTexto =
      item.nombre.toLowerCase().includes(textoBuscado) ||
      item.artista.toLowerCase().includes(textoBuscado);

    return coincideGenero && coincideTexto;
  });

  renderizarEventos(listaFiltrada);
}

filtroGenero.addEventListener('change', aplicarFiltros);
inputBusqueda.addEventListener('input', aplicarFiltros);

eventosGrid.addEventListener('click', async (evento) => {
  if (evento.target.classList.contains('btn-comprar')) {
    // Un botón disabled (agotado) no dispara click en el navegador,
    // así que no hace falta chequear "agotado" de nuevo acá.
    const id = evento.target.dataset.id;
    const item = await obtenerPorId(id);
    elementoActual = item;

    // Siempre "item.algo", nunca "evento.algo" — el mismo bug de siempre.
    compraContent.innerHTML = `
      <h4>${item.nombre}</h4>
      <p><strong>Artista:</strong> ${item.artista}</p>
      <p><strong>Fecha:</strong> ${item.fecha}</p>
      <p><strong>Ubicación:</strong> ${item.ubicacion}</p>
      <p><strong>Precio unitario:</strong> $${item.precio}</p>
    `;

    cantidadEntradas.value = 1;
    totalPagar.textContent = `$${item.precio.toFixed(2)}`;

    modalCompra.classList.remove('hidden');
  }
});

document.querySelectorAll('.cerrar-modal').forEach((boton) => {
  boton.addEventListener('click', () => {
    boton.closest('.modal').classList.add('hidden');
  });
});

// El campo correcto para el cálculo es "precio" — BUG que ya me comí
// acá una vez: usé el id de un elemento del modal (compraContent) pensando
// que era un dato del evento, y no lo era.
cantidadEntradas.addEventListener('input', () => {
  if (!elementoActual) return;
  const total = elementoActual.precio * Number(cantidadEntradas.value);
  totalPagar.textContent = `$${total.toFixed(2)}`;
});

function leerHistorial() {
  const dato = localStorage.getItem(CLAVE_STORAGE);
  return dato ? JSON.parse(dato) : [];
}

function guardarEnHistorial(entrada) {
  historial.push(entrada);
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
}

// historialLista es un <ul> en el HTML, así que cada item tiene que ser
// un <li>, no un <div> suelto — el contenedor padre y el hijo tienen que
// coincidir en el tipo de etiqueta.
function renderizarHistorial() {
  historialLista.innerHTML = '';
  historial.forEach((entrada) => {
    historialLista.innerHTML += `
      <li>
        🎫 ${entrada.evento} &bull; ${entrada.artista} &bull;
        ${entrada.cantidad} entrada(s) &bull; $${entrada.total} &bull; ${entrada.fecha}
      </li>
    `;
  });
}

// Variante A (formulario) — hay un <form> con la cantidad de entradas.
// OJO acá: el README pide { evento, artista, cantidad, total, fecha } SIN
// "id" — a diferencia de los otros exámenes, este objeto no lleva id.
formCompra.addEventListener('submit', (evento) => {
  evento.preventDefault(); // siempre primera línea

  const cantidad = Number(cantidadEntradas.value);
  const total = elementoActual.precio * cantidad;

  const nuevaEntrada = {
    evento: elementoActual.nombre,
    artista: elementoActual.artista,
    cantidad,
    total,
    fecha: new Date().toLocaleString('es-AR'),
  };

  guardarEnHistorial(nuevaEntrada);
  renderizarHistorial();

  modalCompra.classList.add('hidden');
  formCompra.reset();
});

btnLimpiarHistorial.addEventListener('click', () => {
  historial = [];
  localStorage.removeItem(CLAVE_STORAGE);
  renderizarHistorial();
});

async function iniciar() {
  historial = leerHistorial();

  eventos = await obtenerEventos();
  generos = await obtenerGeneros();

  renderizarEventos(eventos);
  renderizarSelectArray(generos, filtroGenero);

  renderizarHistorial();
}

iniciar();
