---
title: Maakaablid
summary: Kaablitrassid kraavides tugede ja seadmete vahel, katvus ja ristumised, muhvid trumli pikkuse järgi ning kraavi ja kaablite kogused.
keywords: maakaabel, kaabeltrass, kraav, kaitsetoru, katvus, ristumine, toruga ristumine, muhv, trumm, kapp, trafo, toiteallikas, pingelang
from: adfd2717
---

## Kaabeltrassi joonistamine

1. Kui kaabel lõpeb kapi, trafo või muhviga, aseta kõigepealt seade: {{ui:Seade}}, seejärel klõpsa.
2. Klõpsa {{ui:Kaabel}} ja klõpsa trassil; alga ja lõpeta toel või seadmel, et sellega ühenduda. Enter lõpetab.

**Omadustes** vali **Kaabel**, **Kraavi tüüp**, mitu **kaablit kõrvuti** ja **varu** (%). Trass näitab oma pikkust, kust see algab ja lõpeb ning voolu, mida see kannab.

## Mida kontrollitakse

- **Katvus**: kaabli ülaosa on trassi kohal maapinna all, võrreldes kraavi tüübi katvusega (või reeglistiku väikseima katvusega).
- **Ristumised**: kohad, kus trass ristub CivilCrafti torustikuga või teise kaabliga; nende vahe võrreldakse vahekauguse nõudega: trassi enda **Ristumise vahekaugus** (tema omadustes), kui see on valitud, muidu reeglistiku **Maa-alused ristumised** reegel (näidisreeglistikud kasutavad *Maa-alune ristumine*, 0.3 m), muidu kraavi tüübi vahe teiste teenustega. Kahe kaabli ristumisel kehtib nende suurem väärtus. Ületatud õhuliin on loendis infoks ja kaabel näitub selle liini pikiprofiilil.
- **Muhvid**: üks iga kaabli trumlipikkuse järel (koos varuga), kui kaablielement annab trumlipikkuse.

## Seadmed

Seadmel on teegi element, **koormus** (kW) koos oma **võimsusteguriga** ning see võib olla **toiteallikaks**: võrku toidetakse sealt. Toiteallika pinge tuleb tema teegi elemendist või muidu liinist või kaablist, mida ta toidab.

## Kogused

{{ui:Veel}} › {{ui:Kogused…}} arvutab kaabli (trassi pikkus × (1 + varu) × kõrvuti kaablid + tõus mõlemas otsas), kraavi tüübi järgi kraavi, kaevise, aluskihi ja tagasitäite mahud, kaitsetorud ja muhvid ning õhuliinide juhtme, tugede ja seadmed.
