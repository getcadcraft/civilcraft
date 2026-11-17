---
title: Tabele de lucru: liste legate de obiecte
summary: Tabele de lucru salvate, cu rânduri din plante, suprafețe plantate, pavaje, ziduri, trepte, modificatori de teren sau toate cantitățile; coloane și formule proprii, grupuri și totaluri; CSV, XLSX și un tabel pe planșe, mereu la zi.
keywords: tabel de lucru, tabel, tabel de plante, tabel de amenajări dure, cantități, coloane, formulă, total, sumă, număr, grup, filtru, csv, xlsx, foaie de calcul, tabel pe planșă
from: 11bc1bac
---

{{ui:Tabele de lucru}} (Amenajări peisagistice › Mai multe) deschide tabelele de lucru ale acestui proiect. Prima dată se creează automat **tabelul de plante** și **tabelul de amenajări dure și suprafețe**. Un tabel de lucru se calculează din obiecte de fiecare dată când este afișat, scris într-un fișier sau pus pe o planșă: dacă schimbați un strat, numărările lui se schimbă peste tot.

- **Rânduri din**: plante (un rând pe specie, cultivar și dimensiune), suprafețe plantate, pavaje, ziduri, trepte, modificatori de teren (săpătură și umplutură) sau toate cantitățile.
- **Coloane**: un câmp (`qty`, `area`, `botanical` sau un nume între paranteze drepte, ca `[Net area]`) sau o formulă: `+ - * / ^ %`, `&` pentru a uni text, `= <> < <= > >=`, și `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. O formulă care nu poate fi calculată arată `#ERR` (sau `#DIV/0`) în celula ei. Formulele sunt citite de analizorul propriu al CadCraft; nimic din ele nu se execută ca cod.
- **Total** pe coloană (sumă, număr, medie, cea mai mică, cea mai mare), **Grupare după** (subtotaluri pe grup) și **Doar rândurile unde**.
- {{ui:Salvare ca CSV}}, {{ui:Salvare ca XLSX}} și **Pune acest tabel pe planșe** (Planșe › Tabele de lucru îl desenează ca tabel, pe câte planșe are nevoie).

Etichetele de pe plante și suprafețe folosesc aceleași nume de câmpuri (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
