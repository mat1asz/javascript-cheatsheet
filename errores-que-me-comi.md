# Errores que me comí — con la consola y la solución

Esta es la lista de TODOS los bugs reales que cometí resolviendo los 5 parciales. La idea es: si me trabo con algo parecido, vengo acá, busco el error de consola o la situación, y encuentro cómo lo resolví la vez pasada.

---

## 1. Llamar a una función con un nombre que no es (o que quedó con placeholder)

**Dónde me pasó:** GameHub y Biblioteca, siempre en `iniciar()`, casi siempre al final de todo el examen.

**Cómo se ve en la consola:**
```
Uncaught ReferenceError: renderizarJuegos__ is not defined
```
o
```
Uncaught ReferenceError: obtenerLibros__ is not defined
```

**Por qué pasa:** dejé sin terminar de reemplazar un `__algo__` de la plantilla, y esa función en realidad se llama distinto (sin los guiones bajos, o con otro nombre que yo mismo le puse antes).

**Cómo lo soluciono:** busco (Ctrl+F) el nombre exacto que le puse a esa función cuando la escribí antes en el archivo, y uso ESE nombre exacto donde la estoy llamando.

**Cómo lo evito:** el ÚLTIMO paso, siempre, antes de dar el examen por terminado, es Ctrl+F de `__` en todo el archivo.

---

## 2. Usar `evento.algo` en vez de `item.algo` (o `entrada.algo`) dentro de un template literal

**Dónde me pasó:** GameHub, Biblioteca, y una vez en Mascotas — siempre en el modal (Paso 9), a veces en el historial.

**Cómo se ve:** esto NO tira error en consola. El navegador te muestra "undefined" en el texto donde debería aparecer el dato. Es un bug silencioso, hay que mirarlo con los ojos en la pantalla.

**Por qué pasa:** en la función donde abro el modal, tengo el parámetro `evento` (el del click) Y la variable `item` (el objeto con los datos) al mismo tiempo. Mi mano escribe `evento` porque es la palabra que veo primero, arriba de todo en la declaración de la función (`async (evento) => {`).

**Cómo lo soluciono:** subo la vista 2-3 líneas dentro de la MISMA función y busco la línea `const item = await obtenerPorId(...)` — esa es la variable que tengo que usar en todo el `${...}` de ahí abajo, nunca `evento`.

**La regla:** `evento` solo se usa para leer `evento.target` (para saber qué clickearon). Todo lo demás (los datos que se muestran) sale de `item`.

---

## 3. Variable usada pero nunca declarada (`esFavorito`, `textoBuscado`, `inputBusqueda`)

**Cómo se ve en la consola:**
```
Uncaught ReferenceError: esFavorito is not defined
```

**Por qué pasa:** o me olvidé de crear la variable antes de usarla (caso `esFavorito` en GameHub), o dejé una línea de la plantilla que usa algo que en este examen no existe (caso `textoBuscado`/`inputBusqueda`, cuando el examen no tiene buscador de texto).

**Cómo lo soluciono:**
- Si la variable la necesito de verdad (como `esFavorito`, porque el HTML comentado la usa en un `${condicion ? 'x' : 'y'}`) → la declaro ANTES del `return`, con `historial.some((fav) => fav.id === item.id)`
- Si la variable no la necesito (no existe ese input en este examen) → borro la línea entera, no la dejo comentada

**Cómo sé si hace falta declarar algo:** miro el bloque HTML comentado — si tiene un `${algo ? 'x' : 'y'}`, esa variable la tengo que crear yo con `.some()` antes del return. Si no tiene nada así, no hace falta nada.

---

## 4. Buscar un input con `querySelector('#nombre')` en vez de usar la constante que ya declaré

**Cómo se ve en la consola:**
```
Uncaught TypeError: Cannot read properties of null (reading 'value')
```

**Por qué pasa:** inventé un `id` que no existe (`#nombre`) en vez de usar la constante que ya había declarado en el Paso 1 con el `id` REAL (`inputNombreAdoptante`).

