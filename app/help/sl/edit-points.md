---
title: Uredi geodetsko točko
summary: Spremenite številko, koordinate, koto ali opis ene točke ali jo povlecite na novo mesto v tlorisu.
keywords: uredi točko, premakni točko, spremeni koto, preštevilči, številka točke, opis, povleci, severna koordinata, vzhodna koordinata, popravi točko, napačen posnetek
from: 375ae2e9
---

Napačen posnetek, napačna višina late, napačno vnesen opis: popravite eno točko, površje pa sledi.

## Spremenite vrednosti točke

1. Z {{ui:Izberi}} kliknite točko v tlorisu. **Lastnosti** v poljih prikažejo njeno številko, vzhodno koordinato, severno koordinato, koto in opis.
2. Vnesite novo vrednost in pritisnite {{key:Enter}} (ali kliknite drugam). Pri točki brez kote pustite polje **Kota** prazno.
3. Površje, plastnice in vse, kar je iz njih zgrajeno, se takoj posodobi.

Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi, {{key:Mod+Y}} pa uveljavi. Vrednost, ki je CivilCraft ne more uporabiti (številka, ki jo že ima druga točka, črke v koordinati), je zavrnjena: polje je obrobljeno, vrstica stanja pa pove zakaj.

Nova koda opisa ustvari novo skupino točk, kot to naredi uvoz (glejte [Zgradite površje](topic:build-surface)).

## Premaknite točko v tlorisu

1. Izberite točko (dobi obroč).
2. Povlecite obroč. Vrstica stanja prikaže vzhodno in severno koordinato, kamor bo šla.
3. Spustite, da jo premaknete; kota ostane enaka. Pred spustitvijo pritisnite {{key:Esc}}, da jo vrnete nazaj.

## Prelomnice sledijo točki

Prelomnica, narisana z orodjem {{ui:Prelomnica}}, prevzame točke, skozi katere poteka. Ko premaknete točko ali spremenite njeno koto, se oglišča prelomnice na njej premaknejo skupaj z njo, v istem koraku. Skupine prelomnic, narejene iz opisov, se vedno znova zgradijo iz točk.

:::note
Površje, prebrano iz datoteke LandXML, ohrani svoje trikotnike: urejanje točk ga spremeni šele po {{ui:Obnovi površje iz točk}}.
:::
