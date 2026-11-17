---
title: "Kontrollér IFC-eksporten mod en kundes IDS"
summary: "Indlæs .ids-filen en kunde eller vejmyndighed gav dig, og se hvert eksporteret element der ikke opfylder den, i Problemer."
keywords: ids, information delivery specification, buildingsmart, krav, levering, kontrol, validering, kvalitetssikring, ifc-eksport, ifc 4.3, tracé, vej, udbud
from: 183d9a0e
---

## Hvad du skal gøre

En IDS (Information Delivery Specification, en buildingSMART-standard) er listen over, hvad en IFC skal indeholde. Offentlige udbud sender ofte en med opgaven. CivilCraft kontrollerer den IFC dette projekt eksporterer, i den IFC-version du valgte til eksporten, mod den, og lister hvert element der ikke lever op til den.

## Trin

1. Åbn dit projekt.
2. Klik på {{ui:IFC}} i gruppen Eksport i værktøjslinjen. Vælg i dialogen den IFC-version du leverer.
3. Klik på {{ui:Kontrollér mod IDS…}}.
4. Klik på {{ui:Indlæs en .ids-fil…}} og vælg filen. Intet uploades.
5. Læs resultatet: hver specifikation med {{ui:Bestået}} eller {{ui:Ikke bestået}} og hvor mange elementer den gælder for.
6. Åbn Problemer ({{key:Ctrl+Shift+M}}) og klik på en fejl for at vælge tracéet, byggeplateauet, røret, konstruktionen eller bygningsmassen den kom fra.

## Hvad du skal se

- Én advarsel pr. eksporteret element og krav det ikke opfylder, med specifikationens navn, hvad IDS'en kræver, og hvad eksporten har.
- Kontrolrapporten (i Problemer) starter med IDS'en: dens titel, version, forfatter og hver specifikations antal.

## Godt at vide

- IDS'en gemmes i projektfilen, så den kontrolleres igen når du åbner projektet. Indlæsning eller glemning af den er ét trin du kan fortryde.
- Hver ændring kontrolleres igen et øjeblik senere. Store overflader tager længere tid at skrive, så kontrollen venter lidt længere mellem kørslerne.
- Kontrollen bruger den samme fil som {{ui:IFC}}-eksporten skriver, i den version der sidst blev valgt der (IFC 4.3 når du ikke har valgt en).
- Tal sammenlignes i SI-enheder: et projekt i fod omregnes først til meter.

- Mønstre i IDS'en læses som hele værdien. Et `^` i begyndelsen og et `$` i slutningen tages også som »hele værdien«, sådan som de fleste IDS-filer mener dem.

## Næste

- [Eksportér IFC](topic:ifc)
