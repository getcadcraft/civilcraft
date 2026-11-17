---
title: Archivos ojeporúva abrir, guardar ha exportar
summary: Archivos de puntos, LandXML ha proyectos CivilCraft ojeike; proyectos, LandXML, DXF ha PDF oguenohẽ; mba'éichapa oñeñangareko cada archivo, mba'éichapa oho archivos ha mba'e oñemyasã sin conexión.
keywords: abrir, guardar, exportar, importar, formatos de archivo, csv, txt, landxml, xml, dxf, pdf, json, descargar, archivo de proyecto
from: 82bff559
---

CivilCraft oabre archivos nde computadora-gui ha oguarda archivos oñemboguejy ndéve descargando. Nada ndoikói ni ndoñangarekói servidor-pe. Ehecha avei [Tus archivos](common:your-files).

## Mba'e oabre

Eprésiona **Abrir** (térã {{key:Mod+O}}) ha eleji archivo, térã eguejy archivo {{pick:mac=Finder|windows=File Explorer|linux=tu administrador de archivos}} gui plano-pe. Peteĩ archivo peteĩha; archivos hetave 200 MB ndoĩmi aceptado. LandXML térã archivo de proyecto hetave 32 MB oñeleía pedazos de 4 MB rupi, ndaha'éi peteĩ texto tuichavévape; LandXML oikuaáva, emaña ojeporu 13 vécespe tamaño del archivo memoria-pe (69 MB archivo ojeporu 0.9 GB ñanemoarandu-pe).

