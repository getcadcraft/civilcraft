---
title: Herramienta barra referencia
summary: Herramienta barra CivilCraft-pe peteĩteĩ botón, mba'e ojapo, tecla, ha mba'e jave ojejoavy térã ndoñemboguatái.
keywords: barra de herramientas, botones, comandos, herramientas, archivo, exportar, superficie, diseño, editar, vista, menú
from: 4c4352bc
---

Herramienta barra oĩ app ryepýpe mbohapy grupo-pe. Peteĩteĩ botón ohechauka sugerencia ha tecla pasa ndive mouse.

## Archivo

| Botón | Tecla | Mba'e ojapo |
|---|---|---|
| {{ui:New}} | ndaipóri | Oñepyrũ proyecto vacío. Pregunta primero cambio oguarda ndaipóri jave. |
| {{ui:Open}} | {{key:Mod+O}} | Oñeʼẽ puntos archivo (CSV, TXT), LandXML térã CivilCraft proyecto. |
| {{ui:Save}} | {{key:Mod+S}} | Oñongatu proyecto `<name>.civilcraft.json`-pe. |

## Exportar

| Botón | Tecla | Mba'e ojapo |
|---|---|---|
| {{ui:LandXML}} | ndaipóri | Oñongatu `<name>.xml`: puntos, superficies, trazados, perfiles ha red caños LandXML 1.2-pe. "Nothing to export yet." proyecto vacío jave. |
| {{ui:DXF}} | ndaipóri | Oñongatu `<name>.dxf`: plano líneas R12 DXF-pe. |
| {{ui:PDF}} | {{key:Mod+P}} | Oñepyrũ **Plot the plan to PDF**. "Nothing to plot yet." proyecto vacío jave. |

## Superficie

| Botón | Tecla | Mba'e ojapo |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Eapreta puntos relevamiento orden-pe, {{key:Enter}} omboty. Línea de quiebre puntos altura oguereko. |
| {{ui:Boundary}} | {{key:O}} | Eapreta límite exterior esquinas, {{key:Enter}} omboty. Oñeʼẽ límite ojejuhúva. |

Ambos ohechauka "There is no surface yet: open survey points first." superficie ndoguerekóramo.

## Diseño

| Botón | Tecla | Mba'e ojapo |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | Eapreta PI orden-pe, {{key:Enter}} omboty. |
| {{ui:Pad}} | {{key:G}} | Eapreta plataforma esquinas, {{key:Enter}} omboty. Superficie herramientas ndive, superficie ndoguerekóramo advierte; plataforma peteĩ superficie-pe ha'e nivela. |
| {{ui:Pipes}} | {{key:P}} | Eapreta estructuras upstream-gui downstream-pe ({{key:Enter}} omboty); estructura ojuhu jave ojuaʼẽ. |
| {{ui:Profile}} | {{key:R}} | Ohechauka térã oñemboty perfil vista plano ryepýpe. |

## Editar

| Botón | Tecla | Mba'e ojapo |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | Omboguejy última cambio (200 peve). Grisáceo mba'e ndaipóri jave. |
| {{ui:Redo}} | {{key:Mod+Y}} | Oñeʼẽ mboguejýva. Grisáceo ndaipóri jave. |
| {{ui:Copy}} | {{key:Mod+C}} | Copia eheja puntos relevamiento, portapapeles-pe filas planilla formato-pe. Grisáceo punto eheja'ỹ jave. |
| {{ui:Paste}} | {{key:Mod+V}} | Pega puntos: puntero oipyre'a, eapreta oñemoĩ números ojuhúva. Planilla-gui copiadas filas pega. |
| {{ui:More}} | ndaipóri | Oñeʼẽ menú ipype. |

Menú {{ui:More}}:

| Ítem | Tecla | Mba'e ojapo |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Copia eheja puntos ha omboty (peteĩ paso undo). |
| {{ui:Copy}} | {{key:Mod+C}} | Botón {{ui:Copy}} rehe. |
| {{ui:Paste}} | {{key:Mod+V}} | Botón {{ui:Paste}} rehe. |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | Pega puntos ijehegui koordenadas-pe, números ojuhúva. |
| {{ui:Duplicate}} | {{key:Mod+D}} | Eheja puntos copia puntero oipyre'a; eapreta oho jave. Portapapeles ndojepe'ái. |
| {{ui:Delete}} | {{key:Delete}} | Omboty eheja puntos relevamiento térã eheja trazado, plataforma, estructura (caños ndive), caño térã PVI. |
| {{ui:Select all points}} | {{key:Mod+A}} | Eheja puntos relevamiento opaite. |
| {{ui:Select none}} | {{key:Esc}} | Omboguejy eleción. |

