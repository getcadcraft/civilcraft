---
title: Deseñar unha rede de tubaxes por gravidade
summary: Debuxe tramos de pluvial ou saneamento estrutura por estrutura, fixe as súas regras de pendente, recubrimento e caída, deixe que CivilCraft fixe as cotas de fondo, e corrixa os problemas que lista.
keywords: construtor de estruturas, tipo de estrutura, estrutura rectangular, pozo de rexistro, sumidoiro, marco, recubrimento, espesor de parede, elemento da biblioteca, rede de tubaxes, pluvial, saneamento, colector, estruturas, pozos de rexistro, sumidoiros, cotas de fondo, pendente, caída, brocal, pozo colector, tubaxes por gravidade
from: 10a3c14d
---

Un proxecto contén unha rede de tubaxes por gravidade, pluvial ou de saneamento. Compóñena estruturas (pozos de rexistro, sumidoiros) e tubaxes rectas entre elas. O fluxo vai na dirección en que as debuxa. CivilCraft comproba cada tubaxe e cada estrutura contra tres regras que vostede fixa, e pode fixar todas as cotas de fondo a partir desas regras.

## Debuxar un tramo

Pode debuxar tubaxes sen superficie, pero os brocais, o recubrimento e as cotas de fondo automáticas precísana.

1. Prema {{key:P}}, ou prema {{ui:Pipes}} no grupo **Deseño**.
   A indicación di "Tubaxes: prema nas estruturas desde o alto do tramo cara abaixo (prema nunha existente para unirse a ela). Enter remata."
2. Prema onde vai a estrutura augas arriba. Colócase unha estrutura.
3. Prema en cada estrutura seguinte augas abaixo. Para conectarse a unha estrutura que xa existe, prema nela: a barra de estado di "Unida S3."
4. Prema {{key:Enter}}.
   As tubaxes debúxanse, fíxanse as súas cotas de fondo segundo as regras, e a barra de estado di, por exemplo, "3 tubaxes debuxadas, 12 cotas de fondo fixadas segundo as regras; todas as comprobacións superadas."

As novas estruturas nómanse S1, S2 … cun diámetro de 48 in (1200 mm). As novas tubaxes nómanse P1, P2 … cun diámetro de 12 in (300 mm). Os diámetros están en polgadas nun proxecto en pés e en milímetros nun proxecto en metros.

Remate con {{key:Enter}}. Tamén funciona o dobre clic, pero cando fai dobre clic nunha estrutura existente para rematar alí o tramo, a unión descártase: prema unha vez nela e logo prema {{key:Enter}}.

## Fixar as regras

Sen nada seleccionado, o panel dereito (**Proxecto**) ten un bloque **Rede de tubaxes**:

| Axuste | Valor inicial | Significado |
|---|---|---|
| Tipo | {{ui:Storm}} | {{ui:Storm}} ou {{ui:Sanitary}}; escríbese en LandXML |
| Pendente mínima | 0,50 % | Cada tubaxe debe caer polo menos isto |
| Recubrimento mínimo | 2 ft (0,6 m) | Do terreo á coroa da tubaxe, en toda a súa lonxitude |
| Caída nas estruturas | 0,10 ft (0,03 m) | A cota de fondo de saída debe estar polo menos esta distancia por baixo de cada cota de fondo de entrada |

**Estes valores iniciais son marcadores, non unha norma.** Fixe os valores que a súa axencia ou proxecto requira. O recubrimento mídese desde o terreo ata a coroa (cota de fondo máis o diámetro interior); o espesor de parede non se conta. Onde se nivelan plataformas ou corredores, a superficie nivelada é o terreo.

## Deixar que CivilCraft fixe as cotas de fondo

- {{ui:Set every invert from the rules}} (no bloque **Rede de tubaxes**) fixa todas as tubaxes.
- {{ui:Set its inverts from the rules}} (con unha tubaxe seleccionada) fixa só esa tubaxe.

Traballando augas abaixo, cada tramo comeza con polo menos o recubrimento na súa estrutura superior, cae polo menos a pendente mínima, baixa polo menos a caída en cada estrutura, e vai máis fondo onde o terreo ao longo da tubaxe deixaría menos que o recubrimento mínimo. As cotas de fondo redondéanse por baixo, a 0,01, nunca por enriba. A barra de estado di "Cotas de fondo fixadas: recubrimento mínimo no alto de cada tramo, pendente mínima polo menos, caída mínima en cada estrutura." ou nomea o que non puido facer.

## Editar estruturas e tubaxes

Prema unha estrutura ou tubaxe con {{ui:Select}} para velo no panel dereito.

**Estrutura**: **Nome**, **Brocal**, **Profundidade do pozo colector**, **Diámetro**, despois **Brocal usado**, **Pozo colector**, **Este** e **Norte**, e as tubaxes de entrada e saída coas súas cotas de fondo.

- Deixe **Brocal** baleiro para tomalo da superficie; a caixa amosa entón o valor da superficie en gris. Escriba un valor para fixar o brocal.
- Arrastre o agarradoiro da estrutura no plano para movela. As súas tubaxes seguen; as súas cotas de fondo quedan como estaban, así que comprobe os problemas despois.

