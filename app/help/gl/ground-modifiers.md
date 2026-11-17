---
title: Modificadores do terreo e niveis en tempo real
summary: Todo o que modela o terreo proposto nunha lista ordenada (o último gaña onde se solapan), desmonte e terraplén por modificador, comprobacións de unións no panel de Problemas, e cotas puntuais e frechas de pendente que len o terreo en tempo real.
keywords: modificadores do terreo, pila, orde, terreo proposto, terreo existente, solapamento, desmonte e terraplén, unión, muro de contención, borde de pavimento, nivel de canteiro, rellano de escaleira, cota puntual, altura puntual, frecha de pendente, etiqueta de pendente, pendentes
from: 3998a5b0
---

Terreo proposto = terreo existente + os modificadores, por orde. O terreo existente nunca se modifica.

## A lista

{{ui:Levels}} › {{ui:Ground modifiers…}} lista todos os obxectos que modelan o terreo: plataformas, bermas, cunetas, áreas de movemento de terras, pavimentos e camiños, zonas plantadas cun nivel acabado, e escaleiras e rampas cuxa caixa **Modela o terreo** estea marcada (coas súas cotas de base e de cima). Onde dous se solapan, o **posterior** é o que gaña. Arrastre unha fila ou use as frechas para cambiar a orde; o terreo reconstrúese de inmediato. Cada fila mostra o seu desmonte e terraplén (o que modela tras os de arriba), co total debaixo da lista.

## Verificacións de unións

O panel de Problemas lista, con **ir a**:

- un muro cuxo lado alto está por riba da súa cima (terra sobre o muro), ou cuxo lado baixo mostra a súa zapata;
- unha zona plantada cuxo nivel acabado está por riba do bordo do pavimento co que limita, ou máis de 150 mm por debaixo del, o valor habitual;
- escaleiras cuxa base ou cima non encontra o pavimento onde aterran;
- dous modificadores que se solapan (o posterior gaña alí).

Un muro de contención pode ter a súa cima seguindo o lado alto do terreo: a súa altura recalcúlase cada vez que cambia o terreo.

## Un muro de contención que modela o terreo

Seleccione un muro de contención e marque **Modela o terreo**. A franxa baixo o muro (tan ancha como o muro é groso) únese á lista como modificador:

- o bordo do **lado alto** mantense á altura do terreo alí, estación por estación, de xeito que a cima do muro segue o lado alto (coa coroación enriba). Escriba un nivel de **Cima** e manterá o lado alto a ese nivel menos a coroación;
- o bordo do **lado baixo** mantense no nivel de **Terreo mantido no lado baixo** que escriba ou, se o deixa baleiro, no terreo alí;
- o lado alto é aquel cuxo terreo é máis alto en todo o muro, así que nunca se inverte ao longo do muro;
- o terreo fóra da franxa non cambia, e o terreo existente nunca cambia.

Como calquera modificador, ocupa o seu sitio na lista, e un modificador posterior gaña onde se solapan. Un muro cuxo nivel mantido nun extremo está a máis de 150 mm do terreo existente alí recibe un aviso no panel de Problemas (con **ir a**). Un muro exento non modela o terreo. A caixa está desactivada nos ficheiros de versións anteriores, que se abren tal como estaban.

## Cotas puntuais e frechas de pendente

{{ui:Spot level}} (un clic) e {{ui:Gradient arrow}} (dous clics) len o terreo cada vez que se debuxan: se move ou reanivela un obxecto, as etiquetas seguen. En Propiedades escolla se unha etiqueta le o terreo proposto ou o existente; as etiquetas do terreo existente móstranse entre corchetes. As frechas apuntan cara abaixo e indican `1:20 (5.0 %)`.
