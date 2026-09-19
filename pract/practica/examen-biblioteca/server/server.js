const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const libros = require('./data/libros.json');
const generos = require('./data/generos.json');

// GET /api/libros : devuelve todos los libros del catálogo
app.get('/api/libros', (req, res) => {
  res.json(libros);
});

// GET /api/generos : devuelve la lista de géneros disponibles ({ id, nombre })
app.get('/api/generos', (req, res) => {
  res.json(generos);
});

// GET /api/libros/:id : devuelve la ficha completa de un libro por su ID numérico
app.get('/api/libros/:id', (req, res) => {
  const id = Number(req.params.id);
  const libro = libros.find((l) => l.id === id);
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  return res.json(libro);
});

app.listen(PORT, () => {
  console.log(`Servidor de Biblioteca Comunitaria escuchando en http://localhost:${PORT}`);
});
