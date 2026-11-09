---
title: La pantalla, parte por parte
summary: Un recorrido por cada barra y panel de CivilCraft según su nombre en pantalla, desde la barra de herramientas hasta la barra de estado.
keywords: interfaz, pantalla, barra de herramientas, paneles, propiedades, barra de estado, vista de perfil, diseño, recorrido, ui
from: 76272010
---

CivilCraft oguereko peteĩ pantalla. Pestañas ndaipóri, diseño ndaipóri. Costado paneles ojemoveve, ojeflota térã peteĩ ventana propio-pe oñemoĩ ikatu: ehecha [Organizar los paneles y usar un segundo monitor](common:arrange-panels). Arriba peve abajo ha izquierda peve derecha:

- **app barra** (CadCraft marca, app héra, versión, Acerca de, pantalla modo, Ayuda, Guardar para usar sin conexión, Papel ha Modelo)
- **herramientas barra** siete botón grupo ndive
- **panel izquierdo**: Sitio, Puntos, Superficie, Pantalla ha, emboguejy mbohapy ojeikuaáva, GIS capas
- **plano** medio-pe, **perfil vista** pe rire oñemoĩmba
- **panel derecho**: Propiedades ojeporomba'ehágui
- **estado barra** abajo

## App barra

Pe mbytépe ñe'ẽ tuichakue barra, CadCraft sitio-pe ojeikuaa, CivilCraft-pe ndaha'éi.

- Versión menú omombe'u mba'e ojeporomba'e.
- {{ui:Acerca de CivilCraft}} app página sitio-pe oñemoĩ.
- {{ui:Pantalla completa}} pantalla modo ojeporomba'e: pantalla completa, upéi barra ndojehechaiva pantalla completa, upéi normal. {{key:Ctrl+Shift+F}} opa plataforma-pe upéicha (Mac-pe Control tecla, Command ndaha'éi). Barras ndojehechaiva jave, pointer ruguy vore pyahúpe ombojuhu hag̃ua.
- {{ui:Ayuda}} (térã {{key:F1}}) ko ayuda panel costado-pe oñemoĩ; {{key:F1}} térã {{key:Esc}} oñemboguejy.
- {{ui:Guardar para usar sin conexión}} CivilCraft ko navegador-pe oñeguarda, sin conexión oñeabre; upéi {{ui:Listo para usar sin conexión}} omombe'u. Ehecha [Archivos que podés abrir, guardar y exportar](topic:files#online-and-offline).
- {{ui:Papel}} ha {{ui:Modelo}} claro ha oscuro tema oñemboguejy. Plano ha perfil tema-pe oñeraʼanga; PDF siempre blanco-pe ojejapo.

## Herramientas barra

Grupo peteĩ peteĩ botón ári héra oĩ. Botón ári pointer oñemoĩ tip ha tecla ojehecha.

| Grupo | Botones | Mba'épa ojapo |
|---|---|---|
| Archivo | {{ui:Nuevo}}, {{ui:Abrir}}, {{ui:Guardar}} | Oñepyrũ jey, puntos archivo, LandXML térã proyecto abrir, proyecto descarga-pe guardar |
| Exportar | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | LandXML 1.2, R12 DXF térã plano DWG escribir, plano PDF-pe plotear |
| Superficie | {{ui:Línea de quiebre}}, {{ui:Límite}} | Línea de quiebre topografía puntos rupi dibujar; ruguy límite dibujar |
| Diseño | {{ui:Alineación}}, {{ui:Plataforma}}, {{ui:Caños}}, {{ui:Perfil}} | Alineación, plataforma, caño dibujar; perfil vista omoĩ térã oñemongeta |
| Editar | {{ui:Deshacer}}, {{ui:Rehacer}}, {{ui:Copiar}}, {{ui:Pegar}}, {{ui:Más}} | Topografía puntos deshacer, rehacer, copiar ha pegar; {{ui:Más}} ndaipórõ Cortar, Pegar en el mismo lugar, Duplicar, Eliminar, Seleccionar todos los puntos ha Ninguno seleccionar |
| GIS | {{ui:Coordenadas}}, {{ui:Importar}}, {{ui:Exportar}}, {{ui:Mapa}} | Coordenadas sistema ojejapo, GIS archivo importar ha exportar, plano guýpe mapa capas omoĩ |
| Vista | {{ui:Seleccionar}}, {{ui:Ajustar}}, {{ui:3D}} | Mba'e jeporavo ha omoambue; opa ojehechaukáva zoom; sitio 3D-pe ojehechaukáva ([Ver el sitio en 3D](topic:site-3d)) |

