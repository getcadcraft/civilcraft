---
title: Radne tablice: popisi povezani s objektima
summary: Spremljene radne tablice s recima iz biljaka, sadnih površina, popločenja, zidova, stuba, izmjena terena ili svih količina; vaši stupci i formule, grupe i zbirovi; CSV, XLSX i tablica na listovima, uvijek ažurne.
keywords: radna tablica, popis, popis biljaka, popis popločenja, količine, stupci, formula, zbroj, broj, grupa, filtar, csv, xlsx, proračunska tablica, tablica na listu
from: 11bc1bac
---

{{ui:Radne tablice}} (Krajobraz › Više) otvara radne tablice ovog projekta. Prvi put se za vas izrađuju **popis biljaka** i **popis popločenja i površina**. Radna tablica izračunava se iz objekata svaki put kad se prikaže, izveze ili stavi na list: promijenite gredicu i njezini se brojevi mijenjaju svuda.

- **Reci iz**: biljke (jedan red po vrsti, sorti i veličini), sadne površine, popločenje, zidovi, stube, izmjene terena (iskop i nasip) ili sve količine.
- **Stupci**: polje (`qty`, `area`, `botanical` ili naziv u uglatim zagradama kao `[Net area]`) ili formula: `+ - * / ^ %`, `&` za spajanje teksta, `= <> < <= > >=`, te `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formula koja se ne može izračunati prikazuje `#ERR` (ili `#DIV/0`) u svojoj ćeliji. Formule čita vlastiti raščlanjivač CadCraftova; ništa u njima se ne izvodi kao kod.
- **Zbroj** po stupcu (zbroj, broj, prosjek, najmanje, najviše), **Grupiraj po** (međuzbrojevi po grupi) i **Samo redovi gdje**.
- {{ui:Spremi kao CSV}}, {{ui:Spremi kao XLSX}} i **Stavi ovu radnu tablicu na listove** (Listovi › Radne tablice crta je kao tablicu, preko koliko god listova treba).

Oznake na biljkama i površinama čitaju ista imena polja (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
