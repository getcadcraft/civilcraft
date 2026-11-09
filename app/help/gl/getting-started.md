---
title: Primeiros pasos con CivilCraft
summary: Que fai CivilCraft, como se abre, e os primeiros dez minutos co emprazamento de exemplo, dos puntos ás curvas de nivel, unha estrada e un proxecto gardado.
keywords: inicio, primeira execución, emprazamento de exemplo, introdución, inicio rápido, tutorial, comezar, proxecto novo
from: c9b6dd8e
---

CivilCraft é a aplicación de deseño civil e de emprazamentos da familia CadCraft. Toma puntos de levantamento e convértaos nunha superficie (un TIN) con curvas de nivel; despois permite trazar alineacións con perfís de deseño, facer un corredor sinxelo de estrada, nivelar plataformas de edificios ata o terreo, comprobar unha rede de tubaxes por gravidade contra as súas regras e ver volumes de desmonte e terraplén. Le e escribe LandXML, exporta o plano a DXF e trázao a PDF.

Se usou Civil 3D, as ideas resultaranlle coñecidas: puntos, grupos de puntos, liñas de ruptura, trazados por PI, perfís por PVI, corredores, nivelación, redes de tubaxes. A forma de traballar é diferente, e moito máis pequena: non hai liña de comandos, nin estilos, nin ficheiro de debuxo. Lea [Procedente doutro software civil](topic:coming-from) unha vez antes do seu primeiro traballo real.

## Que necesita

