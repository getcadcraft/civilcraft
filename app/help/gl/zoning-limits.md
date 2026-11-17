---
title: Comprobar as masas cos límites urbanísticos que escriba
summary: Escriba os retranqueos dunha parcela liña a liña, un límite de altura, un plano de exposición ao ceo, un índice de edificabilidade e unha ocupación, vexa a envolvente edificable no plano e lea que masas rompen cada límite.
keywords: urbanismo, retranqueo, retranqueos, frontal, lateral, posterior, envolvente, superficie edificable, límite de altura, plano de exposición ao ceo, índice de edificabilidade, ocupación, parcela, ordenanza, comprobación normativa
from: 3e267b31
---

**CivilCraft non ten ningún código urbanístico.** Non coñece as normas de ningunha cidade e non inclúe unha biblioteca delas. Cada número desta páxina é un que vostede escribe, tirado da súa propia ordenanza, e cada resultado indica que se mide cos límites que escribiu. É unha forma de ver como os límites dunha parcela condicionan un edificio, non un dictame sobre se un deseño está permitido.

## Escriba os límites

En **Propiedades**, en **Masas de edificios**, escolla unha **Parcela** (ou seleccione unha masa: os límites da súa parcela móstranse debaixo). Despois complete o que corresponda; deixe unha caixa baleira para «sen límite»:

- **Liña de rúa**: a liña de parcela na rúa. O **Retranqueo frontal** aplícase a ela, o **Retranqueo posterior** á liña máis oposta, e o **Retranqueo lateral** ao resto.
- **Límite de altura**.
- **Plano de ceo**: comeza a unha altura na liña de parcela e sobe a cantidade que escribe por cada 1 de avance cara a dentro, medido desde a liña de rúa ou desde todas as liñas de parcela (2 significa 2 a 1). A altura permitida sobre un punto é a menor entre o plano e o límite de altura.
- **Índice de edificabilidade** (superficie construída bruta das masas da parcela dividida pola superficie da parcela) e **Ocupación** (as súas pegadas divididas pola superficie da parcela, escritas en porcentaxe).

## A envolvente

Marque **Mostrar a envolvente no plano** para debuxala na capa `A-MASS-ENVL`. A envolvente é a parcela recortada desde cada liña de parcela polo seu propio retranqueo, coas liñas de desfasamento xuntándose en esquinas a inglete. Unha liña de parcela formada por unha curva aproxímase con cordas curtas a menos de 0,01 da curva. Funcionan as parcelas convexas e as cóncavas. Se os retranqueos se cruzan entre si (un retranqueo profundo nunha parcela estreita ou moi cóncava) non hai envolvente, e as Propiedades indícao; probe distancias menores.

## O resultado

Debaixo das caixas, cada masa e cada límite ten unha liña, con un tick ou unha cruz:

- **retranqueos**: a superficie da masa que queda fóra da envolvente;
- **altura**: a altura da masa fronte á máxima permitida sobre a súa pegada (un prisma dunha soa altura está limitado pola altura permitida máis baixa en calquera das súas esquinas);
- **índice de edificabilidade** e **ocupación**: todas as masas da parcela sumadas.