**Cómo lo soluciono:** si ya declaré `const inputNombreAdoptante = document.getElementById('inputNombreAdoptante');` en el Paso 1, uso esa constante directo. Nunca vuelvo a buscar el elemento con `querySelector` inventando un id nuevo.

**Cómo leo un input:** siempre es `nombreDeLaConstante.value` — el `.value` es fijo, siempre se escribe igual, es lo que el usuario tipeó adentro de esa cajita.

---

## 5. Clave repetida en un objeto (`{ id: A, id: B }`)

**Cómo se ve:** NO tira ningún error. JavaScript se queda calladito con el último valor de las dos claves repetidas. Es de los bugs más peligrosos porque no se nota en consola, solo mirando el dato guardado.

**Dónde me pasó:** Biblioteca, en el objeto que armaba en el submit del formulario.

**Cómo lo soluciono:** antes de dar por terminado un objeto literal, cuento las claves una por una y las comparo contra la lista exacta que pide el README (sección "Almacenamiento Local") — ni una repetida, ni una de más, ni una de menos.

---

## 6. Copiar un campo o una variable que pertenece a la plantilla de cálculo, en un examen que no tiene cálculo

**Ejemplo real:** `titulolibro: total` (Biblioteca) — `total` es una variable que existe solo cuando hay cantidad × precio, y este examen no tenía nada de eso.

**Cómo se ve:**
```
Uncaught ReferenceError: total is not defined
```

**Por qué pasa:** cuando escribo rápido, a veces mi mano copia de memoria el patrón de otro examen que sí tenía cálculo, en vez de mirar lo que YO mismo decidí en el Paso 1 y Paso 11 de ESTE examen puntual.

**Cómo lo soluciono:** repaso qué decidí en el Paso 1 (¿existe `__CANTIDAD__`?) y en el Paso 11 (¿hay cálculo en este examen?) antes de escribir el Paso 14. Si en el Paso 1 ya saqué esas constantes, en el Paso 14 tampoco pueden aparecer.

---

## 7. Dos funciones con el mismo nombre

**Cómo se ve:** NO tira error. La segunda declaración pisa a la primera en silencio — la primera queda escrita ahí pero nunca se ejecuta, por más que la llame.

**Dónde me pasó:** GameHub, tenía dos `async function obtenerPorId(...)` — una que en realidad era para filtrar por plataforma (que ni hacía falta) y otra que sí era la correcta (traer por id).

**Cómo lo soluciono:** antes de escribir una función nueva, hago Ctrl+F de ese nombre — si ya existe, algo está mal: o le puse mal el nombre a la nueva, o ya no la necesito y hay que borrarla.

---

## 8. Vincular el CSS y el JS sin la carpeta en la ruta (Commit 1)

**Cómo se ve en la consola (F12):**
```
Refused to apply style from 'http://127.0.0.1:5500/styles.css' because its MIME type ('text/html') is not a supported stylesheet MIME type
Failed to load resource: the server responded with a status of 404 (Not Found)
```

**Por qué pasa:** escribí `href="styles.css"` en vez de `href="css/styles.css"` — el navegador busca el archivo en la carpeta raíz, pero en realidad está una carpeta adentro (`css/`).

**Cómo lo soluciono:** las dos líneas siempre llevan el nombre de la carpeta antes:
```html
<link rel="stylesheet" href="css/styles.css" />
<script src="js/script.js" defer></script>
```

**Me pasó dos veces en el mismo examen** (una vez la primera vuelta, otra vez practicando de nuevo desde cero) — es un error fácil de repetir cuando escribo de memoria en vez de copiar con cuidado.

---

## 9. El puerto 3000 ocupado por otro servidor viejo

**Cómo se ve en la consola:**
```
Access to fetch at 'http://localhost:3000/api/animales' from origin 'http://127.0.0.1:5500' has been blocked by CORS policy
GET http://localhost:3000/api/animales net::ERR_FAILED 401 (Unauthorized)
```

