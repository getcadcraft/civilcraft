---
title: Pracovné tabuľky: tabuľky prepojené s objektmi
summary: Uložené pracovné tabuľky s riadkami z rastlín, výsadbových plôch, dláždenia, múrov, schodov, úprav terénu alebo všetkých množstiev; vlastné stĺpce a vzorce, skupiny a súčty; CSV, XLSX a tabuľka na listoch, vždy aktuálne.
keywords: pracovná tabuľka, tabuľka, zoznam rastlín, tabuľka spevnených plôch, množstvá, stĺpce, vzorec, súčet, počet, skupina, filter, csv, xlsx, tabuľkový hárok, tabuľka na liste
from: 11bc1bac
---

{{ui:Worksheets}} (Krajina › Viac) otvorí pracovné tabuľky tohto projektu. Prvýkrát sa pre vás vytvoria **tabuľka rastlín** a **tabuľka spevnených plôch a plôch**. Pracovná tabuľka sa vypočíta z objektov pri každom zobrazení, zapísaní alebo umiestnení na listy: zmeníte záhon a jeho počty sa zmenia všade.

- **Riadky z**: rastliny (jeden riadok na druh, kultivar a veľkosť), výsadbové plochy, dláždenie, múry, schody, úpravy terénu (výkop a násyp) alebo všetky množstvá.
- **Stĺpce**: pole (`qty`, `area`, `botanical`, alebo názov v hranatých zátvorkách ako `[Net area]`) alebo vzorec: `+ - * / ^ %`, `&` na spájanie textu, `= <> < <= > >=` a `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Vzorec, ktorý sa nedá vypočítať, zobrazí v bunke `#ERR` (alebo `#DIV/0`). Vzorce číta vlastný analyzátor CadCraft; nič v nich sa nespúšťa ako kód.
- **Súčet** pre každý stĺpec (súčet, počet, priemer, najmenšia, najväčšia), **Zoskupiť podľa** (medzisúčty pre každú skupinu) a **Iba riadky, kde**.
- {{ui:Save as CSV}}, {{ui:Save as XLSX}} a **Umiestniť túto pracovnú tabuľku na listy** (Listy › Pracovné tabuľky ju nakreslí ako tabuľku, cez toľko listov, koľko potrebuje).

Popisky rastlín a plôch čítajú tie isté názvy polí (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
