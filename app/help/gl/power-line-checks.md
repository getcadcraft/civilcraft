---
title: Comprobacións das liñas eléctricas
summary: O que CivilCraft comproba en cada liña e cable, sempre ao día: franquías, separacións, oscilación, elevación, cargas e dimensionamento dos apoios, accesorios, tirantes, cimentacións, datos que faltan, conexións, sobrecargas e caída de tensión.
keywords: comprobacións, franquía, franquía sobre o terreo, obstáculo, cruzamento, separación de fases, oscilación do illador, elevación, carga do apoio, carga nominal, dimensionamento, cimentación, tirante, tensor, accesorio, cruceta, caída de tensión, sobrecarga, datos que faltan, desconectado
from: e6a0da47
---

**Comprobacións** na sección Liñas eléctricas enumera cada problema: en vermello o que falla e en ámbar os avisos. Prema un deles para seleccionar a liña, o apoio, o cable ou o equipo ao que se refire; os apoios e vanos que fallan márcanse con círculo vermello no plano mentres o espazo de traballo está aberto.

:::warning
Un axudante de deseño: son comprobacións do seu deseño segundo as súas propias regras, non unha certificación.
:::

## Franquías

O fío máis baixo da condutor séguese en todos os vanos e en cada hipótese de carga. A súa franquía mínima sobre o terreo debe alcanzar a **Regra de franquía** da liña. Onde un vano cruza un **obstáculo** (debuxado con {{ui:Obstáculo}}: un punto ou unha liña, coa súa altura sobre o terreo e a súa propia regra de franquía), compróbase do mesmo xeito a franquía sobre o alto do obstáculo.

**O que o espazo de traballo Paisaxe pon sobre o terreo tamén conta.** As plantas illadas (a súa copa na dispersión e altura adultas), as sebes e os canteiros (a especie máis alta deles) e os muros (o seu alto) son obstáculos baixo unha liña, sen debuxalos de novo. Conservan as regras definidas en {{ui:Hipóteses de carga e límites…}}: **Plantas de paisaxe baixo unha liña** (os conxuntos de exemplo usan *Árbores e plantas*, 3 m) e **Muros de paisaxe baixo unha liña** (*Edificio*); escolla **Sen comprobar** para deixalos fóra. A franquía mídese en vertical desde o alto da planta ou do muro ata o condutor onde o vano o cruza; a distancia lateral a unha copa ao lado da liña non se comproba. Mover unha árbore ou subir un muro cambia as comprobacións ao instante.

As súas regras de franquía son propias: ábraas con **Regras…** xunto a calquera **Regra de franquía** (ou desde {{ui:Hipóteses de carga e límites…}}) para engadir, renomear, cambiar ou eliminar.

## Separación e oscilación

- **Separación de fases** necesaria: k·√(frecha + lonxitude do illador) + U/150, coa frecha da hipótese en quente e a tensión U en kV (unha forma habitual; k é o da súa regra). Compárase coa separación de fases da cruceta.
- **Oscilación do illador** nos apoios de suspensión, na hipótese de vento: atan(carga transversal ÷ carga vertical), contra a oscilación máxima da regra.
- **Elevación**: un apoio de suspensión máis baixo que os seus veciños pode ser elevado polo frío; márcase.

## Cargas nos apoios e dimensionamento

Para cada apoio e hipótese de carga, con todos os condutores da liña:

- **Transversal**: vento por metro × o vano de vento (a metade dos dous vanos), máis 2·H·sen(xiro ÷ 2) nun xiro.
- **Ao longo da liña**: a diferenza das tensións dos dous lados nun fin de liña ou nun ángulo; nun apoio de suspensión só co xeo nun lado (cada vano calculado por separado, o que se equivoca do lado seguro).
- **Vertical**: a carga vertical por metro × o vano de peso (entre os puntos máis baixos a cada lado) máis o equipo.

A carga horizontal lévase ao punto nominal do apoio (carga equivalente = carga × altura de suxeición ÷ altura do punto nominal) e compárase coa súa **carga nominal** × o factor da regra. Cando é demasiado débil, suxírese o apoio máis pequeno do mesmo material da súa biblioteca que a soporte. Un apoio cun **tirante** pasa a carga horizontal ao tirante, que soporta carga ÷ sen(ángulo do tirante) e compróbase contra a súa propia capacidade.

Os accesorios (abrazaderas, illadores, crucetas) compróbanse contra a súa carga nominal: un accesorio de anclaxe soporta a tensión do condutor, e un de suspensión a súa parte da carga vertical e transversal. A **cimentación** mostrada é a profundidade do apoio no terreo e un burato algo máis ancho que a súa base.

## Datos, conexións e corrente

- Un elemento cun campo necesario baleiro, ou unha clave que non está na biblioteca.
- Un extremo de ruta de cable, ou un equipo, conectado a nada.
- **Caída de tensión** e **corrente** desde cada fonte (equipo marcado como fonte) ata as cargas (kW e factor de potencia no equipo), ao longo de vanos aéreos e cables: √3·I·L·(R cos φ + X sen φ), con R a 20 °C. Se supera a corrente admisible do cable, ou a caída que permite a regra, márcase.