| Tipo | Nombres de archivo | Mba'épa oiko |
|---|---|---|
| Archivo de puntos | `.csv`, `.txt`, `.pnt`, `.xyz` (texto cualquiera) | Ventana **Importar puntos** oikuaa. Puntos omboaprovéchavo proyecto-pe puntos; alineaciones, plataformas ha caños oñemoĩ. |
| LandXML | `.xml`, `.landxml` | **Proyecto nuevo** ojapo archivo-gui (eporandu mboyve tenda ojeporu ha ndaha'éi guardado). |
| Proyecto CivilCraft | `.civilcraft.json` (`.json` cualquiera) | Proyecto oñepyrũ guardado hína ramo. (Eporandu mboyve tenda ojeporu ha ndaha'éi guardado). |

CivilCraft oikuaa archivo ojeiporúva pe fin-gui, upéi pe primer tembiaporã-gui: texto oñepyrũva `{` ha'e proyecto, oñepyrũva `<` ha'e LandXML, ambue ha'e archivo de puntos. Archivo abrir ventana ndojapói ojehecha plano-pe ojejuhu avei.

:::note
Archivo de puntos importar proyecto-pe oguereko puntos ndoporandúi omboaprovecha, ha historial de deshacer oñemboguejy (ojeabrí cualquier archivo ojepyrũ hína deshacer-pe). Superficie oúva LandXML-gui, puntos importar oguenohẽ hína superficie puntos-gui. Guardá primero témpo ojeporúva hína puntos viejos.
:::

Detalles: [Formatos de archivo de puntos](topic:point-file-formats), [LandXML: mba'e oñeleía ha oñemoĩ](topic:landxml-reference).

## Mba'e oguarda

{{ui:Guardar}} ({{key:Mod+S}}) oguarda archivo mokõi hendápe, oñehenóiva **Nombre** panel izquierda-gui: `<nombre>.civilcraft.json`, proyecto oendelva ajustar, ha `<nombre>.ifc`, diseño mbojojáva IFC 4.3 ambue tembiapohára-pe (echa [Exportación e importación IFC](topic:ifc)). Cada archivo omombe'u ambue, ha IFC avei oguereko proyecto comprimido, upévare IFC omboty hína ojeipeaseha ha oikuaa ojeporu hetave.

- **En Studio** archivo mokõiva oguarda peteĩ hendápe, hépe.
- **En Chrome ha Edge** primer Guardar oipota carpeta ha oguarda mokõiva upépe; upe rupi guardados ambue carpeta ojeporúva-pe. Cancelar carpeta pregunta-pe ojeipota ambos descargados.
- **Ambue navegadores** archivo mokõiva oñedescarga, proyecto primero.

Abriendo peteĩ archivo ojekuaa ambue. Ojepyta mokõiva peteĩicha (térã guejy mokõiva), térã peteĩ: Studio-pe ambue oñekuaa carpeta peteĩha-pe; navegador-pe CivilCraft oporandu pemoĩ, térã oguerovia pe peteĩ reiko. Si IFC ambue programa ojapo CivilCraft oguardárõ mboyve, térã peteĩ archivo ojeguerekóvo ambue mboyve, proyecto oñepyrũ diseño pyahúgui, ha Problemas panel omombe'u mba'épa ojehu, **Guardar ahora** (oguarda mokõiva jey) ha **Mostrar geometría del IFC como referencia**. IFC hína ambue programa ojapo oñepyrũ copia proyecto-gui ojeikuaa rupi: alineaciones oñemudáva oñeikotevẽ geometría, objetos oñemboguejy oñemboguejy oho, ha ambue cambios oñemombe'u, ndoñeikotevẽi. Proyecto archivo 0.7.1 mboyve oñepyrũ tesãi.

Archivo de proyecto oñangarekóva:

- cada punto (número, coordenadas, elevación, descripción) ha pe archivo de puntos oñeikuaa
- superficie ajustes: grupos ojeporúva, breaklines ojejapóva, límite, borde externo más largo, ha TIN LandXML-gui
- pantalla ajustes
- alineaciones PI, radios ha estación de inicio, perfiles de diseño (PVI ha longitud de curva) ha corredor ajustes
- plataformas ha red de caños ha reglas

Ndoñangarekói historial de deshacer. Superficies, curvas de nivel, líneas de luz natural ha volúmenes ndoguardái; oñeho jey proyecto oñepyrũ ramo oñeikotevẽ entradas-gui. Archivo de proyecto CivilCraft pyahúgui ndoaceptái, ha mensaje omombe'u versión.

## Mba'e oexporta

| Botón | Archivo | Contenido |
|---|---|---|
| {{ui:LandXML}} | `<nombre>.xml` | LandXML 1.2: puntos, terreno existente (ha superficie diseñada oiko ramo) TIN superficies-pe, alineaciones, perfiles de terreno ha diseño, red de caños |
| {{ui:DXF}} | `<nombre>.dxf` | Plano R12 DXF oĩva ojehecha ramo, capas oñehenóiva-pe |
| {{ui:DWG}} | `<nombre>.dwg` | Ko mismo ojehecha DWG dibujo-pe, ojeporúva formato (2000 rupi 2018 peve) |
| {{ui:PDF}} | `<nombre>.pdf` | Plano vectorial hoja-pe, escala ojeporúva |
| {{ui:GLB}} térã {{ui:OBJ}} (3D barra-pe) | `<nombre>-3d.glb`, `<nombre>-3d.obj` | Mba'e 3D vista omoñe'ẽva: metros, Y arriba, escala verdadera, origen local ojeporúva |

Mba'e ndoguerekóiva cada uno: [Intercambio LandXML](topic:landxml), [Exportar plano a DXF](topic:dxf-export) (DWG avei), [Imprimir plano a PDF](topic:plot-pdf), [Exportar sitio en 3D](topic:export-3d).

## Mba'épa oho archivos

Archivos guardados ha exportados oho navegador descargas-pe, usualmente carpeta Descargas-pe. Cada vez carpeta eleji:

:::chromium
Abrí navegador **Configuración**, upéi **Descargas**, ha ojapo **Preguntar dónde guardar cada archivo antes de descargar**.
:::

:::firefox
Abrí **Configuración**, upéi **General**, ha **Archivos y aplicaciones** ryepýpe eleji **Preguntar siempre dónde guardar archivos**.
:::

:::safari
Abrí **Safari > Configuración > General** ha ajusta **Ubicación de descarga de archivos** **Preguntar en cada descarga**.
:::

Guardaste mokõi jey peteĩ nombre, navegador oñemoĩ número segundo archivo-pe, ejemplo `Sitio (1).civilcraft.json`. Próxima vez pe ojehecha más nuevo oipe'a.

## En línea ha sin conexión

CivilCraft oñemba'apo tu computadora-pe ambue hendápe: abrir oleé archivo navegador-pe, guardar oguenohẽ descarga. Para abrir CivilCraft sin conexión ningún, guardá primero para uso sin conexión:

1. Mientras en línea, eprésiona **Guardar para usar sin conexión** barra superior-pe.
2. Botón oñemoĩ ("Guardando 12 de 30") ha upéi oñemoĩ **Listo para usar sin conexión**. CivilCraft ndahasúi (0.6 MB aproximadamente), upévare oñemboguejy peteĩ momento. Copia guardada oguereko ko ayuda ha sitio de muestra.
3. Sin conexión, abrí mismo dirección (térã favorito) ha oñembaʼapo opa. Ojeporu **Abrir el sitio de muestra** avei.

Botón ambue estado:

- **No se pudo guardar**: archivos peteĩ ndoguardái. Revisá conexión ha eprésiona jey ojeporu.
- **Uso sin conexión no disponible**: ko navegador ventana ndoguerekói copia sin conexión (ventanas privadas ha computadora administradas ojejuhu oikotevẽ). Ojeporu ventana normal.

Eprésiona **Listo para usar sin conexión** ojehecha mboyve oñemboguejy copia, ha dos elección: **Guardar otra vez (obtener la versión más nueva)** ha **Quitar la copia sin conexión**. Guardá otra vez antes visita de sitio, copia omoĩ versión más nueva. Más: [Sin conexión](common:offline).

:::offline
Ko'ágã ndaiporiri conexión. Si CivilCraft oguardáva uso sin conexión, opa oñemba'apo, ha sitio de muestra avei. Si ndoguardái, tembiapo ko pestaña-pe ojeporu, ha ndapu'ã jey hasta reconecta; guardado copia ndoguerekói, **Abrir el sitio de muestra** ndoñeha'ãi "The sample could not be loaded".
:::

:::tip
Campo-pe ojeporúvo, guardá CivilCraft uso sin conexión ha eguejy punto archivos laptop-pe. Proyectos ha exportaciones oguarda descargas-pe ndaconexiónri, upévare ikatu importar día medición, revisar superficie ha guardar proyecto sitio-pe.
:::

Guardado de nube ndoiko'ẽi ko'ágã, ha escritorio versiones ndoiko'ẽi. Ko'ágã, archivos oguardáva ha'e única copia: oguarda hendápe oñeñangareko backup-pe.

## Complementos ojeporúva archivo-pe

Proyecto guardáramo datos complemento-gui (ticks de Reglamentos de edificación, térã fuente de Dirección a sitio), archivo omombe'u complementos ha versiones. Oipe'a computadora ndoguerekóiva, plano jurúpe barra omombe'u ha ofrece agregar cuenta lista-gui. Registro ha'e nota añónte: archivo oikuaa umi jave.

## Deshacer desde Studio

CadCraft Studio-pe, cada paso CivilCraft-pe ojehecha oñemombe'u Studio-pe, upévare deshacer proyecto-nivel-pe ikatu omboguejy último paso aplicaciones mbytépe. Studio oñemboguejy paso hína CivilCraft deshacer pila exactamente ojehechahápe; ambue archivo abrirámo ndoiko'ẽi ko ventana.

## Cerrar con cambios sin guardar

Proyecto cambios sin guardar ha cerrá pestaña, recargá térã oho página, navegador oporandu oikuaa mboyve oho. Mba'e ojehai navegador-pe oñemoĩ, CivilCraft ndaikatúi ñemuda. **Nuevo**, ha proyecto térã LandXML abrir, ojapo CivilCraft **Cambios sin guardar** ventana-pe, ha **Cancelar**, **No guardar** ha **Guardar una copia** oĩ.
