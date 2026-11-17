---
title: Bereken die sonure op 'n terrein
summary: Kies 'n dag (of 'n seisoen) en 'n tydsone, en sien die direkte sonure op elke muur van elke gebouvolume en op die grond rondom hulle, met die grond op die plan geteken en die getalle as CSV.
keywords: son, sonure, skadu, skaduwee, sontoegang, dagligure, gevel, muur, seisoen, sonstilstand, gelykdag, tydsone, somertyd, breedtegraad, lengtegraad, CSV, raster
from: 4e32a314
---

**Sonure** tel die direkte sonure wat elke muur van elke gebouvolume bereik, en die grond rondom hulle, op 'n dag wat jy kies of gemiddeld oor 'n seisoen. Die volumes en die grond self werp skadu; niks anders doen dit nie (geen bome, geen bure wat jy nie geteken het nie). Hemellig wat nie direkte son is nie, word nie getel nie.

## Voor jy begin

Die son se plek kom uit die terrein se breedte- en lengtegraad, wat uit die projek se **koördinaatstelsel** kom. 'n Projek sonder een word met 'n boodskap geweier: stel dit eers (**Koördinate** in die GIS-groep). 'n Breedte- en lengtegraad wat met die hand getik is, sou 'n raaiskoot wees, daarom is daar geen kassie vir hulle nie.

## Bereken dit

In **Eienskappe**, onder **Gebouvolumes**, **Sonure**:

1. Kies die **Dag**. Dit begin op die dag waarop die son die laagste is waar jy is (21 Desember, of 21 Junie op die suidelike halfrond). Vir 'n seisoen, merk **Oor 'n seisoen**, kies die **Laaste dag** en hoeveel dae uitmekaar om te monster.
2. Tik die **Tydsone**: 'n naam soos `America/Mexico_City`, of 'n verskil vanaf UTC soos `-6`. 'n Naam volg daardie sone se somertyd-reëls vir die dag; 'n verskil wat jy tik, word presies soos getik gebruik, so gebruik die een wat op daardie dag van krag is. Die lyn onder die kassie sê watter verskil dit gevind het.
3. Kies hoe gereeld om die son te plaas (elke 5, 10, 15 of 30 minute), en dan **Bereken die sonure**. 'n Seisoen loop in agtergrondwerkers; **Stop** kanselleer dit.

## Wat jy kry

- 'n Tabel per volume: die **slegste muur**, die **gemiddelde** en die **beste muur**, in ure per dag, en 'n tabel van elke muur met die rigting waarheen dit wys en sy ure verdieping vir verdieping.
- Die grond rondom die volumes, op die plan geteken van donker (geen son) tot geel (die meeste wat enige sel kry), met 'n sleutel. Selle onder 'n volume word leeg gelaat. **Wys die grond op die plan** skakel dit af.
- **Mure as CSV** en **Grond as CSV** stoor die getalle.

Vir 'n seisoen is die syfers die gemiddelde per dag oor die gemonsterde dae. Niks word in die projek gestoor nie: die resultaat is om na te kyk, en om dit weer te laat loop maak dit weer.

## Goed om te weet

- 'n Muur tel 'n oomblik as sonnig net wanneer dit na die son wys en niks in die pad is nie. 'n Muur wat weg wys, kry niks.
- Die grond word gemonster op 'n rooster wat van die grootte van die terrein afhang, en die son se plek in die middel van elke tydstap, dus is die ure reg tot op die stap wat jy gekies het.
- Die son se plek is 'n gepubliseerde astronomiese formule, akkuraat tot omtrent 'n boogminuut.
