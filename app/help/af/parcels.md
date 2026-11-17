---
title: Teken persele en skryf hul wetlike beskrywings
summary: Teken 'n perseel volgens sy hoeke of voer die aktelyne in uit 'n akte of opmetingskaart, kontroleer hoe goed die lyne sluit, merk rigtings en afstande op die plan, maak enige lyn 'n kromme, en kopieer 'n konsep van die wetlike beskrywing.
keywords: persele, erwe, eiendomsgrense, grens, akte, opmetingskaart, mete en grense, rigting, afstand, sluiting, sluitfout, presisie, wetlike beskrywing, beginpunt, kromme, radius, oppervlakte, akker
from: 6793d6ce
---

Persele staan op die plan met die rigting en afstand langs elke reguit lyn ('n kromme wys sy radius, lengte en middelhoek) en hul naam en oppervlakte in die middel. Hulle gaan in die PDF-plot en die DWG- en DXF-uitvoere op die lae `V-PROP` (lyne) en `V-PROP-TEXT` (etikette). Alles staan onder **Persele** in die regterpaneel wanneer niks gekies is nie.

## Teken 'n perseel

1. Klik **Teken 'n perseel**.
2. Klik die hoeke, begin by die beginpunt. 'n Klik naby 'n opmetingspunt neem daardie punt se presiese plek.
3. Klik die eerste hoek weer, of druk {{key:Enter}}, om klaar te maak. {{key:Backspace}} neem die laaste hoek terug; {{key:Esc}} laat die hoeke tot dusver vaar; druk dit weer om die gereedskap te verlaat.

## Voer die aktelyne uit 'n akte in

1. Klik **Voer aktelyne in**.
2. Sê waar die lyne begin: 'n opmetingspunt se nommer, of 'n noord- en oos-koördinaat.
3. Tik of plak die lyne, een per reël:
   - 'n lyn: 'n rigting en 'n afstand, soos `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` en asimute (`AZ 45°30'15"`) werk ook, en die woorde "thence" en "feet" en kommas word geïgnoreer.
   - 'n kromme: `C R 300 L 52.36 right` (radius en boogslengte), of `C R 300 D 10°00'00" left` (radius en middelhoek). 'n Kromme volg op die lyn voor dit; wanneer dit nie doen nie, voeg sy koordrigting by: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` begin 'n kommentaarreël.
4. Soos jy tik, wys die dialoog die lengte van die lyne, die **sluitfout** (hoe ver van die begin hulle eindig, en in watter rigting), die **presisie** (die lengte gedeel deur die sluitfout, 1 : 10 000 en so aan) en die oppervlakte. Reëls wat dit nie kan lees nie, word met hul reëlnommers gelys.
5. **Voeg die perseel by**. Wanneer die lyne nie sluit nie, sluit die perseel met 'n reguit lyn oor die gaping: kontroleer die lyne teen die akte. Om 'n veldtraverse se fout oor sy lyne te versprei, pas dit eers aan.

## Krommes

In 'n perseel se **Eienskappe** het elke lyn 'n **Radius**. Tik een om daardie lyn 'n kromme deur dieselfde twee hoeke te maak ('n radius kleiner as die halwe afstand tussen die hoeke kan nie bereik nie, so dit word geweier), en kies **Regs** of **Links** onder **Krommes**: 'n kromme na regs het sy middelpunt regs van die rigting van beweging, soos in 'n akte. Maak die radius leeg om dit weer reguit te maak. Elke verandering is een stap: {{key:Mod+Z}} maak dit ongedaan.

## Die wetlike beskrywing

'n Perseel se **Eienskappe** eindig met sy wetlike beskrywing, uit die tekening geskryf:

- "Begin by" die **Beginpunt** wat jy tik (byvoorbeeld "die noordoostelike hoek van Erf 4"), anders die eerste hoek se noord- en oos-koördinaat, of die opmetingspunt waarmee die lyne begin het.
- "daarvandaan" elke lyn: 'n rigting en 'n afstand, of 'n kromme met sy radius, boogslengte, middelhoek, en koordrigting en -afstand.
- "Omvattende" sy oppervlakte in vierkante voet en akker (vierkante meter en hektaar in 'n meterprojek).

**Kopieer** plaas dit op die knipbord; **Laai as teks af** stoor dit as 'n `.txt`-lêer.

:::warning
Die wetlike beskrywing is 'n konsep uit die tekening, nie 'n opmeting nie. 'n Gelisensieerde landmeter moet dit teen die rekord nagaan en onderteken voordat iemand daarop staatmaak.
:::

Klik binne 'n perseel op die plan om dit te kies; {{key:Delete}} verwyder dit. Persele word in die projeklêer gestoor.
