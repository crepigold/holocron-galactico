# Holocrón Galáctico — Archivo del universo

Reconstrucción del lore del universo de Rilur, Dubitsa, Vinica y Andalus, hecha el 2 de octubre de 2026.

## Qué hay aquí

| Archivo | Para qué sirve |
|---|---|
| `Holocron_Galactico.html` | **La web completa en un solo archivo.** Ábrela con doble clic, sin necesidad de internet (solo las fuentes tipográficas vienen de la red). |
| `BIBLIA_CANON.md` | La Biblia completa en texto: Tomos narrados, facciones, personajes, batallas, lugares, cronología, glosario y registro de canon. |
| `lore.json` | Los mismos datos en JSON, listos para cargarlos en un motor de videojuego. |
| `00_CANON_ORIGINAL_RECUPERADO.md` | El texto **literal** de tu web original de Neocities. Es la referencia que manda sobre todo lo demás. |
| `lore_rilur_*.md` | Las notas de reconstrucción anteriores (escritas de memoria; menos fiables). |
| `web/` | Código fuente de la web. |
| `web/datos/*.js` | **Aquí vive el lore.** Si cambias algo, cámbialo aquí. |
| `herramientas/construir.js` | Regenera la Biblia, el JSON y la web de un solo archivo. |

## Marcas de canon

- **Original:** texto literal de la web de 2025.
- **Autor 2026:** decisiones que tomaste al responder las preguntas de la reconstrucción.
- **Propuesta:** detalles inventados para unir las piezas. En los datos van `{entre llaves}`, en la web aparecen subrayados con puntos y en la Biblia llevan el signo †.

Para **aprobar** una propuesta, quita las llaves en `web/datos/*.js`. Para **cambiarla**, reescribe el texto. Después, en la página Canon de la web o en el final de `BIBLIA_CANON.md`, tienes la lista de propuestas y preguntas abiertas.

## Cómo editar y regenerar

1. Edita los archivos de `web/datos/`.
2. Ejecuta:

```bash
node herramientas/construir.js
```

El script comprueba que todas las referencias (personajes, batallas, lugares, facciones) existen y que las llaves están cerradas. Después regenera `BIBLIA_CANON.md`, `lore.json` y `Holocron_Galactico.html`.
