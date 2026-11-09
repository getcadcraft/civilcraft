---
title: Archivos que podés abrir, guardar y exportar
summary: Archivos de puntos, LandXML y proyectos de CivilCraft que entran; proyectos, LandXML, DXF y PDF que salen; qué guarda cada uno, adónde van los archivos y qué cambia sin conexión.
keywords: abrir, guardar, exportar, importar, formatos de archivo, csv, txt, landxml, xml, dxf, pdf, json, descargar, archivo de proyecto
from: a7debb61
---

CivilCraft ojeabre archivo nde ordenadorgui ha ojeguarda descarga rupive upeicha. Ndaipóri ojeenvia nada ni ojeguarda servidorpe. Esto avei: [Tus archivos](common:your-files).

## Mboyvea oñeabre

Emboguejy {{ui:Abrir}} (térã emoĩ {{key:Mod+O}}) ha eiporavo archivo, térã emboguejy archivo {{pick:mac=Finder|windows=File Explorer|linux=tu administrador de archivos}} rupi plano-pe. Peteĩ archivo jave; archivo 200 MB-gui hasýva ndoguerekoi.

| Tipo | Nombres de archivo | Mba'épa ojehupyty |
|---|---|---|
| Archivo de puntos | `.csv`, `.txt`, `.pnt`, `.xyz` (cualquier archivo de texto) | Ojeprende **Importar puntos** diálogo. Puntos ojerrepláza proyecto puntos; alineaciones, plataformas ha caños oĩ ohóvo. |
| LandXML | `.xml`, `.landxml` | Oñemoĩ **nuevo proyecto** archivo rupive (oporandu jevy umi ndaha'éi guardado hag̃uáicha). |
| Proyecto de CivilCraft | `.civilcraft.json` (cualquier `.json`) | Proyecto ojeabre upe ojeguardava jave (oporandu jevy umi ndaha'éi guardado hag̃uáicha). |

CivilCraft ohechakuaa archivo nombre ipaha rupi, upéi ipa'angue'i rupi: tekstoa oñepyrõva `{`-gui oñemoĩ proyecto-icha, `<`-gui LandXML-icha, ambue mbaʼeve puntos archivo-icha. Archivo open box-pe ojehecha grisado ojeguerekóramo imbaʼe, oikeva plano-pe.

:::note
Puntos archivo omoĩ proyecto-pe, hyʼaite puntos, ojerrepláza oporandúvo ndaje; ha ojejeheka deshacer historia (archivo ojeabre jave ojepyrũ ojehecha pyahu deshacer-pe). Surface oiko LandXML-gui, puntos omoĩ jave ojejapo jeyva surface puntos-gui. Ajahendu mboyve guardar, pe puntos-kuéra jejuhu ramo.
:::

Ojehechaukávo: [Formatos de archivo de puntos](topic:point-file-formats), [LandXML: mbaʼépa ojelee ha ojeikuaa](topic:landxml-reference).

## Mboyvea oñeguarda

{{ui:Guardar}} ({{key:Mod+S}}) ojeguarda mokõi archivo peteĩ peteĩ gotyo, **Nombre** panel izquierdo-pe héra rupive: `<nombre>.civilcraft.json`, proyecto oñeeditáta jevýva, ha `<nombre>.ifc`, pe mismo diseño IFC 4.3 ojapóva ambue ndive (ehecha [IFC exportación ha importación](topic:ifc)). Peteĩ peteĩ ojehechaukáta ambuépe, ha IFC-pe avei oguereko proyecto oñemongeta ijyvapaiterei, upévare IFC ndoaguéi ohóvo ojeabre mboyvéva oñeeditáta.

- **Studio-pe** mokõiva ojeguarda peteĩ gotyo, tenda rehe.
- **Chrome ha Edge-pe** ojeporandu mboyve tenda, upéi mokõiva oguarda upépe; upe rire guardar ojeguarda upe tenda-pe. Tenda porandu ndejejapóiramo, mokõiva ojeguarda descarga-pe.
- **Ambue navegador-pe** mokõiva ojeguarda descarga, proyecto archivo ojeguarda mboyve.

Archivo ojeabre jave ojekuaa ambue. Ojeabre mokõiva peteĩ jeyvápe (térã emboguejy mokõiva), térã peteĩ ojeabre: Studio-pe ambue ojejuhu tenda pe rehe; navegador-pe CivilCraft oporandu emoĩ hag̃ua térã ojeguereko pe peteĩ ndive. Ha IFC ambue programa-gui oñemoambue CivilCraft-pe ojeguarda mboyve térã mokõi archivo mbaʼe ojehasa, proyecto oñemoĩ diseño pyahúgui ha Problemas panel omombeʼu mbaʼépa oikóma, ha **Guardar ahora** (oñemoĩ mokõi archivo jeýta) ha **Mostrar la geometría del IFC como referencia**. Ambue programa oñemoambue IFC ndojeabremoʼãi IFC-pe ojeguardava proyecto-gui ha umi ojejapo oipytyvõva: alineación oñemoambue ojehupyty ijyvapaiterei geometría, ojepe'áva ndoikéi, ha ambue cambios oñeha ndojehupytyi.

Proyecto archivo oguarda:

- puntos peteĩ peteĩ (número, coordenadas, elevación, descripción) ha puntos archivo héra oúva
- surface ajustes: grupo elección, dibujado breaklines, límite, pe ñanduti tuichaiterei borde, ha TIN LandXML-gui ojelee
- pantalla ajustes
- alineaciones PI-kuéra, radios ha inicio estación, design perfiles (PVI ha curva longitudes) ha corredor ajustes
- plataformas ha caños red reglas ndive

Ndoguardái deshacer historia. Surface, curvas de nivel, líneas de luz ha volúmenes ndoguardáiva; ojejapo jeyvavéta guardado insumos-gui proyecto ojeabre jave. Proyecto archivo CivilCraft pyahúgui ojerechaza ojehechaukáva versión.

## Mboyvea oñeexporta

| Botón | Archivo | Contenido |
|---|---|---|
| {{ui:LandXML}} | `<nombre>.xml` | LandXML 1.2: puntos, terreno existente (ha surface ojapo ramo TIN surface-kuéra), alineaciones, terreno ha diseño perfiles, caños red |
| {{ui:DXF}} | `<nombre>.dxf` | R12 DXF plano líneas ojehechaukáva pantalla-pe, capas héra rupive |
| {{ui:DWG}} | `<nombre>.dwg` | Pe mismo líneas DWG dibujo-pe, emboguejy formato (2000 hasta 2018) |
| {{ui:PDF}} | `<nombre>.pdf` | Plano vectorial hoja-pe, escala emboguejýva |
| {{ui:GLB}} térã {{ui:OBJ}} (3D vista barra-pe) | `<nombre>-3d.glb`, `<nombre>-3d.obj` | 3D vista omombe'úva 3D modelo: metro, Y arriba, escala verdadera, lokál origen ojeguardava rupi |

Mbaʼe ndoguerekói umi: [Exchange LandXML](topic:landxml), [Exportar el plano a DXF](topic:dxf-export) (DWG avei), [Imprimir el plano a PDF](topic:plot-pdf), [Exportar el sitio en 3D](topic:export-3d).

## Mboyvea oñeguardáta archivo

Ojeguardava ha exportava archivo oho navegador ojeguardáva descarga-pe, ojeguerekóva Descargas carpeta-pe. Cada vez tenda emboguejy hag̃ua:

:::chromium
Emboguejy navegador **Configuración**, upéi **Descargas**, ha emboguejy **Preguntar dónde guardar cada archivo antes de descargar**.
:::

:::firefox
Emboguejy **Configuración**, upéi **General**, ha **Archivos y aplicaciones** rupi emboguejy **Preguntar siempre dónde guardar archivos**.
:::

:::safari
Emboguejy **Safari > Configuración > General** ha **Ubicación de descarga de archivos** emboguejy **Preguntar en cada descarga**.
:::

Mokõi jey guardáramo héra peteĩ héra rupi, navegador omoĩ número segundo archivo-pe, por ejemplo `Sitio (1).civilcraft.json`. Ojeabre pyahúva upe jave.

## Ojeikuaa ha ndojeikuaái

CivilCraft oñemoĩ ordenadorgui ha upéicha: ojeabre navegador-pe ojehecha archivo, ojeguarda ojeguerekóva descarga. Ndaipóri mbaʼeve conexión ojeabre hag̃ua CivilCraft, guardar ojeguardaporãite hag̃ua ko'ã mbaʼe ndive:

1. Oĩmba conectado jave, emboguejy {{ui:Guardar para usar sin conexión}} app barra-pe pyhare.
2. Botón oñemboguejy ojeheka ("Guardando 12 de 30") ha upéi oñemombe'u {{ui:Listo para usar sin conexión}}. CivilCraft ipequeño (0,6 MB ndaje), upévare ohasa mokõi aja. Guardado copia oguerekóva ko'ã ayuda ha sitio de muestra.
3. Ndaipóri conexión, emoĩ upe ndirección (térã marcador) ojeabre hag̃ua. Ojapo mbaʼe, {{ui:Abrir el sitio de muestra}} avei.

Botón ambue estado-kuéra:

- {{ui:No se pudo guardar}}: archivo peteĩ ndojejapóiri descarga. Emaña conexión ha emboguejy jey oñeha hag̃ua.
- {{ui:Uso sin conexión no disponible}}: ko navegador ventana ndaikatúi guarda ojeikuaa copia (ventana privada ha ordenador administrado peteĩ ojejoko). Emboguejy ventana normal.

Emboguejy {{ui:Listo para usar sin conexión}} oikuaa hag̃ua mboyve guardado, mokõi aporãva: {{ui:Guardar otra vez (obtener la versión más nueva)}} ha {{ui:Quitar la copia sin conexión}}. Guardar jey sitio visita mboyve ojeguarda, copia oikóva versión pyahúvape. Más [Sin conexión](common:offline).

:::offline
Ko'ágã ndaipóri conexión. CivilCraft oñeguardáramo sin conexión, mbaʼe ojapo, sitio de muestra avei. Ndojeguardái jave, ko pestaña-pe tembiapo jeporã, ha ndereiporavóima conexión jevy. Guardado copia ndaipóri jave, {{ui:Abrir el sitio de muestra}} ndojejapomo: "No se pudo cargar la muestra".
:::

:::tip
Ko'ẽ tembiapo-pe, CivilCraft guardá sin conexión ha eguereko punto archivo laptop-pe. Proyecto ha exportación ojeguarda descarga conexión ndaipóri jave, upévare pe día ojeguahẽva puntos ojehechaukáta, surface oñeha ha proyecto ojeguarda sitio-pe.
:::

Nube guardado ndaikatúi ko'ágã, ordenador ndaipóri ko'ágã. Ko'ágã archivo ojeguardáva peteĩ jave copia ha upévare oñeguardáva ñemoĩ.

## Complementos ojeikotevẽva archivo

Proyecto archivo oguardáramo mbaʼe complemento-gui (Normas de construcción tick-kuéra, térã Dirección a sitio fuente), archivo omoĩ mávapa complementos ha versiones. Ojeabre ordenador-pe ndoguerekóiva, barra plano ári omombe'u ha omoĩ hag̃ua cuenta-gui. Registro ndaha'éi ojehechaukáva: archivo ojeabre upéicha.

## Deshacer Studio-gui

CadCraft Studio-pe, CivilCraft-pe oñemboguejýva omombe'u Studio-pe, upévare proyecto deshacer omboguejy peteĩ jey app-kuéra ndive. Studio ojeheja peteĩ mbaʼe CivilCraft deshacer pila ipyahúvape ha oikóramo; ambue archivo ojeabre rire ndojejapói.

## Mboyve cerrar cambios ndojeguardavéva

Proyecto cambios ndojeguardavéva pestaña, recarga térã pasa página, navegador ojerporandu ndaha'éi haʼe ja'ukáramo. Pe palabras ha forma navegadorgui, CivilCraft ndojeikotevẽi. {{ui:Nuevo}} térã proyecto térã LandXML ojeabre, CivilCraft-pe **Cambios sin guardar** caja-pe ojerporandu, {{ui:Cancelar}}, {{ui:No guardar}} ha {{ui:Guardar una copia}} ndive.
