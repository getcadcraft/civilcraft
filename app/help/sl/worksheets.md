---
title: Preglednice: razpredelnice, povezane s predmeti
summary: Shranjene preglednice z vrsticami iz rastlin, sajenih površin, tlakovanja, zidov, stopnic, modifikatorjev terena ali vseh količin; vaši lastni stolpci in formule, skupine ter vsote; CSV, XLSX in tabela na listih, vedno posodobljena.
keywords: preglednica, razpredelnica, razpredelnica rastlin, razpredelnica utrjenih površin, količine, stolpci, formula, vsota, seštevek, štetje, skupina, filter, csv, xlsx, elektronska preglednica, tabela na listu
from: 11bc1bac
---

{{ui:Preglednice}} (Delovno okolje krajinske ureditve › Več) odpre preglednice tega projekta. Prvič se za vas naredita **razpredelnica rastlin** in **razpredelnica utrjenih površin in površin**. Preglednica se izračuna iz predmetov vsakič, ko je prikazana, zapisana ali postavljena na list: spremenite gredo in njeni števci se spremenijo povsod.

- **Vrstice iz**: rastline (ena vrstica na vrsto, sorto in velikost), sajene površine, tlakovanje, zidovi, stopnice, modifikatorji terena (izkop in nasip) ali vse količine.
- **Stolpci**: polje (`qty`, `area`, `botanical` ali ime v oglatih oklepajih, na primer `[Neto površina]`) ali formula: `+ - * / ^ %`, `&` za združevanje besedila, `= <> < <= > >=` ter `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formula, ki je ni mogoče izračunati, v svoji celici pokaže `#ERR` (ali `#DIV/0`). Formule bere lasten razčlenjevalnik CadCraft; nič v njih se ne izvede kot koda.
- **Vsota** za vsak stolpec (vsota, števec, povprečje, najmanjši, največji), **Združi po** (vmesne vsote za vsako skupino) in **Samo vrstice, kjer**.
- {{ui:Shrani kot CSV}}, {{ui:Shrani kot XLSX}} in **Postavi to preglednico na liste** (Listi › Preglednice jo nariše kot tabelo čez toliko listov, kolikor jih potrebuje).

Oznake na rastlinah in površinah berejo ista imena polj (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
