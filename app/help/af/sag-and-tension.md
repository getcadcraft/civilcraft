---
title: Deurhang en spanning
summary: Jou lasgevalle (temperatuur, wind, ys) en spanningsperke, hoe CivilCraft elke snit se spanning uitwerk, en die spantabelle.
keywords: deurhang, spanning, lasgeval, temperatuur, wind, ys, asimmetriese ys, bepalende spanwydte, ekwivalente spanwydte, toestandsverandering, kettinglyn, spantabel, breeksterkte, alledaagse spanning
from: f8876c35
---

## Lasgevalle en perke

{{ui:Meer}} › {{ui:Lasgevalle en perke…}} wysig die reëls wat elke lyn in die projek volg.

- **Lasgevalle**: 'n temperatuur, 'n winddruk op die geleier (Pa), en radiale ys (mm, met sy digtheid). Die eerste geval is die verwysing.
- **Spanningsperke**: 'n aandeel van die geleier se breeksterkte, op die horisontale spanning of op die grootste spanning by 'n steun, in een lastgeval. Of gee self die horisontale spanning.
- **Vryruimtes**: die vryruimte wat die geleier bo die grond, 'n pad, 'n gebou en so meer hou. Voeg by, hernoem en verwyder hulle: hulle is joune. Onder hulle kies die reëls vir **Landskapplante onder 'n lyn**, **Landskapmure onder 'n lyn** en **Ondergrondse kruisings**.
- **Gevalle wat die kontroles gebruik**: watter geval die grootste deurhang gee (warm), die isolatorswaai (wind), ys, en ys aan een kant van 'n steun.
- **Faktore**: fase-spasiëringsfaktor k, grootste isolatorswaai, 'n faktor op steun- en beslaglaste, die draaihoeke wat hoek- en doodeindesteune maak, die kleinste dekking oor begrawe kabels, en die grootste spanningsval.

## Pakkies: reëls en 'n biblioteek vir 'n land

Geen land se reëls is in CivilCraft ingebou nie. 'n **pakket** hou 'n reëlstel en 'n biblioteek saam in een lêer (`.cclinepack.json`), vir 'n land, 'n netwerkoperateur of 'n maatskappy:

- **Stoor as 'n pakket…** in {{ui:Lasgevalle en perke…}} skryf die reëlstel wat gewys word en jou biblioteek (of, met niks nog in jou biblioteek nie, die items wat hierdie projek gebruik). Tik eers die **Land of streek**.
- **Maak 'n reëlstel of pakket oop…** lees 'n pakket, 'n reëllêer of 'n biblioteeklêer. 'n Pakket se reëls word in die dialoog gewys (klik **Pas toe** om hulle te gebruik) en sy items gaan in jou biblioteek.
- Pakkette wat ander deel, word op die byvoegingsbladsy onder **Kragleidingpakkette** gelys. Twee voorbeeldpakkette wys die formaat; hulle is nie enige land se reëls nie.

Elke pakket word nagegaan wanneer dit oopgemaak word, soos enige lêer. Kontroleer elke waarde teen die standaard wat van toepassing is voordat enigiets gebou word.

Twee voorbeeld-reëlstelle is daar om mee te begin: **Voorbeeld: koue klimaat** en **Voorbeeld: matige klimaat**. Hul getalle kom uit geen standaard nie: stel die waardes wat jou standaard gee. {{ui:Stoor reëls}} en {{ui:Maak reëls oop…}} deel 'n reëlstel as 'n lêer.

## Hoe die spanning uitgewerk word

Vir elke snit tussen doodeindes:

1. Die **bepalende spanwydte** is √(ΣL³ ÷ ΣL) van sy spanne.
2. Elke perk word via die **toestandsveranderingsvergelyking** op die bepalende spanwydte omgeskakel na 'n horisontale spanning in die verwysingsgeval: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Die mees beperkende een stel die spanning.
3. Elke lastgeval se spanning volg uit daardie een, en elke span se vorm is die presiese **kettinglyn** deur sy twee aanhegpunte (ook spanne op 'n helling): deurhang uit die koord, lengte, en die spanning by elke einde.

Die las per meter in 'n geval: gewig plus ys (ysoppervlak × digtheid × g) vertikaal; windruk × die ysdiameter horisontaal.

## Spantabelle

{{ui:Meer}} › {{ui:Spantabelle…}} lys, vir elke snit, die horisontale spanning en elke span se deurhang by elke temperatuur van die reëlstel (−5 °C tot 40 °C in stappe van 5 °C om mee te begin), in stil lug. Stoor hulle, en die steuntabel, as CSV.

Nie meegreken nie: geleier-kruip oor die jare, en die rek van 'n nuwe geleier. Voeg hulle by deur die temperature waarby jy span.
