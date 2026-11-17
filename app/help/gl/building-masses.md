---
title: Debuxar masas de edificio nun sitio
summary: Debuxe unha masa de edificio nunha parcela, dálle plantas e unha altura de planta, vexa a súa superficie bruta de planta, escolla como se asenta en terreo con pendente, empurre e tire da súa altura en 3D, e envíea a BimCraft ou gárdea como ficheiro IFC.
keywords: volumetría, masa de edificio, volume, pegada, plantas, altura de planta, superficie bruta de planta, GFA, pendente, zócalo, desmonte e recheo, empurrar e tirar, 3D, estudo de sitio, deseño inicial, IFC, desenvolver, BimCraft, A-MASS
from: e5a67c16
---

Unha masa de edificio é unha pegada, un número de plantas e unha altura de planta: a pregunta inicial «canto edificio cabe aquí, e que lle fai ao terreo». As masas están no plano co seu nome, o número de plantas e a superficie bruta de planta, pasan ao PDF e ás exportacións DWG e DXF nas capas `A-MASS` e `A-MASS-TEXT`, e gárdanse no ficheiro do proxecto.

## Debuxar unha masa

1. En **Propiedades**, baixo **Masas de edificio**, faga clic en **Debuxar unha masa**. (Tamén está no menú **Máis** da barra de ferramentas, xunto a **Superficie**.)
2. Faga clic nas esquinas da pegada. Un clic preto dunha esquina de parcela ou dun punto de levantamento toma o lugar exacto dese punto.
3. Faga clic de novo na primeira esquina, ou prema {{key:Enter}}, para rematar. {{key:Backspace}} retira a última esquina; {{key:Esc}} para.

Unha masa nova ten tres plantas e unha altura de planta de 12 ft (3.6 m), e pertence á parcela onde cae o seu centro.

## Plantas, altura e superficie

Faga clic nunha masa para cambiar o seu **Nome**, **Uso**, **Plantas**, **Altura de planta** e **Parcela**. A **Altura** é plantas por altura de planta: escriba unha altura e o número de plantas pasa a ser o número enteiro máis próximo (nunca menos de un). A **Pegada** e a **Superficie bruta de planta** (pegada por plantas) calcúlanse por vostede.

## En terreo con pendente

O terreo baixo unha masa lese da superficie: terreo existente, ou o terreo niveladado onde escolleu **Terreo proxectado (nivelado)**. **En terreo con pendente** indica onde vai a planta baixa:

- **Escalonado**: á cota media do terreo baixo a pegada. O lado baixo énchese ata ela e o lado alto desmóntase, e os dous case se equilibran.
- **Zócalo**: á cota máis alta do terreo. Unha base maciza enche o lado baixo.
- **Desmonte**: á cota máis baixa do terreo. O lado alto recórtase na ladeira.

Propiedades mostra o intervalo de terreo baixo a masa, o **Nivel da planta baixa**, e o volume de recheo e desmonte entre o terreo e ese nivel. Un punto da pegada que queda fóra da superficie déixase de lado, e Propiedades indica cantos son.

## Na vista 3D

As masas debúxanse na vista 3D do sitio, cunha liña ao redor de cada planta e os seus nomes sobre a cuberta. **Mostrar** ten unha caixa de verificación para **Masas de edificio**. Faga clic nunha para seleccionala. Con unha masa seleccionada:

- arrastre a súa cuberta cara arriba ou abaixo para empurrala ou tirar dela unha planta cada vez, ou prema {{key:PageUp}} e {{key:PageDown}};
- todo o movemento é un paso de desfacer.

A vista de rúa de **Percorrer** tamén ve as masas, e **Sol** proxecta as súas sombras no terreo.

## Enviala

- **Masas como IFC** garda cada masa como un ficheiro IFC4: un sitio, un edificio coas súas plantas, e a masa como elemento de edificio cos seus números no conxunto de propiedades `CadCraft_SiteMass`. Cando o proxecto ten un sistema de coordenadas, o ficheiro sitúase no mapa e leva a latitude e a lonxitude do sitio; sen el, non indica onde está.
- **Desenvolver en BimCraft** abre BimCraft nunha nova lapela coas masas. Alí, ao escoller unha masa, mostra os seus números e **Desenvolver esta masa**, que constrúe muros en cada nivel e un chan baixo o edificio a partir da pegada, nun só paso de desfacer. Non se envía nada: o ficheiro pasa entre as dúas lapelas deste navegador.

Consulte tamén **Límites de zonificación** e **Horas de sol**.
