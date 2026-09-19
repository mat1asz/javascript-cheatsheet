# 📘 Mi Cheatsheet de JavaScript — Programación II

Esto es todo lo que fui aprendiendo resolviendo los parciales prácticos con la plantilla de Familia A y Familia B. Está armado en mi propio lenguaje, como lo fui entendiendo yo, no como un manual técnico.

La idea es que cuando me trabe en un examen nuevo, entre acá, busque el error o la duda que tengo, y encuentre la solución explicada como ya la entendí una vez.

## Qué hay en este repo

- **`como-uso-la-plantilla.md`** → el método paso a paso, cómo identifico la familia, de dónde saco cada dato, cómo reemplazo cada placeholder
- **`errores-que-me-comi.md`** → todos los bugs reales que cometí en los 5 parciales, con el error tal cual aparece en la consola, por qué pasa, y cómo lo arreglo
- **`plantillas/`** → mis dos plantillas (Familia A y Familia B), actualizadas con todo lo que aprendí
- **Una carpeta por cada examen que resolví** → con el código final y las cosas puntuales de ESE examen (Mascotas, GameHub, Biblioteca, Cafetería, Eventos)

## Las dos familias, resumido

**¿Muchas tarjetas juntas en pantalla, o una sola que va cambiando?**

- Muchas juntas → **Familia A**: catálogo + filtro + modal + formulario/favorito + localStorage. Ejemplos: Cafetería, Eventos, Mascotas, GameHub, Biblioteca.
- Una sola que cambia con un botón "Siguiente" + hay puntaje → **Familia B**: quiz/adivinanza. Ejemplos: Trivia, Dragon Ball, Pokémon.

## Los 5 commits de Familia A (esto siempre es igual)

| Commit | Qué es | Pasos de mi plantilla |
|---|---|---|
| 1 | Vincular el CSS y el JS al HTML | — |
| 2 | Consumir la API con fetch | Pasos 1 a 4 |
| 3 | Renderizar tarjetas y selects | Pasos 5 a 7 |
| 4 | Filtro + modal (+ orden si el examen lo pide) | Pasos 8, 9, 10 (11 si hay cálculo) |
| 5 | Guardar en localStorage (form o favorito) | Pasos 12 a 16 |

**Ojo:** los commits 1, 2 y 3 siempre se agrupan igual. Los commits 4 y 5 pueden variar según lo que pida el README de cada examen puntual — siempre hay que confirmarlo ahí, no asumir.

## La regla de oro de todo esto

**Nunca confío de memoria. Siempre confirmo contra la fuente real:**
- Los `id` del HTML → los saco de mi `aa.md`
- Los nombres de los campos → los saco del JSON real o probando la URL del endpoint en el navegador
- Qué campos van en el objeto que guardo en localStorage → los saco de la sección "Almacenamiento Local" del README
