---
title: Trazar el plano a PDF
summary: Trace todo o la vista actual a un PDF vectorial en una hoja estándar a escala de ingeniería o métrica, en colores de capa o en negro.
keywords: trazar, imprimir, pdf, hoja, escala, tamaño de papel, hoja de plano, publicar, cajetín, flecha de norte, barra de escala
from: 9af396ca
---

{{ui:PDF}} traza el plano a un PDF vectorial en una hoja, con un cajetín, una flecha de norte y una barra de escala. El PDF se genera en el navegador y se descarga; no pasa por el cuadro de diálogo de impresión del navegador.

## Trazar

1. Configure el plano en **Visualización**: la superficie mostrada, el intervalo de curvas de nivel y qué elementos están activos. El trazado sigue estas configuraciones.
2. Si quiere solo una parte del sitio, haga zoom y encuadre el plano en ella.
3. Haga clic en {{ui:PDF}} en el grupo **Exportar**, o pulse {{key:Mod+P}}.
   Se abre el cuadro de diálogo **Trazar el plano a PDF**.
4. Elija el **Área**: {{ui:Todo}} o {{ui:Lo que está en pantalla}}.
5. Elija el **Papel**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 o A1. Un proyecto en pies empieza con Tabloid, y uno en metros, con A3. Las hojas siempre van en horizontal.
6. Elija la **Escala**. La lista marca con "(ajusta)" la escala más grande que cabe y la selecciona.
   - Pies: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metros: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Elija la **Tinta**: {{ui:Colores de capa}} o {{ui:Negro}}.
8. Lea la línea debajo de las opciones. Indica el tamaño del área en papel y el de la hoja, por ejemplo: "El área mide 297 × 222 mm a 1" = 40' en una hoja de 432 × 279 mm (horizontal)."
9. Haga clic en {{ui:Descargar PDF}}.
   El navegador descarga `<name>.pdf`. La barra de estado indica "Trazado <name>.pdf a 1" = 40'."

Si el área es más grande que la hoja a la escala elegida, el trazado se centra y los bordes se cortan. Elija la escala marcada con "(ajusta)" o una hoja más grande.

## Lo que contiene la hoja

- El plano, centrado en el área de dibujo, como vectores verdaderos: curvas de nivel, etiquetas, alineaciones con cadenamiento, obras lineales, plataformas y líneas de talud, tuberías y puntos.
- Grosores de línea por capa: alineaciones, plataformas y tuberías más gruesas; triángulos y curvas de nivel secundarias, finos.
- Un cajetín a lo largo de la parte inferior con el **Nombre** del proyecto, la escala, una nota del intervalo de curvas de nivel y de la superficie (existente o de proyecto), y a la derecha la fecha y la versión.
- Una flecha de norte en la esquina superior derecha (el norte del plano queda arriba) y una barra de escala en el cajetín.
- Las capas de mapa mostradas bajo el plano (una imagen, teselas de mapa o un servicio de mapas), cuando **Capas de mapa bajo el plano** está marcada: se dibujan como una sola imagen de toda el área de dibujo a 150 puntos por pulgada, bajo las líneas, y la atribución de un mapa va en el cajetín. CivilCraft espera hasta 8 segundos a las imágenes de mapa que aún llegan; si faltan algunas, la barra de estado lo indica.

El texto usa la fuente integrada Helvetica del PDF. Los caracteres fuera del conjunto de Europa occidental (Windows-1252) se imprimen como "?", y el mensaje de estado los cuenta.

## Lo que no se traza

- Bandas de elevación.
- La vista de perfil. El trazado de perfiles todavía no está disponible.
- Más de una hoja (para una alineación, use [hojas de planta y perfil](topic:plan-profile-sheets)), ventanas gráficas, un cajetín personalizado u hojas en vertical.

:::note
El cuadro de diálogo indica que las flechas de pendiente solo se ven en pantalla. En esta versión, las flechas de pendiente activadas en **Visualización** sí se trazan (y se exportan a DXF). Desactívelas antes de trazar si no las quiere.
:::

## Impresión en papel

Abra el PDF descargado en cualquier visor de PDF e imprímalo al 100 % (tamaño real) para que la escala se mantenga. "Ajustar a la página" cambia la escala.
