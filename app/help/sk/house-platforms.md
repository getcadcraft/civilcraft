---
title: Domové plošiny na svahu
summary: Vyrovnanie domovej plošiny na svahu: oporné múry ako hrany plošiny, mapa výkopu a násypu zatienená podľa hĺbky s bodovými úrovňami (pôdorys a 3D), rez nakreslený kdekoľvek cez terén a návrh a rampy alebo svahované plošiny pre príjazdové cesty.
keywords: plošina, domová plošina, svahovitý pozemok, svah, kopec, oporný múr, výkop a násyp, mapa výkopu a násypu, bodové úrovne, voľný rez, čiara rezu, výkresy pre úrad, príjazdová cesta, rampa, svahovaná plošina, vyrovnanie, koeficient nakyprenia, zemné práce
from: daa08a3f
---

Domová plošina je **plošina** (**Návrh** › {{ui:Plošina}}): rovný mnohouholník na jednej úrovni, vyrovnaný do terénu. Na svahu pomôžu štyri veci.

## Oporné múry ako hrany plošiny

Vyberte plošinu a nastavte stranu na {{ui:Zvislá (oporný múr)}} namiesto svahu (**Vlastnosti** › {{ui:Strany a oporné múry}}, alebo {{ui:Zvislé: oporné múry}} pre všetky strany naraz). Výška múra sa číta z terénu pozdĺž neho: vrch na úrovni terénu, spodok na plošine. Zobrazí sa na oboch koncoch a v jeho najvyššom bode na pôdoryse, s upozornením, keď je vyšší než limit, ktorý ste nastavili. Múry a svahy sa môžu kombinovať vedľa seba.

## Mapa výkopu a násypu

Zaškrtnite {{ui:Mapa výkopu a násypu}} pod **Zobraziť**. Pôdorys sa zatieni podľa hĺbky výkopu alebo násypu, v rovnakých krokoch (výkop teplý, násyp modrý, takmer rovný bledý), s legendou. Na plošine sa vypíšu **bodové úrovne**: zmena úrovne v bodoch mriežky, a najhlbší výkop a najvyšší násyp označené ▲. Bunky sú tie isté, ktoré používajú objemy zemných prác, takže mapa a čísla sa vždy zhodujú.

V 3D zobrazení zvoľte **Výkop a násyp** zo zoznamu farieb, aby sa tie isté farby rozprestreli cez terén a návrh.

Koeficient nakyprenia alebo zmrštenia je v nástroji bilancie zemín (**Návrh** › {{ui:Bilancia zemín}}); na objemy plošiny sa neuplatňuje.

## Voľný rez

Pod **Povrch** › {{ui:Viac}} zvoľte {{ui:Voľný rez}}, kliknite na body čiary rezu kdekoľvek (môže sa lomiť) a stlačte {{key:Enter}}. Dialógové okno nakreslí rez: jestvujúci terén, vyrovnaný návrh (prerušovanou čiarou) a výkop a násyp medzi nimi, zatienené, s ich plochami (návrh sa počíta len vnútri plošín a ciest). {{ui:Prevýšenie mierky výšok}} sa predvolene prispôsobuje výkresu; {{ui:Uložiť ako SVG}} a {{ui:Uložiť ako CSV}} vám dajú výkres pre stavebný úrad a čísla.

## Rampy a svahované plošiny

Pod **Povrch** › {{ui:Viac}} zvoľte {{ui:Rampa alebo svahovaná plošina}}, kliknite na nízky koniec a potom na vysoký koniec, stlačte {{key:Enter}} a zadajte šírku, úroveň na nízkom konci a sklon. Plošina je pás, ktorého rohy nesú tieto úrovne (hrana medzi dvoma rohmi beží s konštantným sklonom), a vyrovná sa do terénu ako každá plošina. Rohy ľubovoľnej plošiny môžu mať aj vlastné úrovne, takže príjazdová cesta, rampa alebo naklonená terasa je plošina s úrovňou v každom rohu.
