---
title: Radni listovi: specifikacije vezane za objekte
summary: Sačuvani radni listovi sa redovima iz biljaka, zasađenih površina, popločavanja, zidova, stepenica, modifikatora terena ili svih količina; sopstvene kolone i formule, grupe i ukupni zbirovi; CSV, XLSX i tabela na listovima, uvek ažurni.
keywords: radni list, specifikacija, specifikacija biljaka, specifikacija tvrdog uređenja, količine, kolone, formula, ukupno, zbir, broj, grupa, filter, csv, xlsx, tabela, tabela na listu
from: 11bc1bac
---

{{ui:Worksheets}} (Pejzaž › Više) otvara radne listove ovog projekta. Prvi put se za vas prave **spisak biljaka** i **specifikacija tvrdog uređenja i površina**. Radni list se računa iz objekata svaki put kad se prikaže, izveze ili stavi na list: promenite gredicu i njene brojke se menjaju svuda.

- **Redovi iz**: biljke (jedan red po vrsti, sorti i veličini), zasađene površine, popločavanje, zidovi, stepenice, modifikatori terena (iskop i nasip) ili sve količine.
- **Kolone**: polje (`qty`, `area`, `botanical`, ili naziv u uglastim zagradama kao `[Net area]`) ili formula: `+ - * / ^ %`, `&` za spajanje teksta, `= <> < <= > >=`, i `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formula koja ne može da se izračuna pokazuje `#ERR` (ili `#DIV/0`) u svojoj ćeliji. Formule čita sopstveni analizator CadCraft-a; ništa u njima se ne izvršava kao kod.
- **Ukupno** po koloni (zbir, broj, prosek, najmanji, najveći), **Grupiši po** (međuzbirovi po grupi) i **Samo redovi gde**.
- {{ui:Save as CSV}}, {{ui:Save as XLSX}}, i **Stavi ovaj radni list na listove** (Listovi › Radni listovi crta ga kao tabelu, preko koliko god listova treba).

Oznake na biljkama i površinama koriste ista imena polja (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
