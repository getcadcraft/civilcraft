---
title: Radni listovi: spiskovi povezani sa objektima
summary: Spremljeni radni listovi sa redovima iz biljaka, zasađenih površina, popločavanja, zidova, stepenica, modifikatora tla ili svih količina; vaše kolone i formule, grupe i zbirovi; CSV, XLSX i tabela na listovima, uvijek ažurno.
keywords: radni list, spisak, spisak biljaka, spisak tvrdog uređenja, količine, kolone, formula, zbir, suma, broj, grupa, filter, csv, xlsx, proračunska tabela, tabela na listu
from: 11bc1bac
---

{{ui:Radni listovi}} (Pejzaž › Više) otvara radne listove ovog projekta. Prvi put se za vas prave **spisak biljaka** i **spisak tvrdog uređenja i površina**. Radni list se računa iz objekata svaki put kad se prikaže, zapiše ili stavi na list: promijenite gredicu i njeni brojevi se mijenjaju svuda.

- **Redovi iz**: biljaka (jedan red po vrsti, kultivaru i veličini), zasađenih površina, popločavanja, zidova, stepenica, modifikatora tla (iskop i nasip) ili svih količina.
- **Kolone**: polje (`qty`, `area`, `botanical`, ili naziv u uglastim zagradama kao `[Net area]`) ili formula: `+ - * / ^ %`, `&` za spajanje teksta, `= <> < <= > >=`, i `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formula koja se ne može izračunati prikazuje `#ERR` (ili `#DIV/0`) u svojoj ćeliji. Formule čita sopstveni parser CadCraft; ništa u njima se ne izvršava kao kod.
- **Ukupno** po koloni (zbir, broj, prosjek, najmanja, najveća), **Grupiši po** (podzbirovi po grupi) i **Samo redovi gdje**.
- {{ui:Spasi kao CSV}}, {{ui:Sačuvaj kao XLSX}} i **Stavi ovaj radni list na listove** (Listovi › Radni listovi crta ga kao tabelu, preko koliko god listova treba).

Oznake na biljkama i površinama čitaju ista imena polja (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
