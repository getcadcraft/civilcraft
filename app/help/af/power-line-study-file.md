---
title: Studielêers vir 'n ander kraglynprogram (.DON)
summary: Stoor een bogrondse lyn as 'n .DON-studielêer, of lees die steune van een in 'n nuwe lyn. Nie met die program wat hulle lees, getoets nie.
keywords: don, .don, studielêer, xml, uitvoer, invoer, bogrondse lynprogram, uitspanning, canton
from: 1abc4d07
---

Sommige bogrondse-lynprogramme hou 'n studie in 'n `.DON`-lêer (XML-teks). CivilCraft kan een lyn as so 'n lêer skryf en die steune van een lees.

:::warning
**Nie getoets nie.** Ons het dit gebou uit 'n lys van die formaat se veldname wat 'n gebruiker gedeel het, nie uit 'n werklike lêer nie, en ons het nog nie ons lêers in die program wat hulle lees, oopgemaak nie. Maak die lêer daar oop en kontroleer elke waarde voordat jy daarop staatmaak. As jy 'n `.DON`-lêer kan deel (met die kliënt se besonderhede verwyder), help dit ons om dit reg te maak.
:::

## Stoor 'n studielêer

1. Gee die lyn 'n geleier en maak seker dit het resultate (geen "nie uitgewerk nie" in sy Eienskappe nie).
2. {{ui:Meer}} › {{ui:Stoor 'n studielêer (.DON)…}}, kies die lyn, voeg 'n beskrywing en 'n werknommer by.
3. {{ui:Stoor die studielêer}}.

Die lêer hou die lyn se steune (koördinate, grond, hoogtes, rolle, dwarsarm, die steun wat behou of voorgestel word, ladings per lasgeval, fondasie), een afdeling per stuk tussen doodeindes (geleier, spanning, rigtingspan, spanne, spanning- en kettingparameter, die grootste spanning per lasgeval) en die uitspanningstabelle. Lengtes is in meter en kragte in daN; teks word in Latin-1 geskryf, so 'n karakter buite dit word `?`.

## Lees 'n studielêer

{{ui:Meer}} › {{ui:Maak 'n studielêer (.DON) oop…}} lees die steune in 'n nuwe lyn. Die geleier, steune en dwarsarms word by naam by jou biblioteek gepas; wat nie gevind word nie, word vir jou gelaat om in Eienskappe te kies.
