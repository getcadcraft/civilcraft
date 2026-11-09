---
title: Primeros pasos con CivilCraft
summary: Qué hace CivilCraft, cómo abrirlo y unos primeros diez minutos con el sitio de muestra, desde los puntos hasta curvas de nivel, un camino y un proyecto guardado.
keywords: inicio, primera vez, sitio de muestra, introducción, inicio rápido, tutorial, comenzar, nuevo proyecto
from: c9b6dd8e
---

CivilCraft ha'e ojapo diseño civil ha sitio app, CadCraft familia-gui. Ojeguata topografía puntos ha ojapo superficie (TIN) curvas de nivel ndive, upéi emoĩ alineaciones perfiles de diseño ndive, ojapo camino corredor simple, emoĩ plataformas ojeguata terreno rehe, ojehechaukáva caño gravedad red reglas ndive ha ojehechaukáva corte ha relleno volúmenes. Ojeikuaa ha ojeguarda LandXML, ojeexporta plano DXF-pe ha ojepla'ũ PDF-pe.

Civil 3D ojeikuaa vaekue, mbaʼe ideas ojekuaa: puntos, grupos de puntos, breaklines, alineaciones PI-gui, perfiles PVI-gui, corredores, nivelación, caño redes. Ojeguereko peteĩ jeitáva ha ijetujuvéva: ndaipóri comando línea, ndaipóri estilos ni plano archivo. Ehecha [Desde otro software civil](topic:coming-from) peteĩ jey pe primer trabajo rehe.

## Mbaʼe ojeikotevẽ

