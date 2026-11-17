---
title: Plantillas de corredor e plantillas de terreo
summary: Cree plantillas pequenas reutilizables (bordo e sarxeta, beirarrúa, muro, cuneta), constrúa un corredor con elas por estaca, coa esquerda e a dereita separadas, divida un trazado en varios corredores e aplique materiais por capas sobre un terreo.
keywords: plantilla, plantillas, biblioteca de plantillas, creación de plantillas, sección tipo, conxunto, subconxunto, compoñentes, códigos de punto, condición final, taludes, cuneta, muro de contención, bordo, sarxeta, beirarrúa, zonas, intervalo de estacas, varios corredores, esquerda e dereita, plantilla de terreo, terra vexetal, firme, base, aplicar por capas, materiais, cantidades
from: ce70e58b
---

Unha **plantilla** é unha pequena sección transversal que debuxa unha vez e reutiliza: puntos con desprazamentos, pendentes e códigos de punto, e compoñentes con materiais. Un corredor pode construírse con plantillas por estaca, cada lado coas súas propias plantillas de firme e a súa propia condición final, e as mesmas plantillas poden aplicarse por capas sobre un terreo.

:::warning
As plantillas de exemplo son marcadores de posición para partir delas. Os seus números non proveñen de ningunha norma nin organismo. Un enxeñeiro debe revisar cada plantilla e cada valor que lle dea antes de usala nun deseño.
:::

## Abrir as plantillas

Abra {{ui:Superficie}} › {{ui:Máis}} › {{ui:Plantillas do corredor…}} (ou escriba {{cmd:TEMPLATES}}). A xanela ten tres listas:

- **Neste proxecto**: as plantillas que usan os corredores e as plantillas de terreo deste proxecto. Gárdanse no ficheiro do proxecto.
- **Miña biblioteca**: plantillas gardadas neste navegador e ofrecidas en todos os proxectos. Use {{ui:Gardar en Miña biblioteca}} nunha plantilla do proxecto para gardala.
- **Exemplos**: dúas faixas con capas, bordo e sarxeta, beirarrúa, taludes, cuneta, muro de contención, terra vexetal baixo o terreo e firme sobre o terreo. Cada un está marcado como «Para revisión por un enxeñeiro».

{{ui:Usar neste proxecto}} copia unha plantilla da biblioteca ou de exemplo ao proxecto. {{ui:Exportar as plantillas deste proxecto}} gárdaas nun ficheiro `.cctemplates.json`, e {{ui:Importar un ficheiro}} lee un deles no proxecto e en Miña biblioteca. Use o ficheiro para compartir plantillas ou levalas a outro ordenador.

## Crear unha plantilla

{{ui:Nova plantilla}} (ou {{ui:Editar}} nunha plantilla do proxecto) abre o editor de plantillas. Debuxe o lado dereito, cara a fóra desde o punto 0,0 da plantilla; o lado esquerdo usa a mesma plantilla cara a fóra á esquerda.

1. Dé un nome e un tipo: **Firme** (a seguinte plantilla únese ao seu final), **Condición final** (encontra o terreo) ou **Plantilla de terreo**.
2. Engada **valores**: números con nome, como unha anchura `w` ou unha pendente `s`. Unha caixa de número en calquera punto da plantilla acepta un número ou o nome dun valor; `-t` é o valor `t` en negativo. Un corredor pode dar a cada uso da plantilla os seus propios valores, para que unha única plantilla de bordo sirva para todas as alturas de bordo.
3. Engada **puntos** por orde. Cada un sitúase a partir dun punto anterior (ou do punto 0,0) segundo a súa restrición:

| Restrición | Sitúa o punto |
|---|---|
| Desprazamento con pendente | Un desprazamento cara a fóra e unha pendente (desnivel por distancia; −0,02 baixa un 2%) |
| Desprazamento e desnivel | Un desprazamento e un desnivel |
| En vertical, cara arriba ou abaixo | Só un desnivel |
| Talud lateral ata o terreo | Cara a fóra desde o seu punto ata o terreo, coa relación de desmonte onde o terreo está por riba e a de terraplén onde está por baixo |
| Ata o terreo | Un desprazamento, e despois en vertical cara arriba ou abaixo ata o terreo |
| Muro de contención | Un muro do grosor que dea: en desmonte, a súa parte superior encontra o terreo na cara da estrada; en terraplén, a estrada pasa por riba e a súa cara exterior baixa ata o terreo |

   Marque **Superior** nos puntos por onde pasa a superficie acabada. O último punto superior é onde comeza a seguinte plantilla dese lado. Un **Obxectivo** permite que un corredor mova o punto: o seu desprazamento ou a súa cota proveñen dunha liña.
