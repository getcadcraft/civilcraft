---
title: A lista de plantas
summary: Preto de 420 plantas temperadas e mediterráneas habituais, con tamaños, rusticidade, luz e auga, buscables en calquera idioma, máis a súa propia lista gardada co proxecto.
keywords: lista de plantas, base de datos de plantas, especies, nome botánico, nome común, paleta de plantas, lista de viveiro, zona de rusticidade, csv, importar plantas, exportar plantas, as miñas plantas, lista de árbores, lista de arbustos, plantas, biblioteca de plantas
from: 7ed09e7e
---

A sección **Plantas** do panel esquerdo lista todas as plantas que pode colocar. Prema unha para ver os seus tamaños e para que sexa a planta que usan **Vexetal**, **Canteiro** e **Seto**.

## Buscar e filtrar

Escriba en **Buscar**: calquera palabra do nome dunha planta en calquera idioma (inglés, español, portugués), o seu nome botánico, o seu tipo ou unha palabra das súas notas. Todas as palabras escritas deben coincidir, así que `quercus evergreen` atopa os carballos perennifolios. Os acentos non importan.

Reduza a lista con **Tipo**, **Luz**, **Auga** e **Zona de rusticidade** (a zona USDA onde está o seu sitio: unha planta aparece cando a zona está dentro do seu rango).

## O que leva unha planta

| Campo | Significado |
|---|---|
| Tipo | Árbore, arbusto, seto, herba (incluídos os céspedes), vivaz, cuberta vexetal ou trepadeira |
| Na madurez | Altura e extensión da planta cultivada nun xardín ou nunha rúa, en metros |
| Na plantación | O tamaño co que se planta e o seu recipiente |
| Distancia | De centro a centro nun canteiro ou ao longo dun seto |
| Zona de rusticidade | As zonas USDA onde adoita resistir ao frío |
| Luz, auga, solo | O que necesita |
| Notas | Usos e advertencias, como partes tóxicas ou unha planta que se expande |

:::note
A lista integrada escribiuse para CadCraft a partir de coñecemento hortícola xeral: tamaños típicos, redondeados. Non é o catálogo de ningún viveiro. Comprobe os tamaños e a rusticidade cun viveiro local. Déixanse fóra a propósito as plantas invasoras máis coñecidas de Iberia e de boa parte do mundo temperado, e unhas poucas que son invasoras noutro lugar levan unha nota.
:::

## As súas propias plantas

- **Engadir á lista deste proxecto** copia unha planta á lista propia do proxecto, onde se garda co proxecto. Unha planta da súa lista substitúe a integrada coa mesma clave, así que pode cambiar os seus tamaños para a súa rexión.
- **Importar unha lista de plantas…** lee un CSV (ou un ficheiro de plantas). O CSV necesita unha columna co nome botánico e, idealmente, o tipo, a altura e a extensión; os nomes de columna con palabras propias funcionan (Latín, Nome común, Altura, Extensión, Largura, Zona). Lense as comas, os puntos e coma ou os tabuladores, e as comas decimais. Os tamaños de plantación, as distancias e os recipientes baleiros toman valores razoables segundo o tipo.
- **Exportar como CSV** garda a súa lista (ou, sen ela, as plantas que mostra a busca) para abrila nunha folla de cálculo.

Unha lista de plantas lese como calquera ficheiro externo: o que non pode usar omítese e contabilízase.

## Plantas noutras aplicacións

A lista de plantas é unha biblioteca para todas as aplicacións de CadCraft: BimCraft e ModelCraft levan a mesma lista, pero o seu propio Colocar desde a biblioteca aínda non ofrece plantas. Hoxe as plantas chegan a un modelo BIM a través do IFC de paisaxismo de CivilCraft (cada planta é un `IfcGeographicElement`). Ver [Plantación](topic:planting#ifc).
