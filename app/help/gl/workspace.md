---
title: A pantalla, parte por parte
summary: Un percorrido por cada barra e panel de CivilCraft polo seu nome na pantalla, desde a barra de ferramentas ata a barra de estado.
keywords: interface, pantalla, barra de ferramentas, paneis, propiedades, barra de estado, vista de perfil, disposición, percorrido, ui
from: 76272010
---

CivilCraft ten unha única pantalla. Non hai lapelas nin disposicións. Os paneis laterais poden moverse, flotar ou pasar a unha xanela propia: vexa [Organizar os paneis e usar un segundo monitor](common:arrange-panels). De arriba abaixo e de esquerda a dereita:

- a **barra da aplicación** (marca CadCraft, nome da aplicación, versión, Acerca de, modo de pantalla, Axuda, Gardar para uso sen conexión, Papel e Modelo)
- a **barra de ferramentas** con sete grupos de botóns
- o **panel esquerdo**: Sitio, Puntos, Superficie, Visualización e, cando importe algunhas, capas GIS
- o **plano** no centro, coa **vista de perfil** debaixo cando está aberta
- o **panel dereito**: Propiedades do que está seleccionado
- a **barra de estado** ao longo do fondo

## Barra da aplicación

A barra fina do todo pertence ao sitio de CadCraft, non a CivilCraft en si.

- O menú de versións mostra a compilación que está a executar.
- {{ui:About CivilCraft}} abre a páxina da aplicación no sitio.
- {{ui:Full screen}} cambia os modos de pantalla: pantalla completa, despois pantalla completa coas barras ocultas, e logo de novo o normal. {{key:Ctrl+Shift+F}} fai o mesmo en todas as plataformas, incluído un Mac (aquí é a tecla Control, non Command). Coas barras ocultas, mova o punteiro ao bordo superior para volvelas mostrar.
- {{ui:Help}} (ou {{key:F1}}) abre esta axuda nun panel lateral; {{key:F1}} ou {{key:Esc}} o pechan.
- {{ui:Save for offline}} mantén CivilCraft neste navegador para que se abra sen conexión; despois mostra {{ui:Offline ready}}. Vexa [Ficheiros que pode abrir, gardar e exportar](topic:files#online-and-offline).
- {{ui:Paper}} e {{ui:Model}} alternan entre un tema claro e un escuro. O plano e o perfil seguen o tema; os PDF sempre se imprimen en branco.

## Barra de ferramentas

Cada grupo ten unha pequena etiqueta enriba dos seus botóns. Pase o punteiro sobre un botón para ver a súa suxestión e a súa tecla.

| Grupo | Botóns | Que fai |
|---|---|---|
| Ficheiro | {{ui:New}}, {{ui:Open}}, {{ui:Save}} | Comezar de novo, abrir un ficheiro de puntos, LandXML ou proxecto, gardar o proxecto como descarga |
| Exportar | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Escribir LandXML 1.2, un DXF R12 ou un DWG do plano, ou trazar o plano a PDF |
| Superficie | {{ui:Breakline}}, {{ui:Boundary}} | Debuxar unha liña de ruptura entre puntos de levantamento; debuxar o límite exterior |
| Deseño | {{ui:Alignment}}, {{ui:Pad}}, {{ui:Pipes}}, {{ui:Profile}} | Debuxar un trazado, unha plataforma ou un tramo de tubaxes; mostrar ou ocultar a vista de perfil |
| Editar | {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}}, {{ui:Paste}}, {{ui:More}} | Desfacer, refacer, copiar e pegar puntos de levantamento; {{ui:More}} inclúe Cortar, Pegar no mesmo sitio, Duplicar, Eliminar, Seleccionar todos os puntos e Non seleccionar ningún |
| GIS | {{ui:Coordinates}}, {{ui:Import}}, {{ui:Export}}, {{ui:Map}} | Definir o sistema de coordenadas, importar e exportar ficheiros GIS, mostrar capas de mapa baixo o plano |
| Vista | {{ui:Select}}, {{ui:Fit}}, {{ui:3D}} | Escoller e mover cousas; ampliar para ver todo; mostrar o emprazamento en 3D ([Ver o emprazamento en 3D](topic:site-3d)) |

