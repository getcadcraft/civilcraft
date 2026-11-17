---
title: Volumes de movemento de terras
summary: Lea os desmontes, os terraplenes e os volumes netos entre o terreo existente e a superficie proposta, por plataforma e corredor e no total, e entenda o método de cuadrícula en que se basean.
keywords: volumes, movemento de terras, desmonte, terraplén, neto, desmonte e terraplén, cantidades, método de cuadrícula, comparación de superficies, superficie de volume, iardas cúbicas, metros cúbicos
from: 299d7bc7
---

En canto unha plataforma ou un corredor se nivela sen problemas, CivilCraft compara a superficie proposta co terreo existente e informa do desmonte e do terraplén. Os números actualízanse con cada cambio.

## Onde lelos

- **Movemento de terras** no panel dereito sen nada seleccionado (a vista **Proxecto**), cando hai polo menos unha plataforma ou un corredor.
- **Movemento de terras** no panel dereito cando hai unha plataforma seleccionada (os mesmos totais para todo o proxecto).
- A liña baixo a configuración dun corredor, co seu propio desmonte e terraplén.

O bloque **Movemento de terras** mostra:

- **Desmonte**, **Terraplén** e **Neto** (con "terraplén" ou "desmonte" detrás, o que sexa maior)
- unha liña por elemento cando hai máis dun, por exemplo "Plataforma 1: desmonte 120,4 cu yd, terraplén 310,2 cu yd"
- a liña do método: "Método de cuadrícula: terreo existente e superficie nivelada mostreada cada 0,5 ft dentro das liñas de intersección (92 891 celas). Non se aplica esponjamento nin compactación."

Os volumes están en iardas cúbicas nun proxecto en pés e en metros cúbicos nun proxecto en metros.

## Envialos a TakeoffCraft

Para valorar o movemento de terras, escolla {{ui:Enviar a TakeoffCraft}} ao pé do bloque **Movemento de terras**. CivilCraft garda un ficheiro de cantidades (`<sitio>.quantities.json`) con dúas cantidades: desmonte e terraplén, en iardas cúbicas (proxecto en pés) ou en metros cúbicos (proxecto en metros), os mesmos números que o bloque, ata a centésima. Ábrao en TakeoffCraft con **Abrir medición**, ou arrástreo alí: convértense en dous elementos que pode valorar ([Desmonte e terraplén desde CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Envíe de novo despois dun cambio e abra o ficheiro novo: os mesmos elementos toman os números novos.

Só se envían os totais, así que nada se conta dúas veces; a nota do ficheiro lista o desmonte e o terraplén propios de cada plataforma e de cada corredor.

## Como se calculan

CivilCraft usa o **método de cuadrícula**:

1. Sobre a área dentro de cada liña de intersección colócase unha cuadrícula de celas cadradas.
2. No centro de cada cela mostréanse as dúas superficies.
3. Cada cela conta como un prisma: a diferenza de cota por a área da cela. Onde a superficie proposta está por baixo, hai desmonte; onde está por riba, hai terraplén.
4. As celas súmanse.

O tamaño da cela escóllese por vostede de xeito que o rectángulo ao redor das áreas niveladas teña uns 250 000 celas, redondeado a un valor axeitado (1, 2 ou 5 veces unha potencia de dez). De momento non se pode fixar por conta propia. A liña do método indica o tamaño e o número de celas. As celas máis pequenas son máis precisas nas beiras; en celas completas entre planos planos o resultado é exacto.

## Cousas que hai que saber

- Só se conta a área dentro das liñas de intersección. O terreo fóra delas non cambia.
- Unha plataforma ou un corredor con algún problema non se nivela e non engade nada. Se o bloque di "Aínda non hai volumes: unha plataforma precisa nivelarse sen problemas.", busque unha caixa vermella enriba.
- Onde os elementos se solapan, o posterior substituíu ao anterior dentro da súa liña de intersección, e o solapamento contase unha vez.
- Non se aplica ningún factor de esponjamento nin de compactación. Multiplique vostede os resultados se precisa volumes en banco, soltos ou compactados.
- O decapado da capa vexetal, as profundidades de firme e subrasante e os volumes de prismas TIN a TIN aínda non están dispoñibles.

## Comprobar un resultado

- Active {{ui:Proposto (nivelado)}} en **Visualización** e mire as curvas de nivel dentro das liñas de intersección.
- Pase o punteiro sobre a área nivelada: a barra de estado mostra **Terreo** e **Nivelado**. A diferenza é a profundidade do desmonte ou do terraplén nese punto.
- Para un corredor, a lectura da vista de perfil mostra o desmonte ou o terraplén no eixe en cada estación.