**Por qué pasa:** dejé corriendo el servidor de OTRO examen de práctica en una terminal vieja, y ese servidor sigue "ocupando" el puerto 3000 — entonces mi examen actual no puede levantar su propio servidor ahí.

**Cómo lo soluciono:**
1. Busco la terminal vieja y le doy `Ctrl+C`
2. Si no la encuentro: `lsof -i :3000` para ver qué proceso está usando ese puerto, y `kill -9 ESE_PID`
3. Recién ahí arranco `npm start` del examen que quiero resolver ahora

**La regla:** antes de arrancar un examen nuevo, me fijo que no tenga ningún servidor viejo corriendo de antes.

---

## 10. Filtrar contra el `value` de un `<select>` sin fijarme cómo lo armó el backend (slug)

**Dónde me pasó:** Eventos.

**Cómo se ve:** no tira error. El filtro simplemente nunca encuentra ningún resultado quedando en "" vacío, salvo cuando elijo la opción "Todos".

**Por qué pasa:** el backend arma el `value` de cada `<option>` transformando el género a minúscula y con guiones (`"rock-indie"`), pero el campo real del evento en el JSON tiene el género con mayúscula y espacio (`"Rock Indie"`). Comparar los dos tal cual nunca da igual.

**Cómo lo soluciono:** le aplico al campo del evento la MISMA transformación que usa el backend, antes de comparar:
```javascript
const coincideFiltro1 = filtro1 === '' || item.genero.toLowerCase().replace(/[\s/]+/g, '-') === filtro1;
```

**La regla:** cuando comparo contra el `value` de un select que vino de una API, siempre reviso primero cómo se armó ese `value` en el backend — puede no ser el texto tal cual, puede venir normalizado (slug, minúscula, con guiones).

---

## 11. Buscar solo en un campo cuando el README pide buscar en varios

**Dónde me pasó:** Eventos — el README pedía "buscar por nombre O artista", pero yo solo comparaba `item.nombre`.

**Cómo lo soluciono:** agrego el segundo campo con un `||`:
```javascript
const coincideTexto = item.nombre.toLowerCase().includes(textoBuscado) || item.artista.toLowerCase().includes(textoBuscado);
```

**La regla:** cuando el README dice "buscar por X o Y", son dos condiciones separadas por `||`, no una sola.

---

## 12. Usar el id de un elemento del DOM como si fuera un campo del objeto de datos

**Dónde me pasó:** Eventos — escribí `elementoActual.compraContent` pensando que era un dato del evento, pero `compraContent` en realidad era el `id` de un `<div>` del modal, no una propiedad del objeto evento.

**Cómo se ve:**
```
Uncaught TypeError: Cannot read properties of undefined
```
o el resultado del cálculo te da `NaN`.

**Cómo lo soluciono:** repaso el JSON real del elemento y uso el campo que sí existe ahí (en este caso, `elementoActual.precio`).

**La regla:** un nombre de variable/constante del DOM (`compraContent`, `catalogoGrid`) NUNCA es lo mismo que un campo de un objeto de datos (`item.precio`, `item.nombre`) — aunque suenen parecido, son cosas totalmente distintas.

---

## 13. `.dataset.id` siempre es texto, aunque el id real sea un número

**Por qué importa:** si comparo `item.id === boton.dataset.id` así nomás, nunca va a dar `true`, porque uno es número (`5`) y el otro es texto (`"5"`).

**Cómo lo soluciono:** convierto con `Number(...)` antes de comparar:
```javascript
const id = Number(boton.dataset.id);
```

---

## 14. Copiar la plantilla genérica de "vaciar el select" sin fijarme si ya tenía una opción hardcodeada

**Cómo se ve:** el select pierde la opción "Todas las X" apenas carga la página, sin ningún error en consola.

**Cómo lo soluciono:** antes de decidir si dejo o saco el `elementoSelect.innerHTML = '';`, miro el HTML real: si el `<select>` YA tiene una `<option>` escrita a mano adentro, saco esa línea. Si nace vacío, la dejo.