- Un navegador recente de escritorio: Chrome, Edge, Firefox ou Safari. Vexa [Navegadores](common:browsers).
- Un rato ou panel táctil e un teclado, ou unha pantalla táctil: o debuxo ten alí os botóns en pantalla {{ui:Finish}}, {{ui:Undo point}} e {{ui:Cancel}} (vexa [Rato, panel táctil e tacto](topic:keyboard#mouse-trackpad-and-touch)).
- O plano debúxase en 2D coa lenzo do navegador. A [vista 3D](topic:site-3d) usa os gráficos WebGL do navegador; se non pode arrancar, a barra de estado di o motivo e o plano segue funcionando.
- Sen conta e sen envío. Os ficheiros ábrense no seu ordenador e gárdanse como descargas. Vexa [Os seus ficheiros](common:your-files).

:::note
CivilCraft funciona hoxe como unha versión inicial no navegador, que aínda se está a facer. Aínda non hai compilacións de escritorio nin gardado na nube. Todo o que faga queda no seu ordenador ata que o garde ou exporte.
:::

## Abrir CivilCraft

1. Abra CivilCraft no seu navegador.
2. Agarde a que a pantalla se encha: unha barra de ferramentas na parte superior, un panel á esquerda, o plano no centro e un panel **Propiedades** á dereita.
3. Nun plano baleiro vese unha caixa titulada **Comece cos puntos de levantamento**. Enumera os primeiros pasos e ten unha ligazón, {{ui:Open the sample site}}.

Para usar CivilCraft sen conexión máis tarde, prema {{ui:Save for offline}} na barra da aplicación e agarde a {{ui:Offline ready}}. Inclúe esta axuda, o emprazamento de exemplo e as bibliotecas 3D e GIS. Vexa [Sen conexión](common:offline). Prema {{key:F1}} ou {{ui:Help}} en calquera momento para abrir esta axuda xunto á aplicación.

## Os primeiros dez minutos: o emprazamento de exemplo

O emprazamento de exemplo é un pequeno levantamento en pés US: 276 puntos en coordenadas de plano estatal, unha cresta, unha vaguada cunha liña de fondo e dous topes de beira. Vén coa aplicación, así que pode seguilo sen un ficheiro propio.

1. Prema {{ui:Open the sample site}} na caixa do plano.
   Ábrese o diálogo **Importar puntos**. Di "276 puntos lidos como PNEZD (desde a fila de cabeceira), separados por comas." e mostra as primeiras filas.
2. Prema {{ui:Import}}.
   O plano énchese de puntos, curvas de nivel e o bordo da superficie. A barra de estado inferior di que os puntos se importaron e cantos triángulos ten a superficie (546).
3. Mire o panel esquerdo baixo **Puntos**. Os puntos agrúpanse pola primeira palabra da descrición: CP, FL, GRD, RIDGE, TBN, TBS e TREE.
4. Na columna **Superficie** desa táboa, estableza **FL**, **RIDGE**, **TBN** e **TBS** en {{ui:Breakline}}.
   A superficie reconstrúese de inmediato. Os datos da superficie din agora "Liñas de ruptura: 4", e as curvas de nivel dóblanse bruscamente ao longo da liña de fondo e da cresta en vez de cortalas.
5. Mova o punteiro sobre o plano. A barra de estado mostra a coordenada leste e norte baixo o punteiro e a elevación do terreo alí.
6. Baixo **Visualización**, estableza {{ui:Contours every}} en 0.5 ft e active {{ui:Elevation bands}}. Aparece unha rampa de cores cunha lenda baixo as casillas. Desactive de novo as bandas cando remate.

Agora ten unha superficie de terreo existente. Despois, unha estrada.

## Trazar unha estrada curta

1. Prema {{key:A}} (ou prema {{ui:Alignment}} no grupo **Deseño**).
2. Faga clic en tres puntos atravesando o emprazamento, un tras outro. Unha liña vermella segue o punteiro e mostra a lonxitude e o rumbo da seguinte tanxente.
3. Prema {{key:Enter}} para rematar.
   Aparece o trazado coa numeración de estacións. O panel dereito mostra **Trazado**: a súa lonxitude, a táboa de PI e a curva do PI central (radio de 100 ft, ou máis pequeno se 100 ft non cabe).
4. No panel dereito, baixo **Perfil de deseño**, prema {{ui:Start from the ground}}.
   Ábrese a vista de perfil baixo o plano co terreo existente e unha rasante de deseño recta de extremo a extremo.
5. Prema {{key:I}} para activar {{ui:Add PVIs}}, e logo faga clic unha vez na vista de perfil preto do centro. Aparece un PVI.
6. Na táboa de PVI do panel dereito, escriba unha lonxitude de curva (por exemplo 100) na caixa **Curva L** do PVI central e prema {{key:Enter}}. O perfil ten agora unha curva vertical, cun valor K etiquetado.
7. Baixo **Corredor**, marque **Barrer un conxunto ao longo do perfil de deseño**.
   A estrada nivélase no terreo: carrís, arcéns e taludes ata o enlace co terreo. O bloque **Movemento de terras** mostra desmonte e terraplén.

Non se preocupe polos valores exactos. Cada número pode cambiarse no panel dereito, e {{key:Mod+Z}} desfai o último cambio.

## Gardar o seu traballo

1. Escriba un nome en **Nome**, na parte superior do panel esquerdo.
2. Prema {{key:Mod+S}} (ou prema {{ui:Save}}).
   O navegador descarga un ficheiro con nome segundo o emprazamento, que remata en `.civilcraft.json`. Contén os puntos, a configuración da superficie, os trazados, perfís, corredores, plataformas e tubaxes.
3. Para seguir máis tarde, prema {{ui:Open}} (ou prema {{key:Mod+O}}) e escolla ese ficheiro, ou solteo no plano.

:::warning
Non hai gardado automático. Se pecha a lapela con cambios sen gardar, o navegador pregunta se quere saír; se sae, os cambios perdéronse. Garde a miúdo.
:::

## Onde ir despois

- [Importar puntos de levantamento](topic:import-points) cos seus propios ficheiros.
- [Construír e refinar a superficie](topic:build-surface) con liñas de ruptura e un límite.
- [A pantalla, parte por parte](topic:workspace).
- [Teclas e rato](topic:keyboard).
