---
title: Nubes de puntos desde dron o escáner
summary: Con el complemento Nubes de puntos, abrí un archivo LAS o LAZ con millones de puntos, mirá todo, limpialo, ordenalo en terreno, vegetación y edificios, y armá con él el terreno, las curvas de nivel y los volúmenes.
keywords: nube de puntos, las, laz, dron, fotogrametría, recap, lidar, escaneo, terreno, clasificar, ruido, acopio, volumen, corte y relleno, curvas de nivel, línea de quiebre, eye-dome, ortomosaico, ortho, drapeado, capa de mapa, exportar las, exportar laz, comprimir
from: e4a4901f
---

Heta persóna ndoikotevẽi kóva, upévare ha'e complemento. Ejapo {{ui:Nubes de puntos}} en Configuración › Complementos; pa'ũme panel derecho ojeporu {{ui:Nubes de puntos}}. Archivo oñeleelaha nde navegadór rupi ha oñemoñe'ẽ mosaico rehegua, nde navegadór ryru almacenamiento (térã peteĩ carpeta ndepuraha). **Ndaipórivi ojeinvia.**

:::warning
Opa ko pestaña oinforma ha'e peteĩ número nde datos rehegua, ndaha'éi certificado. Oñeprobá peteĩ sitio ñemoñare ndaha'éi peteĩ vuelo real de dron: emaña porã umi primer resultado ha eñeʼẽ ore rehe. Umi profesional registrado ohechauka mba'épa terreno, curvas de nivel ha volúmenes ojeporúva.
:::

## Abrir peteĩ nube

Pe {{ui:Abrir una nube}} ejeporavo peteĩ archivo LAS térã LAZ. Pestaña oñeʼẽ cuántos puntos oguereko, su sistema de coordenadas y unidades, ha cuánto espacio ojeporúta peteĩ construcción; eapreta {{ui:Construir la nube}}. Peteĩ construcción ikatu oñemopaʼũ ha ojeku'ẽ {{ui:Reanudar}} (eleki pe mismo archivo). Archivo ndoñemoambuéi. Peteĩ archivo 100 millón punto rehegua ojapo minuto mbovy pe estación de trabajo ha oiko hetave pe archivo tamaño.

Pe {{ui:Nubes en esta computadora}} epoi térã epa'ũ peteĩ nube. {{ui:Guardar nubes en una carpeta…}} (Chrome, Edge ha aplicación Studio) oguarda pe tile carpeta ejecógui, ko'ã ojekuaáva Documentos ryru carpeta de nubes de CadCraft, upévare peteĩ nube 10 GB ndoikotevéi oikekue navegadór almacenamiento-pe; nube oñemoĩva ymaguaréva oĩ hi'ãvo. Navegadór oñemaneʼẽ jey permiso ojerereko jepe reinicio rire: eapreta {{ui:Usar la carpeta … otra vez}}.

## Mirá

{{ui:Mirá en 3D}} omoĩ nube tile mbovy rupive ha omopyahu eke nde ndive, nunca más de {{ui:Puntos más dibujados}} peteĩ jey (2.5 millón; 500 mil teléfono-pe). Color ojeporúta archivo propio color, altura, clase, intensidad térã residuo. {{ui:Iluminación eye-dome}} omosombrea borde profundidad rehe, upévare forma ohechauka normal ndoikotevéi (ndojeporúi teléfonope). {{ui:Puntos se achicán con la distancia}} omoñẽ'ẽ pe mbykýva ha pe ñemiʼỹva omboguasu; {{ui:Tamaño de punto}} ohechauka tamaño. Plano oha'arõ nube raster rehegua nde dibujo guýpe ha **omopyahu eke nde zoom ojeporúvo** peteĩ pe parte rehegua.

## Limpiá