**Tipo**: escolla un dos tipos de estrutura da rede (abaixo), ou ningún para unha estrutura redonda co seu propio diámetro.

**Tubaxe**: **Nome**, as estruturas entre as que vai, **Diámetro**, **Cota de fondo superior**, **Cota de fondo inferior**, despois **Lonxitude**, **Pendente** e **Recubrimento mínimo**.

Prema {{key:Enter}} despois de cada valor.

## Ler e corrixir problemas

O bloque **Rede de tubaxes** lista cada problema (ata 40); prema nun para seleccionar a tubaxe ou estrutura. Unha tubaxe ou estrutura seleccionada lista os seus propios. Sen nada seleccionado, di "Todas as tubaxes e estruturas cumpren as regras."

| Mensaxe (exemplos) | Que facer |
|---|---|
| "P2 vai cara arriba (-0,40 %)." ou "… vai horizontal …" | Intercambie as cotas de fondo, ou fíxeas segundo as regras. |
| "P2, ao 0,30 %, é máis plana que o mínimo do 0,50 %." | Baixe a cota de fondo augas abaixo ou suba a augas arriba. |
| "P3 ten 1,40 de recubrimento 35 ao longo dela, menos que o mínimo 2." | Baixe a tubaxe; fíxe as súas cotas de fondo segundo as regras. |
| "En S3, P4 sae a 245,20, menos de 0,1 por baixo de P3, que entra a 245,25." | Baixe a cota de fondo superior da tubaxe de saída. |
| "A coroa de P1 está por enriba do brocal de S1." | A tubaxe está demasiado alta para a estrutura. |
| "S2 ten 2 tubaxes de saída; unha rede por gravidade debe ter unha saída por cada estrutura." | Elimine unha tubaxe de saída, ou debúxea de novo na dirección correcta. |
| "As tubaxes forman un lazo; o fluxo ten que rematar nunha saída." | Debuxouse un tramo que volve sobre si mesmo; elimine unha tubaxe. |
| "S5 está fóra da superficie e non ten cota de brocal." | Escriba un brocal, ou mova a estrutura sobre a superficie. |
| "P6 vai en parte fóra da superficie; o recubrimento alí é descoñecido." | Estenda a superficie, ou acepte que alí non se comproba o recubrimento. |
| "P7 aínda non ten cotas de fondo." | Escríbaas, ou fíxeas segundo as regras. |

As tubaxes e estruturas con problemas tamén se marcan en vermello no plano.

## Tipos de estrutura

Un tipo de estrutura é unha estrutura construída a partir dos seus parámetros: un pozo de rexistro, sumidoiro, caixa de unión ou saída, **redonda** (diámetro interior) ou **rectangular** (ancho e lonxitude interiores), co seu espesor de parede, unha **laxe do fondo**, un **pozo colector** por baixo da tubaxe máis baixa e un **marco e tapa** (abertura redonda ou rectangular, altura do marco). Os tipos pertencen á rede, baixo **Tipos de estrutura** nas Propiedades do proxecto.

1. Prema {{ui:New structure type}}. O diálogo debuxa a estrutura no plano e en sección mentres escribe.
2. Prema {{ui:Add the type}}.
3. Seleccione unha estrutura e escolla o tipo baixo **Tipo**. Toma o tamaño e o pozo colector do tipo; o seu propio pozo colector aínda se pode cambiar.

Edite un tipo e cada estrutura dese tipo segue os seus tamaños. Elimine un tipo e as súas estruturas quedan como estruturas redondas do mesmo ancho. Cada cambio é un paso: {{key:Mod+Z}} o desfai.

Unha estrutura rectangular dibúxase no plano, en DXF, DWG e PDF, e en 3D como un rectángulo coa súa lonxitude ao longo da súa tubaxe de saída; as tubaxes comezan na súa parede. LandXML escríbea como estrutura rectangular (`RectStruct`) co seu espesor de parede, e lee esas estruturas de volta como tipos.

### Compartir un tipo a través da biblioteca

{{ui:Save as library item}} escribe o tipo como elemento da biblioteca de CadCraft (un ficheiro `.json`): o seu símbolo en planta, un corpo 3D ata unha profundidade típica, e todos os tamaños. Envíeo á biblioteca para compartilo. {{ui:Open a library item}} lee de volta unha estrutura gardada así na rede, convertida ás unidades do proxecto. Os elementos da biblioteca que non son estruturas feitas en CivilCraft recházanse, co motivo indicado.

## Eliminar

Seleccione unha tubaxe e prema {{key:Delete}} para a eliminar. Eliminar unha estrutura elimina tamén as tubaxes conectadas a ela. En Mac, prema Fn e {{key:Delete}}, ou prema {{ui:Delete}}.

## Aínda non construído

Os caudais, os tamaños de tubaxe e a liña de gradiente hidráulico están en [Drenaxe pluvial](topic:storm-drainage). Os catálogos de tubaxes, as tubaxes non circulares, as tubaxes na vista de perfil, as tubaxes curvas e máis dunha rede por proxecto aínda non están dispoñibles. Vexa [Aínda non construído](topic:not-built-yet).
