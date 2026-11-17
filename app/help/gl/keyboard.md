---
title: Teclas e rato
summary: Cada atallo de teclado e cada acción de rato, trackpad e tacto en CivilCraft, agrupados, con as diferenzas entre navegadores e plataformas.
keywords: teclado, atallos, teclas de atallo, teclas, rato, trackpad, tacto, desprazar, zoom, pinza, roda, clic dereito, mac, tecla command
from: a9756f46
---

As teclas dunha soa letra funcionan cando non está escribindo nunha caixa. Os atallos con {{key:Mod}} usan Command nun Mac e Ctrl nos demais. Ver tamén [Teclas no navegador](common:keys).

## Ficheiros e edición

| Tecla | Acción |
|---|---|
| {{key:Mod+O}} | Abrir un ficheiro de puntos, LandXML ou proxecto |
| {{key:Mod+S}} | Gardar o proxecto (descarga un ficheiro `.civilcraft.json`) |
| {{key:Mod+P}} | Imprimir o plano en PDF (abre o diálogo de impresión, non o do navegador) |
| {{key:Mod+Z}} | Desfacer |
| {{key:Mod+Y}} | Refacer |
| {{key:Delete}} | Eliminar os puntos topográficos, aliñación, plataforma, estrutura, tubaxe ou PVI seleccionados |
| {{key:Mod+C}} | Copiar os puntos seleccionados (tamén como filas de puntos para unha folla de cálculo) |
| {{key:Mod+X}} | Cortar os puntos seleccionados |
| {{key:Mod+V}} | Pegar puntos: seguen o punteiro, faga clic onde deben ir |
| {{key:Mod+Shift+V}} | Pegar no mesmo sitio: nas coordenadas propias dos puntos |
| {{key:Mod+D}} | Duplicar os puntos seleccionados: unha copia segue o punteiro |
| {{key:Mod+A}} | Seleccionar todos os puntos topográficos |
| {{key:Esc}} | Non seleccionar nada (e cancelar unha pegada) |

{{key:Mod+S}}, {{key:Mod+O}} e {{key:Mod+P}} funcionan mesmo mentres escribe nunha caixa. {{key:Mod+Z}} e {{key:Mod+Y}} nunha caixa de texto desfán o que escribiu, como é habitual, e o mesmo fan {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} e {{key:Mod+A}}: nunha caixa copian, cortan, pegan e seleccionan o seu texto. Con texto seleccionado na páxina (nun panel), {{key:Mod+C}} copia ese texto. {{key:Mod+Shift+Z}} non fai nada en CivilCraft: use {{key:Mod+Y}} ou o botón {{ui:Redo}}.

:::mac
A tecla do Mac marcada como **delete** é {{key:Backspace}} para o navegador. Para eliminar unha selección, prema {{key:Delete}} (Fn e delete), ou escolla {{ui:Delete}} no menú {{ui:More}} da barra de ferramentas.
:::

## Ferramentas

| Tecla | Ferramenta |
|---|---|
| {{key:V}} | {{ui:Select}} |
| {{key:M}} | {{ui:Measure}}: distancias, áreas e pendentes no plano ([Medir](topic:measure)) |
| {{key:A}} | {{ui:Alignment}} |
| {{key:G}} | {{ui:Pad}} |
| {{key:P}} | {{ui:Pipes}} |
| {{key:B}} | {{ui:Breakline}} |
| {{key:O}} | {{ui:Boundary}} |
| {{key:R}} | Amosar ou ocultar a vista do perfil |
| {{key:I}} | Activar ou desactivar {{ui:Add PVIs}} (abre a vista do perfil se está pechada) |
| {{key:F}} | {{ui:Fit}}: amosar todo |
| {{key:D}} | {{ui:3D}}: amosar o sitio en 3D, ou volver ao plano |
| {{key:E}} | Amosar ou ocultar pendentes e cotas ao longo de cada liña de elemento (só na pantalla) |

Premer a tecla da ferramenta activa de novo volve a {{ui:Select}}. As letras con Shift non fan nada.

## Mentres debuxa

| Tecla | Acción |
|---|---|
| {{key:Enter}} | Rematar a aliñación, a plataforma, o tramo de tubaxe, a liña de ruptura ou o límite |
| {{key:Backspace}} | Eliminar o último punto marcado |
| {{key:C}} | Liña de elemento: activar ou desactivar os arcos (despois dun vértice, faga clic nun punto da curva, e logo no seu extremo) |
| {{key:Esc}} | Cancelar o debuxo (ou a pegada); premida de novo (ou sen nada debuxado), volve a {{ui:Select}} e borra a selección |

## Vista do plano