Dibujo herramienta oñemboguejy ojeporomba'e jave. Jey emboguejy, {{key:Esc}} térã {{key:V}} emboguejy {{ui:Seleccionar}}-pe jevýta. {{ui:Deshacer}}, {{ui:Rehacer}}, {{ui:Copiar}} ha {{ui:Más}} mba'e ojeporomba'e ndaikatúi jave gris ojehecha; tip omombe'u mbaʼépa (por ejemplo "Seleccione primero puntos de topografía").

Herramienta barra estrecha ventana-pe horizontal oñemboguejy.

## Panel izquierdo

### Sitio

- **Nombre**: proyecto héra. Ojeguarda ha exportava archivo héra, PDF título-pe ojehechaukáva.
- **Unidades**: {{ui:pies US}} térã {{ui:Metros}}. Mbaʼépa número oñemombe'u. Oñemoambue **ndojemoambue** coordenadas; ehecha [Unidades, estaciones y formatos de número](topic:units-and-stations).

### Puntos

Vacío jave, mba'éichapa punto archivo ojeabre. Puntos oĩ jave archivo héra, puntos número ha elevación oguerekóva omombe'u, upéi **grupos de puntos** tabla: descripción pe primer palabra peteĩ peteĩ fila (GRD, FL, TBS …), número ha **Superficie** elección:

- {{ui:Puntos}}: puntos superficie-pe ojeguahẽ (opa grupo-pe oñemoĩ).
- {{ui:Línea de quiebre}}: grupo puntos número orden-pe peteĩ breakline-pe ojerrepaseva.
- {{ui:Ojeheja ári}}: grupo superficie-pe ndojeguahẽi.

### Superficie

Terreno existente datos: puntos, triángulos, mínima ha máxima elevación, promedio elevación, 2D ha 3D área, breaklines ha límite oĩpa. Datos ári caja omombe'u surface constructor-pe ojejapo ha ndojejapóiva. Upéi:

- **Borde exterior más largo**: 0 opa exterior triángulos oguereko; número ojekangue exterior triángulo luz.
- Enlaces ojehechaukáva ojeporomba'eramo: {{ui:Eliminar el límite}}, {{ui:Eliminar líneas de quiebre dibujadas}} ha LandXML-gui surface-pe {{ui:Ojejapo superficie puntos gui}}.

### Pantalla

- **Superficie**: {{ui:Terreno existente}} térã {{ui:Propuesto (con pendientes)}}. Ko segundo oĩ plataforma térã corredor pendiente problemas ndojeguereko jave.
- **Curvas de nivel cada**, **Principal cada** ha **Bandas** (color bandas número).
- Casillas: {{ui:Curvas de nivel}}, {{ui:Rótulos de curvas de nivel}}, {{ui:Triángulos}}, {{ui:Bandas de cota}}, {{ui:Flechas de pendiente}}, {{ui:Puntos}}, {{ui:Rótulos de puntos}}, {{ui:Líneas de quiebre}}, {{ui:Borde de la superficie}}, {{ui:Caños}}.
- Bandas oĩ jave elevación leyenda oñemoĩ.

Pantalla ajustes proyecto-pe oñeguarda, ha deshacer pasos ndaha'éi: {{key:Mod+Z}} casilla ndojejeporavo.

## Plano

Plano omombe'u puntos, superficie ha opa diseño, norte arriba plano vista-pe. Rueda pointer-pe zoom, espacio vacío arrastrá paso. Lista tuichaiterei [Teclas y mouse](topic:keyboard).

