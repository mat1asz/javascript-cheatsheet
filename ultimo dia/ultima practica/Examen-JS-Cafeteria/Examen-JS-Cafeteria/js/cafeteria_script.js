const filtroCategoria = document.getElementById('filtroCategoria');
const inputBusqueda = document.getElementById('inputBusqueda');
const catalogoGrid = document.getElementById('catalogoGrid');
const modalDetalle = document.getElementById('modalDetalle');
const detalleContent = document.getElementById('detalleContent');
const formPedido = document.getElementById('formPedido');
const cantidadProducto = document.getElementById('cantidadProducto');
const inputCliente = document.getElementById('inputCliente');
const inputNotas = document.getElementById('inputNotas');
const precioTotalCalculado = document.getElementById('precioTotalCalculado');
const btnConfirmarPedido = document.getElementById('btnConfirmarPedido');
const pedidosLista = document.getElementById('pedidosLista');
const btnLimpiarPedidos = document.getElementById('btnLimpiarPedidos');

let productos = [];
let categorias = [];
let historial = [];
let elementoActual = null;

const API_URL = 'http://localhost:3000/api';
const CLAVE_STORAGE = 'cafeteria_pedidos';

//GET http://localhost:3000/api/productos : Devuelve la lista completa de productos de la carta
async function obtenerProductos() {
  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    if (!respuesta.ok) throw new Error('No se pudo obtener la carta de productos');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//GET http://localhost:3000/api/categorias : Devuelve las categorías disponibles ( id, nombre )
async function obtenerCategorias() {
  try {
    const respuesta = await fetch(`${API_URL}/categorias`);
    if (!respuesta.ok) throw new Error('No se pudo obtener las categorías');
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error(error);
    return [];
  }
}

//GET http://localhost:3000/api/productos/:id : Devuelve el detalle de un producto por su ID numérico
async function obtenerPorId(id) {
  try {
    const respuesta = await fetch(`${API_URL}/productos/${id}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el producto por id');
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
  // filtroCategoria ya trae "Todas las categorías" escrita a mano en el HTML,
  // por eso NO va elementoSelect.innerHTML = '' — si la pongo, pierdo esa opción.
  lista.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.nombre;
    elementoSelect.appendChild(option);
  });
}

function crearTarjetaProducto(item) {
  // badgeClass lo armo yo mismo, con la misma idea que "badge-especie" de Mascotas
  const badgeClass = `badge-${item.categoria}`;

  return `
    <div class="producto-card">
      <div class="card-image-wrap">
        <img src="${item.imagen}" alt="${item.nombre}" class="card-image" />
        <span class="card-cat-badge ${badgeClass}">${item.categoriaNombre}</span>
        <span class="card-price-badge">$${item.precioBase}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${item.nombre}</h3>
        ${item.origenGrano ? `<p class="card-origin"><i class="fas fa-seedling"></i> ${item.origenGrano}</p>` : ''}
        <p class="card-description">${item.descripcion}</p>
        <div class="card-tags">
          ${item.notasCata.map((nota) => `<span class="tag">${nota}</span>`).join('')}
        </div>
        <button type="button" class="btn-primary btn-ordenar" data-id="${item.id}">
          <i class="fas fa-coffee"></i> Ordenar Producto
        </button>
      </div>
    </div>
  `;
}

function renderizarProductos(lista) {
  catalogoGrid.innerHTML = '';
  lista.forEach((item) => {
    catalogoGrid.innerHTML += crearTarjetaProducto(item);
  });
}

// El README pide buscar por "nombre o notas de cata". notasCata es un ARRAY,
// así que no puedo hacer .includes() directo como con nombre — tengo que
// usar .some() para preguntar "¿alguna de las notas contiene el texto buscado?".
function aplicarFiltros() {
  const filtro1 = filtroCategoria.value;
  const textoBuscado = inputBusqueda.value.toLowerCase().trim();

  const listaFiltrada = productos.filter((item) => {
    const coincideCategoria = filtro1 === '' || item.categoria === filtro1;
    const coincideTexto =
      item.nombre.toLowerCase().includes(textoBuscado) ||
      item.notasCata.some((nota) => nota.toLowerCase().includes(textoBuscado));

    return coincideCategoria && coincideTexto;
  });

  renderizarProductos(listaFiltrada);
}

filtroCategoria.addEventListener('change', aplicarFiltros);
inputBusqueda.addEventListener('input', aplicarFiltros);

catalogoGrid.addEventListener('click', async (evento) => {
  if (evento.target.classList.contains('btn-ordenar')) {
    const id = evento.target.dataset.id;
    const item = await obtenerPorId(id);
    elementoActual = item;

    // Siempre "item.algo" acá, nunca "evento.algo" — evento es el click,
    // no tiene los datos del producto.
    detalleContent.innerHTML = `
      <div class="detail-header-info">
        <img src="${item.imagen}" alt="${item.nombre}" class="detail-img" />
        <div>
          <h4>${item.nombre}</h4>
          <div class="detail-meta-grid">
            <div class="detail-meta-item"><strong>Categoría:</strong> ${item.categoriaNombre}</div>
            <div class="detail-meta-item"><strong>Precio unitario:</strong> $${item.precioBase}</div>
            ${item.origenGrano ? `<div class="detail-meta-item"><strong>Origen:</strong> ${item.origenGrano}</div>` : ''}
            ${item.tiempoPreparacionMin ? `<div class="detail-meta-item"><strong>Demora:</strong> ${item.tiempoPreparacionMin} min</div>` : ''}
          </div>
        </div>
      </div>
    `;

    // Dejo la cantidad en 1 y el total inicial mostrado, para que no
    // quede en $0 hasta que la persona toque el input de cantidad.
    cantidadProducto.value = 1;
    precioTotalCalculado.textContent = `$${item.precioBase}`;

    modalDetalle.classList.remove('hidden');
  }
});

document.querySelectorAll('.cerrar-modal').forEach((boton) => {
  boton.addEventListener('click', () => {
    boton.closest('.modal').classList.add('hidden');
  });
});

// Este examen SÍ tiene cálculo dinámico (precioBase x cantidad) —
// es cafetería, se pide más de una unidad del mismo producto.
cantidadProducto.addEventListener('input', () => {
  if (!elementoActual) return;
  const total = elementoActual.precioBase * Number(cantidadProducto.value);
  precioTotalCalculado.textContent = `$${total}`;
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
  pedidosLista.innerHTML = '';
  historial.forEach((entrada) => {
    pedidosLista.innerHTML += `
      <div class="pedido-card">
        <div class="pedido-info">
          <h4>☕ #${entrada.id} - ${entrada.productoNombre} &bull; <strong>Cliente:</strong> ${entrada.cliente}</h4>
          <p>${entrada.cantidad} unidad(es) &bull; ${entrada.fecha}</p>
          ${entrada.notas ? `<p class="pedido-notas"><em>Notas: "${entrada.notas}"</em></p>` : ''}
        </div>
        <div class="pedido-total">$${entrada.total}</div>
      </div>
    `;
  });
}

// Variante A (formulario) — el README pide datos del cliente (nombre y
// notas opcionales), no es un toggle de favorito.
formPedido.addEventListener('submit', (evento) => {
  evento.preventDefault(); // siempre primera línea

  const cantidad = Number(cantidadProducto.value);
  const total = elementoActual.precioBase * cantidad;

  const nuevaEntrada = {
    id: Date.now(),
    productoNombre: elementoActual.nombre, // del producto → sale de elementoActual
    cliente: inputCliente.value, // de la persona → sale del input, con .value
    cantidad,
    notas: inputNotas.value, // este campo es opcional en el HTML (no tiene "required")
    total,
    fecha: new Date().toLocaleString('es-AR'),
  };

  guardarEnHistorial(nuevaEntrada);
  renderizarHistorial();

  modalDetalle.classList.add('hidden');
  formPedido.reset();
});

btnLimpiarPedidos.addEventListener('click', () => {
  historial = [];
  localStorage.removeItem(CLAVE_STORAGE);
  renderizarHistorial();
});

async function iniciar() {
  historial = leerHistorial();

  productos = await obtenerProductos();
  categorias = await obtenerCategorias();

  renderizarProductos(productos);
  renderizarSelectArray(categorias, filtroCategoria);

  renderizarHistorial();
}

iniciar();