Unha ferramenta de debuxo queda premida mentres estea activa. Facer clic de novo nela, premer {{key:Esc}} ou premer {{key:V}} volve a {{ui:Select}}. {{ui:Undo}}, {{ui:Redo}}, {{ui:Copy}} e os elementos de {{ui:More}} aparecen atenuados cando non poden actuar; a suxestión di por que (por exemplo "Seleccione primeiro os puntos de levantamento"). Cada botón aparece en [Referencia da barra de ferramentas](topic:toolbar).

Nunha xanela estreita a barra de ferramentas despraza-se de lado.

## Panel esquerdo

### Sitio

- **Nome**: o nome do proxecto. Dá nome a cada ficheiro que garda ou exporta e imprímese no título do PDF.
- **Unidades**: {{ui:US feet}} ou {{ui:Metres}}. Indica o que significan os números. Cambialo **non** converte as coordenadas; vexa [Unidades, estacións e formatos de número](topic:units-and-stations).

### Puntos

Baleiro, indica como abrir un ficheiro de puntos. Con puntos, mostra o nome do ficheiro, o número de puntos e cantos teñen elevación, despois unha táboa de **grupos de puntos**: unha fila por cada primeira palabra da descrición (GRD, FL, TBS …), cun contador e unha opción **Superficie**:

- {{ui:Points}}: os puntos entran na superficie (o defecto de cada grupo).
- {{ui:Breakline}}: os puntos do grupo únense, por orde de número de punto, nunha liña de ruptura.
- {{ui:Left out}}: o grupo non toca a superficie.

### Superficie

Datos sobre o terreo existente: puntos, triángulos, elevación máis baixa e máis alta, elevación media, área 2D e 3D, liñas de ruptura e se hai un límite. Baixo os datos, unha caixa enumera calquera cousa que o construtor da superficie tivese que arranxar ou non puido facer. Despois:

- **Bordo exterior máis longo**: 0 conserva todos os triángulos exteriores; un número recorta os triángulos longos e finos do exterior.
- Ligazóns que aparecen cando se aplican: {{ui:Remove the boundary}}, {{ui:Remove drawn breaklines}} e, para unha superficie lida de LandXML, {{ui:Rebuild the surface from the points}}.

### Visualización

- **Superficie**: {{ui:Existing ground}} ou {{ui:Proposed (graded)}}. A segunda está dispoñible cando unha plataforma ou un corredor nivela sen problemas.
- **Curvas de nivel cada**, **Principal cada** e **Bandas** (o número de bandas de cor).
- Casillas: {{ui:Contours}}, {{ui:Contour labels}}, {{ui:Triangles}}, {{ui:Elevation bands}}, {{ui:Slope arrows}}, {{ui:Points}}, {{ui:Point labels}}, {{ui:Breaklines}}, {{ui:Surface edge}}, {{ui:Pipes}}.
- Aparece unha lenda das elevacións das bandas cando as bandas están activas.

A configuración de visualización gárdase co proxecto pero non son pasos de desfacer: {{key:Mod+Z}} nunca desmarca unha casilla.

## Plano

O plano mostra os puntos, a superficie e todo o que deseña, en vista de planta co norte arriba. Rode a roda para ampliar no punteiro, arrastre o espazo baleiro para desprazar. A lista completa está en [Teclas e rato](topic:keyboard).

