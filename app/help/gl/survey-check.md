---
title: Revisar un debuxo de levantamento na importación
summary: Ler as cotas escritas como texto ou en atributos de bloque como puntos de levantamento, e revisar un DWG ou DXF por unidades incorrectas, sen sistema de coordenadas, unha orixe moi afastada, curvas planas, cotas estrañas e puntos duplicados antes de construír o terreo a partir del.
keywords: revisión de levantamento, revisión de importación, cotas de levantamento, cotas puntuais, cotas en texto, atributos, unidades, sistema de coordenadas, lonxe da orixe, curvas a cero, valores atípicos, puntos duplicados, problemas, arquitectura paisaxística, debuxo de levantamento
from: d46acd24
---

Un debuxo de levantamento pode parecer correcto e aínda así estar mal para un terreo: as súas unidades poderían estar adiviñadas, as súas curvas de nivel poderían estar planas á altura 0, ou as súas cotas poderían estar escritas como texto que non é xeometría en absoluto. A sección **Cotas de levantamento e revisión** do diálogo {{ui:Linework}} (vexa [Abrir un DWG ou DXF como liñas de debuxo](topic:open-dwg-dxf)) le esas cotas e indica o que parece mal antes de engadir nada.

## Cotas escritas como texto ou en atributos

Moitos debuxos de levantamento dan unha cota puntual como un pequeno texto xunto a unha cruz, como `104.37` ou `EL 104.37`, ou como un atributo dun bloque de punto. Non son liñas, así que o lector de liñas non as inclúe. A sección indica cantas atopou e permítelle tomalas como **puntos de levantamento**:

1. Marque **Tomar … cotas como puntos de levantamento**. Comezan sen marcar, porque non todo número dun debuxo é unha altura.
2. Lense o texto cando é unha cota por si mesmo: un número cunha parte decimal (`104.37`, `+104,37`, `-3.50`), ou un número despois de `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ou `LEVEL`, con `m`, `ft` ou `'` opcional despois. Un número enteiro só (`12`) léese como número de lote ou de folla, non como cota; non se lé texto como `GATE 3` ou unha data. Os códigos de formato do texto ignóranse.
3. Para atributos de bloque, escolla **Atributo de bloque que contén a cota**. CivilCraft atopa por si mesmo unha etiqueta chamada ELEV, Z, LEVEL, RL ou similar; escolla outra da lista se o debuxo usa a súa. A elección recórdase para ese nome de ficheiro neste ordenador, así que ao abrilo de novo comeza na mesma etiqueta. Unha etiqueta que escolla tamén toma números enteiros como cotas.
4. Prema {{ui:Add}}. Os puntos se numeran despois do número máis alto do proxecto, cada punto se describe coa súa capa (ou o seu bloque), e as alturas se converten ás unidades do proxecto como o resto do debuxo. Todo isto é un só paso: {{key:Mod+Z}} retira os puntos.

O texto sitúase no seu propio punto de inserción (ou no seu punto de alineación cando o ten). O texto dentro dos bloques non se lé, e o debuxo nunca se modifica.

## A revisión

A revisión se executa sobre o que está a piques de traer e lista o que atopa, unha liña para cada tipo de problema:

| Indica | Que significa |
|---|---|
| **Unidades sen indicar** | O debuxo non di cales son as súas unidades, así que os seus números se len como unidades do proxecto. Comprobe unha distancia que coñeza. |
| **Unidades convertidas** | As unidades do debuxo difiren das do proxecto e escálanse (unha nota, non un fallo). |
| **Os datos abarcan … km** ou **… m** | A extensión é maior que 200 km ou menor que medio metro, o que xeralmente indica unha unidade incorrecta (milímetros lidos como metros, ou ao revés). |
| **Sen sistema de coordenadas** | O proxecto non ten ningún. É un aviso cando os datos están lonxe de cero, como sucede coas coordenadas de plano estatal ou de rede nacional. Vexa [Sistemas de coordenadas](topic:coordinate-systems). |
| **Lonxe da orixe** | Os datos están a máis de 100 km de cero. Lonxe de cero, as vistas 3D e as exportacións perden precisión e tremen. |
| **A capa de curvas … non ten altura** | Unha capa cun nome de curvas (TOPO, CONT, CNTR, CONTOUR) contén liñas á altura 0, así que un terreo construído con elas sería plano. |
| **Cotas exactamente 0** | Algunhas cotas son 0 mentres a cota típica está moi lonxe: probablemente faltan alturas. |
| **Cotas moi afastadas do resto** | Algunhas cotas quedan moi fóra das outras (calculado respecto ao punto medio de todas as cotas, así que un lugar empinado cun rango amplo non se marca), ou por riba de 9.000 m ou por baixo de -11.000 m. |
| **Puntos enriba doutro punto** | Dous puntos no mesmo lugar coa mesma cota, ou con cotas distintas. |

Despois de premer {{ui:Add}}, as mesmas liñas van a **Problemas**, unha por tipo, co nome do ficheiro, para que poida volver a elas. A revisión xulga o debuxo; non modifica nada nel e non lle impide usalo.

:::tip
Cando a revisión di que as curvas están planas a 0 e hai cotas escritas como texto, tómeas como puntos de levantamento: adoitan levar as alturas reais que lles faltan ás liñas de curvas.
:::

## O que non se revisa

A revisión non compara o debuxo cun segundo levantamento, e non pode saber en que sistema de coordenadas está o debuxo: só indica que non hai ningún definido.
