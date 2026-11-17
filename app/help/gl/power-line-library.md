---
title: A súa biblioteca de liñas eléctricas
summary: Cree os seus propios condutores, cables subterráneos, apoios, equipos e tipos de zanxa, en categorías que nomee, e compártaos como ficheiros.
keywords: biblioteca, condutor, cable, poste, apoio, cruceta, illador, accesorio, tensor, tirante, transformador, armario, xunta, zanxa, categoría, csv, importar, exportar
from: 88733744
---

A sección **Biblioteca** do espazo de traballo Liñas eléctricas contén cada elemento que pode usar unha liña ou un cable. Nada nela está ligado a un país ou a un fabricante: vostede crea os elementos cos que traballa.

## Tres tipos de elementos

| Tipo | Onde está | Pódese cambiar? |
|---|---|---|
| **Exemplos** | Inclúese con CivilCraft, con números xenéricos que calculamos a partir das propiedades dos materiais | Non: primeiro {{ui:Copiar á miña biblioteca}} |
| **No proxecto** | Chegou co ficheiro do proxecto que abriu | Non: primeiro {{ui:Copiar á miña biblioteca}} |
| **Meus** | Os seus propios elementos, gardados neste navegador | Si, e os cambios gárdanse ao instante |

Cada proxecto garda unha copia de cada elemento que usa, así que un proxecto ábrese en calquera ordenador cos seus propios condutores e postes.

:::warning
Os elementos de exemplo son só exemplos: comprobe cada número cos datos do seu provedor. Os cables subterráneos non teñen capacidade de corrente a propósito, porque depende de como se teña tendido o cable.
:::

## Crear un elemento

1. En **Biblioteca**, escolla o **Tipo** (condutores aéreos, cables subterráneos, apoios, equipos ou tipos de zanxa).
2. Prema {{ui:Novo elemento}}, ou escolla un exemplo e prema {{ui:Copiar á miña biblioteca}} ou {{ui:Duplicar}}.
3. Complete os seus campos. Os campos marcados con `*` son os que necesitan as comprobacións; un elemento ao que lle falte un marcase con `!` e aparece listado en **Comprobacións** cando unha liña o usa.
4. Dálle unha **Categoría**, con `/` entre niveis: `Aéreo/BT/Agrupado`, `Apoios/Formigón/12 m`. A árbore segue as súas categorías.

O que necesita cada tipo:

| Tipo | Necesario para as comprobacións |
|---|---|
| Condutor aéreo | sección transversal, diámetro, masa por metro, resistencia á rotura, módulo de elasticidade, dilatación térmica |
| Cable subterráneo | núcleos, sección transversal, tensión, diámetro, resistencia, capacidade de corrente |
| Apoio | lonxitude total, carga nominal (tomada nun punto por debaixo do cume), profundidade no terreo |
| Equipo | o seu tipo; unha carga nominal para crucetas, accesorios e tirantes; separación de fases e caída para as crucetas; lonxitude para os illadores; o ángulo para os tirantes |
| Tipo de zanxa | profundidade, anchura, recuberta sobre os cables |

## Compartir

- {{ui:Gardar a miña biblioteca}} garda todos os seus elementos nun único ficheiro `.cclines.json`; {{ui:Abrir unha biblioteca…}} lee un de novo (os elementos coa mesma clave substitúense).
- {{ui:Gardar como CSV}} garda o tipo que está a ver como folla de cálculo; {{ui:Abrir unha biblioteca…}} lee de novo un CSV dese tipo. As columnas poden vir en calquera orde; un ficheiro separado por punto e coma pode usar coma decimal.
