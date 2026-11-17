---
title: Ühikud importimisel: fail märgib oma ühikud või sinult küsitakse enne
summary: Kui joonis või võrk, mille projekti tood, märgib oma ühikud, teisendab CivilCraft need ja ütleb seda. Kui ei märgi, küsib CivilCraft enne sisselugemist ja jätab sinu vastuse selle faili jaoks meelde.
keywords: ühikud, import, DWG, DXF, STL, OBJ, mõõdistus, jalad, USA mõõdistusjalad, meetrid, millimeetrid, mõõtkava, vale suurus, liiga suur, liiga väike, küsi, meeles, INSUNITS, joonise ühikud
from: 60921963
---

## Mida sa teed

Too fail projekti ja veendu, et see tuleb sisse õige suurusega.

## Sammud

1. Ava fail tavapäraselt: {{ui:Ava}}, lohista see plaanile või kasuta CAD-joonise käsku.
2. Kui fail märgib oma ühikud, ei küsita midagi: importimisdialoog näitab neid kui **Nagu joonisel öeldud**.
3. Kui ei märgi, küsib dialoog enne importimisdialoogi avanemist faili **Faili ühikud**. Vali, mis on faili üks ühik, ja klõpsa {{ui:Kasuta neid ühikuid}}.
4. {{ui:Loobu}} (või {{key:Esc}}) jätab faili vahele. Sellest ei loeta projekti midagi.

## Millised failid märgivad oma ühikud

- **DWG ja DXF**: joonise sisestusühikud (`$INSUNITS`). Failile ilma nendeta küsitakse. Importimisdialoogi **Joonise ühikud** nimekiri algab sinu vastusest ja seda saab veel muuta.
- **STL ja OBJ** (maastiku vabakujulised kujundid): ei märgi kunagi ühikuid. Sinult küsitakse.
- **Punktide loendid** (CSV, TXT) ja mõõdistuskäigu loendid: loend, mis märgib oma ühiku esimestel ridadel, teisendatakse ja olekurida ütleb seda. Loendi kohta, mis ühikut ei märgi, küsitakse, kui vajutad {{ui:Impordi}}, enne kui punktid sisse lähevad. Laiuskraadi ja pikkuskraadi veerud läbivad selle asemel koordinaatsüsteemi.
- **Punktipilvede lisandmoodul**: küsib, kui koostad pilve, mille fail ei märgi ühikut, ja märgistab pilve arvud selle kantud ühikus.
- **IFC ja LandXML**: märgivad oma ühikud; need teisendatakse projekti ühikutesse.
- **LAS, LAZ ja kõrgusrasterid**: paigutatakse oma koordinaatsüsteemi järgi; maapinna dialoog küsib kõrgusühikut, kui fail seda ei ütle.

## Hea teada

- Vastus jäetakse selle faili jaoks sellesse arvutisse meelde, igas CadCraft-rakenduses. Järgmisel sisseimpordil ei küsita sinult enam.
- Et sinult uuesti küsitaks: käsupalett ({{key:Mod+K}}) › **Küsi uuesti imporditud failide ühikuid**.
- Loendi märgitud ühik loetakse esimestelt kaheksalt reast: rida nagu `units: ft` või veerupealkirjad, mis kõik kannavad sama ühikut sulgudes, nagu `Elevation (m)`.