- Proyecto vacío jave **Empezar con puntos de topografía** caja pasos ha {{ui:Abrir el sitio de muestra}} ojeikuaa.
- Dibujo herramienta oñemboguejy jave, plano ári pista omombe'u mbaʼépa emboguejy ha mbaʼéichapa tembiapo oñeguata.
- Archivo plano-pe ojeguahẽ jave: "Suelte un archivo de puntos, LandXML o proyecto".
- Mbaʼe selecciona jave ojehechaukáva. Alineación térã plataforma selecciona jave PI-gui térã esquinas-gui cuadrado agarre ojehecha; estructura selecciona jave peteĩ agarre. Agarre arrastrá ojemoveve.
- Selecciona puntos topografía jave anillo ojehechaukáva. {{key:Shift}} ha clic punto añade térã oguejy; {{key:Shift}} ha arrastre caja (térã lazo) ojerrepaseva puntos. Ehecha [Seleccionar, copiar y pegar puntos de topografía](topic:copy-paste-points).

## Perfil vista

{{key:R}} térã {{ui:Perfil}} emboguejy: plano guýpe oñemoĩ. Barra ári:

- alineación lista (dos térã heta alineación jave ojeporomba'e)
- {{ui:Agregar PVI}}: oñemboguejy jave, perfil-pe clic PVI añade ({{key:I}} oñemboambue)
- estación, terreno, diseño elevación, pendiente ha corte térã relleno omombe'u pointer ruguy
- cierre botón

Perfil opa terreno existente, diseño perfil, tangentes pendiente, peteĩ peteĩ PVI estación ha elevación, vertical curva L ha K BVC ha EVC ndive, puntos alto ha bajo ha vertical exageración ojehechaukáva. Opa alineación ojehechaukáva: zoom ndojeporavéi. Pointer perfil rupi ojehecha alineación plano-pe punto ojehechaukáva.

## Panel derecho: Propiedades

Título omombe'u mba'e ojehechaukáva.

- **Proyecto** (ndaipóri oporombaʼeva): alineaciones ha plataformas enlace, **Movimiento de suelo** bloque, **Red de caños** bloque reglas ha problemas ndive.
- **Alineación**: nombre, estación inicio, tuichakue, PI tabla, curvas, diseño perfil PVI tabla ha datos, **Corredor** ajustes.
- **Plataforma**: nombre, elevación, corte ha relleno pendientes, área, luz datos ha movimiento de suelo.
- **Estructura** térã **Caño**: tamaños, bordes, invertidos, pendiente, cobertura ha problemas.
- **Punto** ha número: coordenadas, elevación, descripción ha grupo (solo lectura).

Campo oñemoambue ojepe'ẽ jave {{key:Enter}} térã campo ojehejavo. Ndojeporãiva valor inválido ojehechaukáva ha ndaipóri oñemoambue.

## Estado barra

- **E** ha **N**: este ha norte pointer ári.
- Ojeguahẽ **Suelo** elevación (ha **Graficado** plataforma térã corredor ojemoambuegui) térã "Fuera de la superficie".
- Alineación tuichakue (térã ojeporomba'eva) **Sta** ha offset (**L** térã **R**) pointer ári.
- Derecha, mensajes: ojehecha mbaʼépa ojejapo térã mbaʼépa oñeha. Mensaje oñembogue peteĩ aja rire.

## Diálogos

- **Importar puntos**: opa archivo puntos ndive oñemboguejy. Ehecha [Importar puntos de topografía](topic:import-points).
- **Imprimir el plano a PDF**: ehecha [Imprimir el plano a PDF](topic:plot-pdf).
- **Cambios sin guardar**: {{ui:Nuevo}} térã proyecto térã LandXML archivo ojeabre jave ojerporandu ndojeguardavévagui. {{ui:Guardar una copia}} proyecto descarga-pe ojeguarda mboyve.

## Pantalla hasy

Ancho 760 pixel peve, teléfono-gui, plano pantalla ojeguereko: herramientas barra peteĩ fila ojeporomba'e ha paneles barra abajo hoja-pe ojeabre. {{ui:Herramientas}} herramientas barra ojepe'a ha {{ui:Mover}} abajo ojeguahẽ.
