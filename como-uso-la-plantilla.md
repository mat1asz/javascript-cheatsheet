# Cómo uso la plantilla — mi método paso a paso

## 1. Antes de tocar código: identifico la familia

Me hago una sola pregunta mirando la pantalla o el HTML:

> **¿Hay muchas tarjetas juntas a la vez, o una sola que va cambiando con un botón?**

- Muchas juntas → Familia A
- Una sola + hay un puntaje en algún lado → Familia B

No hace falta leer todo el README para esto. Con mirar la pantalla 5 segundos alcanza.

## 2. Armo mi `aa.md` antes de escribir una sola línea

Abro el `index.html` y anoto TODOS los `id="algo"` que encuentro. Este archivo es mi fuente de la verdad para todo el Paso 1 de la plantilla — nunca invento un nombre de memoria, siempre lo busco ahí.

## 3. Confirmo la forma del JSON antes de escribir el fetch

Con el servidor corriendo (`npm start`), abro la URL del endpoint directo en el navegador (ej: `http://localhost:3000/api/loquesea`) y miro el primer carácter:

- Empieza con `[` → ya es una lista, no toco nada más
- Empieza con `{` → es un objeto agrupado, tengo que aplanarlo antes de guardarlo (agrego un `for...in` + `push` adentro de mi función de fetch)

**Esto no es "siempre es de una forma" — lo tengo que confirmar en cada examen nuevo**, porque depende de cómo esté armado el `server.js` de ese examen puntual. Que me haya dado `[` en Mascotas, GameHub y Biblioteca no significa que me vaya a dar igual en Cafetería o en un examen que todavía no vi.

## 4. Reemplazo los placeholders de la plantilla, uno por uno

Por cada `__ALGO__` que dice la plantilla, me pregunto:

- **`__SELECT_FILTRO__`, `__GRID__`, `__MODAL__`, etc.** → busco en mi `aa.md` el `id` que corresponde
- **`item.__campo_filtro__`** → NUNCA lo pongo por el nombre del `id` del select. Abro el JSON real (o pruebo la URL) y busco cómo se llama la propiedad de verdad, tal cual está escrita ahí (mayúsculas, tildes, todo)
- **El HTML de la tarjeta / del modal / del item de historial** → lo busco siempre con Ctrl+F "PLANTILLA PARA COPIAR Y PEGAR EN JS" en el `index.html`. Esa frase es fija, siempre está. Después leo entre paréntesis cuál de las coincidencias necesito (dice "Renderizado de tarjetas", "Detalle en modal", "Item guardado", etc.)
- **Los campos que guardo en localStorage** → los saco de la sección "Almacenamiento Local" del README, campo por campo, nunca los invento

## 5. Cuando copio el bloque HTML comentado, siempre cambio el nombre de variable

El bloque comentado del `index.html` trae SU PROPIO nombre de variable de ejemplo (puede ser `animal`, `producto`, `sol`, cualquier cosa que haya puesto el profe). Yo tengo que cambiar ESE nombre por el que uso YO en mi propia función en ese momento (casi siempre `item`, o `entrada` si estoy en un `.forEach` del historial).

**La pregunta que me salva siempre:** miro 2-3 líneas arriba en MI código y busco `const ALGO = await obtenerPorId(...)` o `.forEach((ALGO) => {` — esa palabra ALGO es la que tengo que usar en todo el bloque que pegué, no la que traía el HTML de ejemplo.

**Nunca uso `evento.algo` para datos del elemento** — `evento` es el click, no tiene los datos. Los datos están en `item` (o como se llame en esa función puntual).

## 6. Decido si el `<select>` necesita `innerHTML = ''` o no

Miro el HTML real del select: si YA tiene una `<option>` escrita a mano adentro (tipo "Todas las X"), saco esa línea de la plantilla — si no, la dejo.

## 7. Decido si el Commit 5 es formulario o favorito/toggle

Leo la Tabla de Entregas del README, la fila del último commit. Si menciona un `<form>` con datos de una persona → Variante A. Si menciona "agregar/quitar de favoritos" con un botón/estrella → Variante B, sin formulario.

## 8. Antes de dar el examen por terminado

- Ctrl+F de `__` en todo el archivo — si aparece algo, quedó un placeholder sin resolver
- Reviso que no haya dos funciones con el mismo nombre (la segunda pisa a la primera en silencio, sin error)
- Pruebo TODO en el navegador: F12 abierto, catálogo cargado, filtro, modal, guardar, refrescar la página y ver que lo guardado siga ahí, limpiar todo