Mba'e ndaikatúva ojapo ko'ẽrõ grisáceo, ipista ohechauka mba'eporã. Detalle: [Seleccionar, copiar y pegar puntos de relevamiento](topic:copy-paste-points).

Undo ojejoavy diseño, superficie configuración ha puntos relevamiento cambio-kuéra (pegar, cortar, duplicar, omboty). Ndojejoavýi pantalla configuración, ni archivo abrir térã importar jave ndojepe'ái.

## GIS

| Botón | Tecla | Mba'e ojapo |
|---|---|---|
| {{ui:Coordinates}} | ndaipóri | Oñeʼẽ diálogo **Sistema de coordenadas**: emoĩ proyecto sistema, térã terreno local coordenadas. Ver [Emoĩ proyecto sistema de coordenadas](topic:coordinate-systems) ha [Coordenadas terreno ha locales](topic:ground-and-local-coordinates). |
| {{ui:Import}} | ndaipóri | Importa GIS datos: shapefile, GeoJSON, GeoPackage, elevación cuadrícula ha LiDAR. Ver [Importar datos GIS](topic:gis-import). |
| {{ui:Export}} | ndaipóri | Exporta conforme a obra datos GIS departamento-pe. Ver [Exportar conforme a obra datos GIS](topic:gis-export). |
| {{ui:Analyze}} | ndaipóri | Oñeʼẽ GIS análisis panel: buffer, superposición, unión espacial, selección por atributo, medida. Ver [Analizar capas GIS](topic:gis-analysis). |
| {{ui:Attribute table}} | ndaipóri | Superficie › More-pe. Oñeʼẽ GIS capa tabla atributo: ordenar, filtrar, eheja, editar, campo agregar, calcular, CSV-pe oñongatu. Ver [Trabajar con tabla de atributos](topic:gis-table). |
| {{ui:Map}} | ndaipóri | Oñeʼẽ **Capas del mapa** diálogo: georreferenciado imagen, térã mapa servidor agregado, plano ryepýpe. Ver [Mostrar capas de mapa bajo el plano](topic:map-layers). |

GIS herramienta oñemboguata primera vez oñeʼẽ botón ha, GIS archivo oñeʼẽ jave, térã proyecto coordenadas sistema térã GIS capas oguerekóramo.

## Vista

| Botón | Tecla | Mba'e ojapo |
|---|---|---|
| {{ui:Select}} | {{key:V}} térã {{key:Esc}} | Eapreta eheja trazados, plataformas, estructuras, caños ha puntos ({{key:Shift}} ha eapreta térã arrastrá agrega puntos); arrastrá agarre mover PI, plataforma esquina ha estructuras. |
| {{ui:Fit}} | {{key:F}} | Plano zoom superficie, puntos, trazados ha plataformas ohechauka (3D-pe: opaite ohechauka). |
| {{ui:3D}} | {{key:D}} | Sitio 3D plano ryepýpe ohechauka térã plano-pe oguahẽ. 3D vista ryepýpe barra vista, exageración, color ha ohechaukáva ojapo, GLB térã OBJ oñongatu. Ver [Ver sitio en 3D](topic:site-3d). |

## Botones paneles-pe

| Botón | Dónde | Mba'e ojapo |
|---|---|---|
| {{ui:Open the sample site}} | Caja plano vacío-pe | Oñemboguata relevamiento muestra (conexión ojeporeka, CivilCraft offline ndaipóri jave) |
| {{ui:Remove the boundary}} | Panel izquierdo, Superficie | Omboty límite exterior |
| {{ui:Remove drawn breaklines}} | Panel izquierdo, Superficie | Omboty líneas de quiebre herramienta-pe dibujadas (grupos ndaiporiva) |
| {{ui:Rebuild the surface from the points}} | Panel izquierdo, Superficie (LandXML superficie-pe) | Omboty LandXML TIN ha puntos rupi ojapo; ndojejoavýi |
| {{ui:Start from the ground}} | Panel derecho, Trazado | Oñepyrũ diseño perfil PVI terreno rehe peteĩteĩ extremo-pe |
| {{ui:Profile view}} | Panel derecho, Trazado | Oñeʼẽ perfil vista trazado-pe |
| {{ui:Add PVIs}} | Barra perfil | Apretado mboyve, perfil peteĩ eapreta PVI agrega |
| {{ui:Set every invert from the rules}} | Panel derecho, Red de caños | Fija todas caños cotas de fondo reglas-gui |
| {{ui:Set its inverts from the rules}} | Panel derecho, Caño | Fija ko caño cotas de fondo reglas-gui |