Pe {{ui:Limpiar}} emoĩ lazo, caja térã polígono plano-pe (térã 3D-pe vista superior rupi: 3D-pe contorno ojeikuaa mbyteve, upévare exacto ha'e tuichave vista superior rupi). Pestaña oñeʼẽ cuántos punto oĩ **antes** de aplicar: {{ui:Eliminar estos puntos}}, {{ui:Cambiar su clase}}, {{ui:Restaurar puntos eliminados}} térã {{ui:Recortar a este límite}}. {{ui:Deshacer}} ha {{ui:Rehacer}} oheka registro de edición; archivo ndoñemoambuéi. {{ui:Filtro de ruido…}} omarca punto perdido ha'e punto bajo (clase 7) térã ruido alto (clase 18).

## Ordenar

{{ui:Encontrar el terreno}} oikuaa mbovy ha mboyve, omarca terreno (clase 2) ha punto bajo; tolerancia 0.15 m, térã 0.08 m ojeporúvo interruptor de calidad topográfica. Oinforma ñemoĩ tile ndojoavýva. {{ui:Clasificar vegetación y edificios}} upéi omarca vegetación baja, media ha alta ha edificios, ojeporúvo altura terreno rupi ha mboyve ha pe ambiente nendápa. Ndaipóri aprendizaje automático, upévare peteĩ cobertizo plano árbol guýpe ikatu ndaporãi: eñeʼẽ porã.

## Terreno, curvas de nivel, líneas de quiebre

{{ui:Construir terreno}} ojapo terreno existente terreno punto rehegua ha omoĩ proyecto-pe, LAS importación ojapo haguéicha (peteĩ paso deshacer). Upéi ombohovái punto ndive: promedio, RMS, percentil 95, tolerancia guýpe mboyvegua ha diez lugar oñemboyvéva, peteĩteĩ {{ui:Ir allí}}. {{ui:Residuo}} color ohechauka dónde terreno ha nube ndoikókéi.

**Línea de quiebre** (bordillo, zanja térã borde de barranca) oiporavo nube-pe: {{ui:Elegir línea de quiebre en la nube}} 3D vista-pe ojagarra punto dibujado mbykýva peteĩteĩ click-pe, ha {{ui:Elegir línea de quiebre en el plano}} ojagarra nube punto mbykýva (terreno primero) peteĩteĩ click guýpe; doble click térã Enter omboty línea. Pe próximo {{ui:Construir terreno}} oipuru. {{ui:Mostrar curvas de nivel}} omoĩ curvas de nivel nube ári peteĩ pequeño imagen-pe ha oikuaa proyecto intervalo.

## Volúmenes

{{ui:Volumen de acopio…}} ohechauka volumen superficie ojeikuaáva peteĩ base ári peteĩ límite ndejapo guýpe. Eapreta límite terreno nivelado montón rehegua ha eiporavo base: límite punto mbykýva, plano, base curva suave, superficie límite rupi térã nivel nde ndeʼẽva. Terreno inclinado térã curvo-pe eiporavo plano térã base curva; punto mbykýva ohechauka hetave. Límite punto mboyvegua (árbol línea-pe) oñeheja base-gui. {{ui:Vuelo a vuelo}} omoĩ corte y relleno dos nube-pe. Ambos ikatu oñeñongatu CSV-pe.

## Ortomosaico

Pe {{ui:Ortomosaico (imagen desde arriba)}} eiporavo dron ortomosaico ha umi archivo mundo rehegua ha `.prj` tiempo ohendaha: GeoTIFF térã PNG térã JPEG. Ojapo **capa de mapa** proyectoʼi, upévare plano omoĩ dibujo guýpe, ha 3D vista (color {{ui:Mapa}}) omoĩ terreno ojapo ári, upévare {{ui:Construir terreno}} emoĩ mboyve. Pestaña oñeʼẽ cuánto nube oipytyvõ imagen, ha omomaʼẽ ndaipóri oipytyvõ hetaiterei: mba'e ojaʼo ha'e sistema de coordenadas ndoike, upévare emoĩ `.prj` archivo. `.prj` ndaipóri, programa oporandu háme coordenadas. Imagen oñeguarda proyecto archivo-pe; GeoTIFF 200 MB-gui hetaveʼỹ ojerechaza, ha mosaico tuichaiterei oreduci 16 megapíxel-pe, upévare heta relevamiento-pe emoʼã mosaico sitio-pe mboyve.

## Exportar

{{ui:Exportar}} omoĩ nube limpia ha clasificada archivo pyahu-pe (punto opa, clase limpias térã terreno añoite). {{ui:Tipo de archivo}} rupi eiporavo:

- **LAS 1.4 (no comprimido)**: formato punto 6, térã 7 color-pe.
- **LAZ (comprimido)**: punto mismo sin pérdida comprimido, upévare punto opa ojehupytyse mbytépe. Oñemoĩ formato punto 0, térã 2 color-pe, LAS 1.4 archivo-pe. Sitio 300 m-pe LAZ ojeikuaa peteĩ quinto LAS 1.4 archivo tamaño. LAZ formato 0 ha 2 oguereko clase 0 gui 31 peve: clase hetaveʼỹ punto oñemboykéva mensaje-pe; upévare upe nube exportá LAS 1.4-pe.

LAZ ojapo CadCraft propio compresor rupive, LAZ especificación publicada rehe. Ñande lector ha oñeʼẽva ñambohováiva (laz-perf, aplicación oipuru LAZ abrirmi, ha laspy lazrs ndive) omombe'u punto opa, ha LAZ laspy rupi ojapóva byte rehe oikuaa peteĩ jey ojeikóvo umi punto. Ambue programa-pe ndaha'éi ojeprobáiva, upévare peteĩ archivo ndoikeʼỹ, ñaneʼẽ mávape.

Navegadór ikatu ohai archivo, eiporavo archivo primero, ha peteĩ tuichaiterei nube oñemoĩ tile-gui; ambuéra archivo oñemoĩ oñekuaaiterei ha oñemboja, oiko porã hasta peteĩ cientos megabyte peve.

## Ndaiporúi

Ndoikói LAS ha LAZ-pe, ha ndaha'éi E57, PLY ni PCD (ko pestaña-pe ndoikói ainda), ha peteĩ vuelo heta archivo ndoĩporiva; ndohechaukai nube proyecto sistema-pe (proyecto sistema ha metro oñeʼẽ), ndoguerekói Autodesk RCP térã RCS archivo, ndojapói superficie fotografía-gui, ha ndojuhúi poste, bordillo térã caño peteĩ.