- Nun proxecto baleiro unha caixa titulada **Comece cos puntos de levantamento** enumera os primeiros pasos e ofrece {{ui:Open the sample site}}.
- Mentres unha ferramenta de debuxo está activa, unha suxestión na parte superior do plano indica onde facer clic e como rematar.
- Arrastrar un ficheiro sobre o plano mostra "Solte un ficheiro de puntos, LandXML ou proxecto".
- Os elementos seleccionados resáltanse. Un trazado ou plataforma seleccionados mostran puños cadrados nos seus PI ou esquinas; unha estrutura seleccionada mostra un puño. Arrastre un puño para movelo.
- Os puntos de levantamento seleccionados teñen un aro. {{key:Shift}} e un clic engaden ou quitan un punto; {{key:Shift}} e un arrastre debuxan unha caixa (ou, arrastrada en volta deles, un lazo) que engade os puntos dentro. Vexa [Seleccionar, copiar e pegar puntos de levantamento](topic:copy-paste-points).

## Vista de perfil

Prema {{key:R}} ou prema {{ui:Profile}} para abrila baixo o plano. A súa barra ten:

- unha lista de trazados (activada cando hai dous ou máis trazados)
- {{ui:Add PVIs}}: mentres está premido, un clic no perfil engade un PVI ({{key:I}} alterna)
- unha lectura da estación, terreo, elevación de deseño, rasante e desmonte ou terraplén baixo o punteiro
- un botón de pechar

O perfil mostra o terreo existente, o perfil de deseño, as rasantes de cada tanxente, a estación e elevación de cada PVI, o L e o K de cada curva vertical cos seus BVC e EVC, os puntos altos e baixos, e a exaxeración vertical. Sempre ocupa todo o trazado: non amplía nin despraza. Ao mover o punteiro ao longo del, aparece un punto no trazado do plano.

## Panel dereito: Propiedades

O seu encabezado di o que mostra.

- **Proxecto** (nada seleccionado): os trazados e plataformas como ligazóns, o bloque **Movemento de terras** e o bloque **Rede de tubaxes** coas súas regras e problemas.
- **Trazado**: nome, estación inicial, lonxitude, a táboa de PI, as curvas, a táboa de PVI e os datos do perfil de deseño, e a configuración do **Corredor**.
- **Plataforma**: nome, elevación, taludes de desmonte e terraplén, área, datos de enlace co terreo e movemento de terras.
- **Estrutura** ou **Tubaxe**: tamaños, cotas de bordo e de fondo, pendente, recubrimento e calquera problema.
- **Punto** e o seu número: coordenadas do punto, elevación, descrición e grupo (só lectura).

Os campos aplícanse cando prema {{key:Enter}} ou saia do campo. Un valor non aceptado márcase como non válido e non cambia nada.

## Barra de estado

- **E** e **N**: coordenada leste e norte baixo o punteiro.
- Elevación do **terreo** alí (e **Nivelado** onde unha plataforma ou un corredor a cambiou), ou "Fóra da superficie".
- O trazado máis próximo (ou o seleccionado) coa **Sta** e o desvío (**L** ou **R**) baixo o punteiro.
- Á dereita, mensaxes: o que acaba de pasar, ou por que se rexeitou algo. Unha mensaxe bórrase sola tras uns segundos.

## Diálogos

- **Importar puntos**: abre con cada ficheiro de puntos. Vexa [Importar puntos de levantamento](topic:import-points).
- **Trazar o plano a PDF**: vexa [Trazar o plano a PDF](topic:plot-pdf).
- **Cambios sen gardar**: pregunta antes de {{ui:New}} ou de abrir un proxecto ou LandXML que descarte traballo sen gardar. {{ui:Save a copy}} descarga antes o proxecto.

## Pantallas pequenas

Ata 760 píxeles de ancho, como nun teléfono, o plano conserva a pantalla: a barra de ferramentas é unha fila que se despraza de lado, e os paneis ábrense como follas desde unha barra inferior. {{ui:Tools}} oculta a barra de ferramentas e {{ui:Move}} colócaa na parte inferior.