4. Engada **compoñentes**: formas pechadas a través de códigos de punto (`0` é o punto 0,0), cada unha cun nome, un material e un tipo. As súas áreas dan os volumes.

O debuxo segue cada cambio a escala real, e a lista debaixo indica o que está mal (un punto que encontra o terreo antes do final, un valor que a plantilla non ten, un compoñente sen área). {{ui:Engadir a este proxecto}} ou {{ui:Gardar}} conserva a plantilla, nun só paso de desfacer.

## Construír un corredor con plantillas

Seleccione un trazado con corredor e, nas súas propiedades, active {{ui:Construír a partir de plantillas por estaca}}. O corredor comeza cos exemplos de dúas faixas e de taludes nos dous lados.

- **Zonas.** Cada zona comeza nunha estaca e chega ata a seguinte. {{ui:Engadir unha zona}} engade unha; cambie a estaca de inicio na súa caixa.
- **Esquerda e dereita por separado.** Cada lado de cada zona ten a súa propia lista de **Firme**, desde o eixe cara a fóra, e a súa propia **Condición final**: taludes, unha cuneta, un muro ou calquera plantilla que encontre o terreo. Sen condición final, o lado remata nos taludes de desmonte e terraplén do corredor. {{ui:Copiar da esquerda á dereita}} copia un lado.
- **Valores e obxectivos.** Debaixo de cada plantilla dun lado, unha caixa por cada valor (baleira = o valor propio da plantilla) e, para un punto que leva obxectivo, a liña de elemento ou a liña doutro corredor que o move.
- **Desde** e **Ata** limitan o corredor a unha parte do trazado.

As seccións, as liñas do plano para cada código de punto, a superficie proposta, o replanteo e o movemento de terras seguen todos. Propiedades lista o volume de cada compoñente por lado e zona (áreas medias das seccións extremas ao longo do eixe). O peralte e os obxectivos de bordo do corredor non se usan mentres o corredor se constrúe con plantillas.

## Varios corredores nun mesmo trazado

Debaixo de **Corredores neste trazado**, {{ui:Engadir un corredor}} engade un corredor no resto do trazado: ao primeiro corredor dáselle unha estaca final no medio (ou conserva a súa), e o novo comeza aí coa última zona de plantillas do primeiro. Cada corredor ten o seu propio nome, intervalo de estacas, plantillas e movemento de terras. Desactive un deles coa súa caixa {{ui:Activado}}. Onde dous intervalos se solapan, o corredor posterior nivela sobre o anterior.

## Plantillas de terreo

Unha plantilla de terreo aplica as capas dunha plantilla sobre un terreo a partir do seu punto 0,0: unha capa por debaixo do punto 0,0 entra no terreo (terra vexetal a retirar), unha capa por enriba asenta sobre el (base e firme nun aparcadoiro). As anchuras e as pendentes non importan; só importa a profundidade de cada compoñente por encima ou por debaixo do punto 0,0.

Abra {{ui:Superficie}} › {{ui:Máis}} › {{ui:Plantillas de terreo…}} (ou escriba {{cmd:TERRAINTEMPLATES}}); o bloque tamén está nas propiedades do proxecto. {{ui:Engadir unha plantilla de terreo}} engade unha co exemplo de terra vexetal. Para cada unha escolla:

- a **plantilla** (os seus valores poden cambiarse só para esta),
- o **terreo**: o terreo existente ou a superficie proposta,
- a **forma** que o recorta: todo o terreo, unha parcela, unha plataforma ou unha liña de elemento pechada. Varias plantillas de terreo poden usar formas distintas sobre o mesmo terreo.

Cada capa indica o seu grosor, a súa área en planta e o seu volume. O volume é a área en planta por o grosor, medido en vertical cara abaixo; a área mídese sobre unha malla, e tamén se dá a área aplicada (inclinada). As formas debúxanse no plano na capa C-TOPO-TMPL. As plantillas de terreo non cambian a superficie proposta.

## Materiais e cantidades

O bloque de movemento de terras do proxecto lista **Materiais das plantillas**: cada compoñente do corredor e cada capa de plantilla de terreo co seu volume. {{ui:Enviar a TakeoffCraft}} escríbeos no ficheiro de cantidades despois do desmonte e do terraplén, un elemento por cada un, en iardas cúbicas (proxectos en pés) ou metros cúbicos.

## Ficheiros

As plantillas, as zonas, os corredores adicionais e as plantillas de terreo gárdanse no ficheiro do proxecto. Un proxecto que non usa nada disto gárdase exactamente igual que antes, e as versións anteriores de CivilCraft abren un proxecto que os usa (ignoran as plantillas e constrúen o conxunto propio do corredor).