| Tecla ou acción | Resultado |
|---|---|
| Roda | Achegar ou afastar o zoom no punteiro |
| Arrastrar sobre espazo baleiro | Desprazar (en calquera ferramenta; un clic curto segue facendo clic; con {{key:Shift}} premida debuxa unha caixa de selección) |
| Arrastrar co botón central | Desprazar |
| Arrastrar co botón dereito | Desprazar (non se abre ningún menú) |
| {{key:Space}} e arrastrar | Desprazar |
| Clic | Seleccionar (con {{ui:Select}}), ou situar un punto (cunha ferramenta de debuxo) |
| {{key:Shift}} e clic | Engadir un punto topográfico á selección, ou quitalo |
| {{key:Shift}} e arrastrar | Debuxar unha caixa: os puntos topográficos dentro engádense á selección. Arrastre ao redor deles para un [lazo](topic:lasso-selection) |
| {{key:Space}} mentres debuxa un lazo | Xanela, despois cruzamento, despois valado |
| Clic mentres pega | Pór alí os puntos pegados ({{key:Enter}} os pon nas súas propias coordenadas) |
| Arrastrar un agarre | Mover unha PI, unha esquina de plataforma ou unha estrutura (un paso de desfacer) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Desprazar, cando o plano ten o foco (faga clic nel primeiro) |
| {{key:Plus}} e {{key:Minus}} | Achegar e afastar o zoom no centro, cando o plano ten o foco |

A tecla = achega o zoom igual que {{key:Plus}}, así que non fai falta Shift.

## Vista do perfil

| Acción | Resultado |
|---|---|
| Clic con {{ui:Add PVIs}} activado | Engadir un PVI alí |
| Clic nun PVI | Seleccionalo |
| Arrastrar un PVI | Movelo (un paso de desfacer) |
| {{key:Delete}} ou {{key:Backspace}} | Eliminar o PVI seleccionado ({{key:Backspace}} só cando a vista do perfil ten o foco) |

A vista do perfil non fai zoom nin desprazamento.

## Pantalla e axuda

| Tecla | Acción |
|---|---|
| {{key:F1}} | Abrir ou pechar esta axuda (o panel lateral); {{ui:Help}} na barra da aplicación fai o mesmo |
| {{key:Esc}} | Pechar o panel de axuda cando está aberto |
| {{key:Ctrl+Shift+F}} | Pasar polos modos de pantalla: pantalla completa, pantalla completa con as barras ocultas, normal |
| {{key:Esc}} | Saír da pantalla completa (tecla propia do navegador) |

{{key:F1}} chega á axuda antes que CivilCraft, así que funciona en calquera ferramenta. En case todos os teclados de Mac, prema fn con F1, ou faga clic en {{ui:Help}}. {{key:Ctrl+Shift+F}} usa a tecla Control en todas as plataformas, incluído un Mac. Ver [Usar a axuda](common:help) para saber como buscar nesta axuda.

## Rato, trackpad e tacto

:::mouse
- A roda achega o zoom no punteiro. Un rato con roda de xiro libre fai zoom rápido: dea xiros curtos.
- Desprace con calquera arrastre sobre espazo baleiro, co botón central, co botón dereito, ou con {{key:Space}} e arrastrar.
:::

:::mac
No trackpad dun Mac:

- Desprazar con dous dedos **fai zoom** (non desprace), e o pinzamento tamén fai zoom.
- Para desprazar, prema e arrastre sobre espazo baleiro cun dedo, ou manteña {{key:Space}} e arrastre.
- Un clic con dous dedos (clic dereito) non abre ningún menú e non fai nada por si só.
:::

:::touch
Nunha pantalla táctil:

- O primeiro toque fai que os botóns e as filas de menú teñan o tamaño dun dedo.
- Toque para seleccionar ou para situar un punto; un dedo arrastrado sobre espazo baleiro desprace. Un toque pode tremer un pouco: só desprace cando o dedo se move uns 10 píxeles.
- Dous dedos pinzan para facer zoom e movense xuntos para desprazar.
- Arrastre un agarre ou un PVI cun dedo. Os agarres dan un ancho de dedo de marxe.
- Mentres debuxa unha aliñación, plataforma, liña de ruptura, límite, tramo de tubaxe, liña de elemento ou parcela, unha barra sobre o plano ofrece {{ui:Finish}} ({{key:Enter}}), {{ui:Undo point}} ({{key:Backspace}}) e {{ui:Cancel}} ({{key:Esc}}). Unha pulsación longa (medio segundo sen moverse) tamén remata.
- En {{ui:Select}}, unha pulsación longa sobre un punto topográfico engádeo á selección, ou quítao, igual que faría Shift e clic.
- Na vista 3D, un dedo orbita, dous pinzan e desprazan, e un toque escolle.
- No tacto non hai pasar por encima, así que as lecturas da barra de estado só se actualizan mentres un dedo está apoiado.
:::

## Atallos do navegador que prevalecen

Algunhas teclas pertencen ao navegador e nunca chegan a CivilCraft, por exemplo {{key:Mod+W}} (pechar pestana), {{key:Mod+T}} (nova pestana), {{key:Mod+N}} (nova xanela) e {{key:F11}} (pantalla completa en navegadores de Windows e Linux). CivilCraft non as usa. Se un atallo abre algo no navegador, faga clic unha vez no plano para que a páxina teña o foco, e probe de novo.

## Onde está Mover

Non hai ningún comando Mover: escolla {{ui:Select}} e arrastre un punto ou un vértice, ou edite as súas coordenadas en {{ui:Properties}}. Ver [Editar puntos](topic:edit-points).
