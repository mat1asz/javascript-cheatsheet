const filtroPlataforma = document.getElementById('filtroPlataforma');
const ordenarCalificacion = document.getElementById('ordenarCalificacion');
const catalogoGrid = document.getElementById('catalogoGrid');
const modalDetalle = document.getElementById('modalDetalle');
const detalleContent = document.getElementById('detalleContent');
const btnLimpiarFavoritos = document.getElementById('btnLimpiarFavoritos');
const favoritosLista = document.getElementById('favoritosLista');

let videojuegos = [];
let plataformas = [];
let historial = [];
let elementoActual = null;

const API_URL = 'http://localhost:3000/api';
const CLAVE_STORAGE = 'gamehub_favoritos';

//GET http://localhost:3000/api/videojuegos : Devuelve todos los videojuegos
async function obtenerVideojuegos() {
  try {
    const respuesta = await fetch(`${API_URL}/videojuegos`);
    if (!respuesta.ok) throw new Error('No se pudo obtener los videojuegos');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//GET http://localhost:3000/api/plataformas : Devuelve la lista de plataformas disponibles
async function obtenerPlataformas() {
  try {
    const respuesta = await fetch(`${API_URL}/plataformas`);
    if (!respuesta.ok) throw new Error('No se pudo obtener las plataformas');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//GET http://localhost:3000/api/videojuegos?plataforma=PC : Filtra videojuegos por plataforma.
async function obtenerFiltrado(plataforma) {
  try {
    const respuesta = await fetch(`${API_URL}/videojuegos/${plataforma}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el elemento filtrado por plataforma');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//GET http://localhost:3000/api/videojuegos/:id : Devuelve un videojuego por su ID numérico
async function obtenerPorId(id) {
  try {
    const respuesta = await fetch(`${API_URL}/videojuegos/${id}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el elemento por id');
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
  lista.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.nombre;
    elementoSelect.appendChild(option);
  });
}

//// CHEQUEO ANTES DE ESCRIBIR EL return: ¿el HTML comentado usa algo como
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

function crearTarjetaJuego(item) {
  const esFavorito = historial.some((fav) => fav.id === item.id);
  return `
        <div class="game-card" data-id="${item.id}">
          <img src="${item.imagen}" alt="${item.nombre}" />
          <div class="game-card-body">
            <h3>${item.nombre}</h3>
            <p class="developer">${item.desarrollador}</p>
            <div class="meta">
              <div>
                <span class="badge badge-platform">${item.plataforma}</span>
                <span class="badge badge-genre">${item.genero}</span>
              </div>
              <div class="rating">
                <i class="fas fa-star"></i>
                <span>${item.calificacion}</span>
              </div>
              <button type="button" class="btn-fav ${esFavorito ? 'active' : ''}" data-id="${item.id}" title="Favorito">
                <i class="${esFavorito ? 'fas' : 'far'} fa-star"></i>
              </button>
            </div>
          </div>
        </div>
  `;
}

function renderizarJuegos(lista) {
  catalogoGrid.innerHTML = '';
  lista.forEach((item) => {
    catalogoGrid.innerHTML += crearTarjetaJuego(item);
  });
}

function aplicarFiltrosYOrden() {
  const plataforma = filtroPlataforma.value;
  const orden = ordenarCalificacion.value;

  let listaFiltrada = videojuegos.filter((item) => {
    return plataforma === '' || item.plataforma === plataforma;
  });

  if (orden === 'asc') {
    listaFiltrada = listaFiltrada.sort((a, b) => a.calificacion - b.calificacion);
  } else if (orden === 'desc') {
    listaFiltrada = listaFiltrada.sort((a, b) => b.calificacion - a.calificacion);
  }

  renderizarJuegos(listaFiltrada);
}

filtroPlataforma.addEventListener('change', aplicarFiltrosYOrden);
ordenarCalificacion.addEventListener('change', aplicarFiltrosYOrden);

catalogoGrid.addEventListener('click', async (evento) => {
  // Caso 1: click en la estrella → toggle de favorito, NO abre modal
  if (evento.target.closest('.btn-fav')) {
    const boton = evento.target.closest('.btn-fav');
    const id = Number(boton.dataset.id);
    const item = videojuegos.find((juego) => juego.id === id);
    toggleFavorito(item);
    renderizarJuegos(videojuegos);
    return;
  }

  // Caso 2: cualquier otra parte de la tarjeta → abre el modal
  const tarjeta = evento.target.closest('.game-card');
  if (tarjeta) {
    const id = tarjeta.dataset.id;
    const item = await obtenerPorId(id);
    elementoActual = item;

    detalleContent.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" />
            <h2>${item.nombre}</h2>
            <div class="detail-meta">
              <span class="badge badge-platform">${item.plataforma}</span>
              <span class="badge badge-genre">${item.genero}</span>
              <span class="badge"><i class="fas fa-star" style="color:var(--star)"></i> ${item.calificacion}</span>
              <span class="badge">${item.año || 2024}</span>
            </div>
            <p>${item.descripcion}</p>
    `;

    modalDetalle.classList.remove('hidden');
  }
});

document.querySelectorAll('.cerrar-modal').forEach((boton) => {
  boton.addEventListener('click', () => {
    boton.closest('.modal').classList.add('hidden');
  });
});

function leerHistorial() {
  const dato = localStorage.getItem(CLAVE_STORAGE);
  return dato ? JSON.parse(dato) : [];
}

function guardarEnHistorial(entrada) {
  historial.push(entrada);
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
}

function renderizarHistorial() {
  favoritosLista.innerHTML = '';
  historial.forEach((entrada) => {
    favoritosLista.innerHTML += `
          <div class="fav-item">
            <div>
              <span><strong>${entrada.nombre}</strong></span>
              <span class="fav-platform"> &bull; ${entrada.plataforma} &bull; <i class="fas fa-star" style="color:var(--star)"></i> ${entrada.calificacion}</span>
            </div>
            <button type="button" class="btn-outline btn-quitar-fav" data-id="${entrada.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>

    `;
  });
}

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

btnLimpiarFavoritos.addEventListener('click', () => {
  historial = [];
  localStorage.removeItem(CLAVE_STORAGE);
  renderizarHistorial();
});

favoritosLista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('.btn-quitar-fav');
  if (boton) {
    const id = Number(boton.dataset.id);
    historial = historial.filter((fav) => fav.id !== id);
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(historial));
    renderizarHistorial();
    renderizarJuegos(videojuegos); // para que la estrella de la tarjeta también se actualice
  }
});

async function iniciar() {
  historial = leerHistorial();

  videojuegos = await obtenerVideojuegos();
  plataformas = await obtenerPlataformas();

  renderizarJuegos(videojuegos);
  renderizarSelectArray(plataformas, filtroPlataforma);

  renderizarHistorial();
}

iniciar();
