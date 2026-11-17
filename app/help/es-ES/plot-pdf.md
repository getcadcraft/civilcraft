---
title: Trazar el plano a PDF
summary: Trazar todo o la vista actual a un PDF vectorial en una hoja estándar, a escala de ingeniería o métrica, en colores de capa o en negro.
keywords: trazar, imprimir, pdf, hoja, escala, tamaño de papel, hoja de plano, publicar, cajetín, flecha norte, escala gráfica
from: 9af396ca
---

{{ui:PDF}} traza el plano a un PDF vectorial en una hoja, con un cajetín, una flecha norte y una escala gráfica. El PDF se genera en el navegador y se descarga; no pasa por el diálogo de impresión del navegador.

## Trazar

1. Prepare el plano en **Visualización**: la superficie mostrada, el intervalo de curvas de nivel y qué elementos están activos. El trazado sigue estos ajustes.
2. Si quiere solo una parte del sitio, haga zoom y desplace el plano hasta ella.
3. Pulse {{ui:PDF}} en el grupo **Exportar**, o pulse {{key:Mod+P}}. Se abre el diálogo **Trazar el plano a PDF**.
4. Elija el **Área**: {{ui:Todo}} o {{ui:Lo que está en pantalla}}.
5. Elija el **Papel**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 o A1. Un proyecto en pies empieza en Tabloid; uno en metros, en A3. Las hojas siempre son apaisadas.
6. Elija la **Escala**. La lista marca con "(encaja)" la mayor escala que cabe y la selecciona.
   - Pies: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metros: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Elija la **Tinta**: {{ui:Colores de capa}} o {{ui:Negro}}.
8. Lea la línea bajo las opciones. Indica el tamaño del área en papel y el de la hoja, por ejemplo: "El área mide 297 × 222 mm a 1" = 40' en una hoja de 432 × 279 mm (apaisada)."
9. Pulse {{ui:Descargar PDF}}.
   El navegador descarga `<name>.pdf`. La barra de estado indica "Trazado <name>.pdf a 1" = 40'".

Si el área es mayor que la hoja a la escala elegida, el trazado se centra y los bordes quedan cortados. Elija la escala marcada "(encaja)" o una hoja mayor.

## Lo que hay en la hoja

- El plano, centrado en el área de dibujo, como vectores reales: curvas de nivel, etiquetas, ejes con numeración de P.K., corredores, plataformas y líneas de talud, tuberías, puntos.
- Grosores de línea por capa: ejes, plataformas y tuberías más gruesos; triángulos y curvas de nivel secundarias, finos.
- Un cajetín en la parte inferior con el **Nombre** del proyecto, la escala, una nota del intervalo de curvas de nivel y de qué superficie (existente o proyectada), y la fecha y la versión a la derecha.
- Una flecha norte en la esquina superior derecha (el norte del plano queda arriba) y una escala gráfica en el cajetín.
- Las capas de mapa mostradas bajo el plano (una imagen, teselas de mapa o un servicio de mapas), cuando está marcada **Capas de mapa bajo el plano**: se dibujan como una sola imagen de toda el área de dibujo a 150 ppp, bajo las líneas, y la atribución de un mapa va en el cajetín. CivilCraft espera hasta 8 segundos a las imágenes de mapa que siguen llegando; si faltan algunas, la barra de estado lo indica.

El texto usa la fuente Helvetica integrada en el PDF. Los caracteres fuera del juego de caracteres de Europa occidental (Windows-1252) se imprimen como "?", y el mensaje de estado los cuenta.

## Lo que no se traza

- Las bandas de cota.
- La vista de perfil. El trazado de perfiles todavía no está disponible.
- Más de una hoja (para un eje, use [hojas de planta y perfil](topic:plan-profile-sheets)), ventanas gráficas, un cajetín personalizado o hojas en vertical.

:::note
El diálogo indica que las flechas de pendiente son solo de pantalla. En esta versión, las flechas de pendiente activadas en **Visualización** sí se trazan (y se exportan a DXF). Desactívelas antes de trazar si no las quiere.
:::

## Imprimir en papel

Abra el PDF descargado en cualquier visor de PDF e imprímalo al 100 % (tamaño real) para que la escala sea correcta. "Ajustar a la página" cambia la escala.
