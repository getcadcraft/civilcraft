---
title: Obxectos a partir de liñas, mantidos ligados
summary: Faga pavimento, unha zona plantada, un canteiro, un seto, un camiño, un muro, un bordo, escaleiras, unha rampa, unha plataforma, unha valgadura ou unha liña de elemento a partir dunha liña; sigue a liña cando esta se move, ata que rompa a ligazón.
keywords: a partir dunha liña, liñas, DWG, DXF, ligazón, ligado, seguir, rexenerar, romper ligazón, liña de elemento, liña de elemento a partir de liñas, capa importada, contorno, supercad studio, liña de debuxo
from: eb67a0c6
---

{{ui:From a line}} (Paisaxismo › {{ui:More}}): prema nunha liña de elemento, ou nunha liña ou contorno dunha capa DWG/DXF importada. Unha liña pechada pode facer pavimento, un céspede, un canteiro plantado, un prado, cuberta do chan, un canteiro ou unha plataforma; unha liña aberta, un camiño, un muro, un bordo, escaleiras (o seu primeiro e último punto), unha rampa, un seto ou unha valgadura. Calquera dos dous tipos pode facer unha **liña de elemento**, salvo unha liña de elemento en si.

## Unha liña de elemento a partir dunha liña

Unha liña de elemento feita a partir dunha liña toma os seus puntos, pechada se a liña estaba pechada. As súas cotas colócanse sobre o terreo existente (0 se aínda non hai ningún), e o seu uso é **Desactivado**: non modela ningún terreo ata que escolla un uso e fixe as súas cotas nas súas Propiedades. Cando a liña se move, unha liña de elemento co mesmo número de puntos mantén cada cota que fixou; cando a liña gaña ou perde puntos, as cotas volven colocarse sobre o terreo. Vexa [Liñas de elemento](topic:feature-lines).

O novo obxecto conserva unha **ligazón** á súa liña. Cando a liña se move (arrastra os seus puntos, ou o debuxo se move ou se volve ler), o obxecto toma a nova forma no mesmo paso de desfacer, e a través dos modificadores do terreo o terreo proposto segue. As Propiedades indican a que está ligado; {{ui:Break link}} o deixa libre.

As liñas compróbanse primeiro: unha liña necesita polo menos 2 puntos (3 para un contorno), como moito 5000, números reais; un contorno debe estar pechado e non cruzarse a si mesmo. Unha liña que falla non se usa: o obxecto queda como estaba e o panel Problemas indica o motivo. Se a liña se elimina, o obxecto permanece e o panel Problemas anótao.

## En SuperCad Studio

Abra o terreo e o debuxo 2D no mesmo proxecto. Escolla unha liña ou polilínea no debuxo 2D, prema Ctrl+K e execute "Obxecto de paisaxismo desde a liña escollida do debuxo": CivilCraft pregunta que facer, como enriba, e o obxecto queda ligado a esa liña do debuxo. Despois de cambiar liñas no debuxo, Ctrl+K "Actualizar o paisaxismo desde o debuxo" fai que os obxectos as sigan, cun paso de desfacer por cada liña. O ficheiro de ligazóns do proxecto rexistra que obxecto segue a que liña. A propia axuda de SuperCad Studio ten un tema sobre Paisaxismo.