- Desktop navegador pyahúva: Chrome, Edge, Firefox térã Safari. Ehecha [Navegadores](common:browsers).
- Mouse térã trackpad ha teclado, térã pantalla táctil: dibujo-pe ojeguereko pantalla botones {{ui:Terminar}}, {{ui:Deshacer punto}} ha {{ui:Cancelar}} (ehecha [Mouse, trackpad y táctil](topic:keyboard#mouse-trackpad-and-touch)).
- Plano 2D dibujado navegador canvas-pe. [Vista 3D](topic:site-3d) navegador WebGL gráficos oñemboguejy; ndoikói jave, estado barra omombe'u mbaʼépa ha plano ojapo oĩma.
- Cuenta ndaipóri, carga ndaipóri. Archivo ordenador-pe oñeabre ha descarga-pe oñeguarda. Ehecha [Tus archivos](common:your-files).

:::note
CivilCraft ko'ágã oñemoĩ navegador-pe temprana versión, oñeñoʼẽva. Desktop versión ndaipóri ko'ágã, nube guardado avei ndaipóri. Mbaʼe ojapo ordenador-pe oikóta peteĩ jey guardá térã exportá peve.
:::

## CivilCraft oñeabre

1. Emboguejy CivilCraft navegador-pe.
2. Esperá pantalla ojehypy: arriba herramientas barra, izquierda panel, medio plano ha derecha **Propiedades** panel.
3. Plano vacío jave ojehecha caja **Empezar con puntos de topografía**. Pasos ojehechaukáva ha enlace {{ui:Abrir el sitio de muestra}}.

Ndaipóri conexión ojeikotevẽramo CivilCraft-pe, emboguejy {{ui:Guardar para usar sin conexión}} app barra-pe ha eha'ã {{ui:Listo para usar sin conexión}}. Oguerekóta ko ayuda, sitio de muestra, 3D ha GIS bibliotecas. Ehecha [Sin conexión](common:offline). Emboguejy {{key:F1}} térã {{ui:Ayuda}} oñemoĩ hag̃ua ayuda app ndive.

## Primeros diez minutos: sitio de muestra

Sitio de muestra peteĩ topografía pequeña US pies-pe: 276 puntos state plane coordenadas-pe, peteĩ cresta, peteĩ zanja flowline ndive ha mokõi bordes de banco. App ndive oĩ, upévare archivo ndeguereko ramo avei eikuaa.

1. Emboguejy {{ui:Abrir el sitio de muestra}} plano-pe caja-pe.
   **Importar puntos** diálogo ojeabre. Omombe'u "276 puntos leídos como PNEZD (de la fila de encabezado), separados por comas." ha ojehechauka primer filas.
2. Emboguejy {{ui:Importar}}.
   Plano oñemoĩ puntos, curvas de nivel ha superficie borde. Estado barra abajo omombe'u puntos ojeguata ha superficie triángulos mbohapy (546).
3. Ehecha panel izquierdo **Puntos** rupi. Puntos oñemboguejy descripción pe primer palabra rupi: CP, FL, GRD, RIDGE, TBN, TBS ha TREE.
4. Tabla **Superficie** columna-pe, emoĩ **FL**, **RIDGE**, **TBN** ha **TBS** {{ui:Línea de quiebre}}-pe.
   Superficie ojapo jey ndaha'évo. **Superficie** datos oñemombe'u "Líneas de quiebre: 4", ha curvas de nivel ojeñorairõ flowline ha cresta-pe ojehecha ndaiporãi ojejuhúta.
5. Ehe mouse plano-pe. Estado barra omombe'u este ha norte ha suelo elevación upe.
6. **Pantalla** rupi, emoĩ {{ui:Curvas de nivel cada}} 0,5 ft-pe ha emoĩ {{ui:Bandas de cota}}. Color ramp oñemoĩ leyenda ndive casillas guýpe. Ojehecha ojepe'ahága bandas apagar.

Ko'ágã terreno existente superficie oĩ. Upe rire, camino.

## Peteĩ camino mombyry ojejapo

1. Emboguejy {{key:A}} (térã {{ui:Alineación}} **Diseño** grupo-pe).
2. Emboguejy mbohapy punto sitio ári, peteĩ peteĩ. Línea roja pointer-pe oñemoĩ ha omombe'u tangente hetaiterei ha rumbo.
3. Emboguejy {{key:Enter}} oñemopaha.
   Alineación oñemoĩ estacionamiento ndive. Derecha panel **Alineación** omombe'u: tuichakue, PI tabla ha curva mbytépe PI-pe (100 ft radio, térã iñeʼẽvéva 100 ft ndojeapytéramo).
4. Derecha panel, **Perfil de diseño** rupi, emboguejy {{ui:Comenzar desde el terreno}}.
   Perfil vista plano guýpe ojeabre terreno existente ha diseño rectángulo nivel punta-gui punta-pe.
5. Emboguejy {{key:I}} {{ui:Agregar PVI}} emyandýpe, upéi emboguejy peteĩ jey perfil vista-pe mbytépe. PVI oñemoĩ.
6. Derecha PVI tabla-pe, emoĩ curva largo (por ejemplo 100) mbytépe PVI **Curva L** casilla-pe ha emboguejy {{key:Enter}}. Perfil ohasa vertical curva ha K valor ojehechaukáva.
7. **Corredor** rupi, tick **Barrer un conjunto a lo largo del perfil de diseño**.
   Camino terreno-pe ojapo: carriles, banquinas ha laderas hasta luz. **Movimiento de tierra** bloque omombe'u corte ha relleno.

Ndaipóri pensá valor ijojaha. Ojehecha número oñemoambue derecha panel-pe, {{key:Mod+Z}} oñemboguejy última cambio.

## Guardá tembiapo

1. Emoĩ héra **Nombre** izquierda panel-pe.
2. Emboguejy {{key:Mod+S}} (térã {{ui:Guardar}}).
   Navegador descarga archivo sitio héra rupi, `.civilcraft.json` ha ojeguerekóva puntos, superficie ajustes, alineaciones, perfiles, corredores, plataformas ha caños.
3. Ojepytyvõ jave, emboguejy {{ui:Abrir}} (térã {{key:Mod+O}}) ha eiporavo upe archivo, térã emoĩ plano-pe.

:::warning
Ndaipóri automático guardado. Pestaña cerrá ndojeguardavéva jave, navegador oporandu ha emoĩ ndoguerekói. Guardá heta jey.
:::

## Mboyve oho

- [Importar puntos de topografía](topic:import-points) ne archivo ndive.
- [Construir y refinar la superficie](topic:build-surface) breaklines ha límite ndive.
- [La pantalla, parte por parte](topic:workspace).
- [Teclas y mouse](topic:keyboard).
