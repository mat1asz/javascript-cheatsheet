const filtroEspecie = document.getElementById('filtroEspecie');
const catalogoGrid = document.getElementById('catalogoGrid');
const modalDetalle = document.getElementById('modalDetalle');
const detalleContent = document.getElementById('detalleContent');
const formAdopcion = document.getElementById('formAdopcion');
const inputNombreAdoptante = document.getElementById('inputNombreAdoptante');
const inputTelefono = document.getElementById('inputTelefono');
const btnConfirmarAdopcion = document.getElementById('btnConfirmarAdopcion');
const btnLimpiarSolicitudes = document.getElementById('btnLimpiarSolicitudes');
const solicitudesLista = document.getElementById('solicitudesLista');

let animales = [];
let especies = [];
let historial = [];
let elementoActual = null;

const API_URL = 'http://localhost:3000/api';
const CLAVE_STORAGE = 'adopcion_solicitudes';

//GET http://localhost:3000/api/animales : Devuelve la lista de animales disponibles
async function obtenerAnimales() {
  try {
    const respuesta = await fetch(`${API_URL}/animales`);
    if (!respuesta.ok) throw new Error('No se pudo obtener la lista de animales');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}
//GET http://localhost:3000/api/especies : Devuelve las especies registradas ( id ,  nombre )
async function obtenerEspecies() {
  try {
    const respuesta = await fetch(`${API_URL}/especies`);
    if (!respuesta.ok) throw new Error('No se pudo obtener la lista de especies');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}
//GET http://localhost:3000/api/animales/:id : Devuelve la ficha de un animal por su ID numérico
async function obtenerPorId(id) {
  try {
    const respuesta = await fetch(`${API_URL}/animales/${id}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el animal por id');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return null;
  }
}

//---------FIn del commit 2-------------

function mostrarMensaje(texto) {
  alert(texto);
}

function renderizarSelectArray(lista, elementoSelect) {
  if (!lista) return;
  //aca hay un select con un option ya escrito adentro asi que no va esta linea: elementoSelect.innerHTML = '';
  lista.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.nombre;
    elementoSelect.appendChild(option);
  });
}

function crearTarjetaAnimal(item) {
  return `
        <div class="animal-card">
          <div class="card-image-wrap">
            <img src="${item.imagen}" alt="${item.nombre}" class="card-image" />
            <span class="card-species-badge badge-${item.especie}">${item.especie}</span>
            <span class="card-age-badge">${item.edad}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${item.nombre}</h3>
            <p class="card-breed">${item.raza} &bull; ${item.sexo}</p>
            <p class="card-shelter"><i class="fas fa-home"></i> ${item.refugio}</p>
            <p class="card-description">${item.descripcion}</p>
            <button type="button" class="btn-primary btn-adoptar" data-id="${item.id}">
              <i class="fas fa-heart"></i> Conocer y Adoptar
            </button>
          </div>
        </div>
  `;
}

function renderizarAnimales(lista) {
  catalogoGrid.innerHTML = '';
  lista.forEach((item) => {
    catalogoGrid.innerHTML += crearTarjetaAnimal(item);
  });
}

//---------FIn del commit 3-------------

function aplicarFiltros() {
  const filtro1 = filtroEspecie.value;
  const listaFiltrada = animales.filter((item) => {
    const coincideFiltro1 = filtro1 === '' || item.especie === filtro1;

    return coincideFiltro1;
  });
  renderizarAnimales(listaFiltrada);
}
filtroEspecie.addEventListener('change', aplicarFiltros);

catalogoGrid.addEventListener('click', async (evento) => {
  if (evento.target.classList.contains('btn-adoptar')) {
    const id = evento.target.dataset.id;
    const item = await obtenerPorId(id);
    elementoActual = item;

    detalleContent.innerHTML = `
            <div class="detail-header-info">
              <img src="${item.imagen}" alt="${item.nombre}" class="detail-img" />
              <div>
                <h4>${item.nombre} (${item.raza})</h4>
                <div class="detail-meta-grid">
                  <div class="detail-meta-item"><strong>Especie:</strong> ${item.especie}</div>
                  <div class="detail-meta-item"><strong>Edad:</strong> ${item.edad}</div>
                  <div class="detail-meta-item"><strong>Tamaño:</strong> ${item.tamaño}</div>
                  <div class="detail-meta-item"><strong>Refugio:</strong> ${item.refugio}</div>
                </div>
              </div>
            </div>
            <div class="detail-history">
              <strong>Historia:</strong> ${item.historia}
            </div>
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
  solicitudesLista.innerHTML = '';
  historial.forEach((entrada) => {
    solicitudesLista.innerHTML += `
          <div class="solicitud-card">
            <div class="solicitud-info">
              <h4>🐾 Solicitud para: ${entrada.animalNombre} (${entrada.especie})</h4>
              <p><strong>Solicitante:</strong> ${entrada.solicitante} &bull; <strong>Tel:</strong> ${entrada.telefono} &bull; <strong>Fecha:</strong> ${entrada.fecha}</p>
            </div>
            <span class="solicitud-badge">En Revisión</span>
          </div>
    `;
  });
}

formAdopcion.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nuevaEntrada = {
    id: Date.now(),
    animalNombre: elementoActual.nombre,
    especie: elementoActual.especie,
    solicitante: inputNombreAdoptante.value,
    telefono: inputTelefono.value,
    fecha: new Date().toLocaleString('es-AR'),
  };

  guardarEnHistorial(nuevaEntrada);
  renderizarHistorial();

  modalDetalle.classList.add('hidden');
  formAdopcion.reset();
});

btnLimpiarSolicitudes.addEventListener('click', () => {
  historial = [];
  localStorage.removeItem(CLAVE_STORAGE);
  renderizarHistorial();
});

async function iniciar() {
  historial = leerHistorial();

  animales = await obtenerAnimales();
  especies = await obtenerEspecies();

  renderizarAnimales(animales);
  renderizarSelectArray(especies, filtroEspecie);

  renderizarHistorial();
}

iniciar();
