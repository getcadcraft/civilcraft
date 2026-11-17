---
title: Trazar el plano a PDF
summary: Trazar todo o la vista actual a un PDF vectorial en una hoja estándar a escala de ingeniería o métrica, con colores de capa o en negro.
keywords: trazar, imprimir, pdf, hoja, escala, tamaño de papel, hoja de plano, publicar, cajetín, flecha norte, barra de escala
from: 9af396ca
---

{{ui:PDF}} traza el plano a un PDF vectorial en una hoja, con cajetín, flecha norte y barra de escala. El PDF se genera en el navegador y se descarga; no pasa por el diálogo de impresión del navegador.

## Trazar

1. Configure el plano en **Visualización**: la superficie que se muestra, el intervalo de curvas de nivel y qué cosas están activas. El trazado sigue esta configuración.
2. Si quiere solo una parte del sitio, haga zoom y desplácese por el plano hasta ella.
3. Haga clic en {{ui:PDF}} en el grupo **Exportar**, o presione {{key:Mod+P}}.
   Se abre el diálogo **Trazar el plano a PDF**.
4. Elija el **Área**: {{ui:Everything}} o {{ui:What is on screen}}.
5. Elija el **Papel**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 o A1. Un proyecto en pies empieza con Tabloid, uno en metros con A3. Las hojas siempre van horizontales.
6. Elija la **Escala**. La lista marca con "(entra)" la mayor escala que cabe y la selecciona.
   - Pies: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metros: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Elija la **Tinta**: {{ui:Layer colors}} o {{ui:Black}}.
8. Lea la línea debajo de las opciones. Indica el tamaño del área en papel y el tamaño de la hoja, por ejemplo "El área es 297 × 222 mm a 1" = 40' en una hoja de 432 × 279 mm (horizontal)."
9. Haga clic en {{ui:Download PDF}}.
   El navegador descarga `<name>.pdf`. La barra de estado dice "Trazado <name>.pdf a 1" = 40'."

Si el área es más grande que la hoja a la escala elegida, el trazado se centra y los bordes se cortan. Elija la escala marcada "(entra)" o una hoja más grande.

## Qué hay en la hoja

- El plano, centrado en el área de dibujo, como vectores reales: curvas de nivel, rótulos, trazados con numeración de estaciones, corredores, plataformas y líneas de corte, caños, puntos.
- Grosores de línea por capa: trazados, plataformas y caños más gruesos; triángulos y curvas menores, finos.
- Un cajetín a lo largo de la parte inferior con el **Nombre** del proyecto, la escala, una nota del intervalo de curvas de nivel y qué superficie (existente o nivelada), y la fecha y la versión a la derecha.
- Una flecha norte en la esquina superior derecha (el norte del plano está arriba) y una barra de escala en el cajetín.
- Las capas de mapa que se muestran bajo el plano (una imagen, teselas de mapa o un servicio de mapas), cuando está marcado **Capas de mapa bajo el plano**: se dibujan como una sola imagen de toda el área de dibujo a 150 puntos por pulgada, bajo las líneas, y la atribución de un mapa va en el cajetín. CivilCraft espera hasta 8 segundos a las imágenes de mapa que todavía llegan; si faltan algunas, la barra de estado lo indica.

El texto usa la Helvetica incorporada del PDF. Los caracteres fuera del conjunto de Europa Occidental (Windows-1252) se imprimen como "?", y el mensaje de estado los cuenta.

## Qué no se traza

- Bandas de elevación.
- La vista de perfil. Trazar perfiles todavía no está disponible.
- Más de una hoja (para un alineamiento, use [hojas de planta y perfil](topic:plan-profile-sheets)), viewports, un cajetín personalizado o hojas verticales.

:::note
El diálogo indica que las flechas de pendiente son solo de pantalla. En esta versión, las flechas de pendiente activadas en **Visualización** sí se trazan (y se exportan a DXF). Desactívelas antes de trazar si no las quiere.
:::

## Imprimir en papel

Abra el PDF descargado en cualquier visor de PDF e imprímalo al 100 % (tamaño real) para que la escala quede verdadera. "Ajustar a la página" cambia la escala.
