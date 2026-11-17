---
title: Töölehed: tabelid, mis on seotud objektidega
summary: Salvestatud töölehed, mille read tulevad taimedest, istutatud aladest, sillutisest, seintest, trepiastmetest, maapinna muutjatest või kõigist kogustest; sinu enda veerud ja valemid, rühmad ning summad; CSV, XLSX ja tabel lehtedel, alati ajakohane.
keywords: tööleht, loend, taimeloend, sillutise loend, kogused, veerud, valem, summa, kokku, rühm, filter, csv, xlsx, tabelarvutus, tabel lehel
from: 11bc1bac
---

{{ui:Töölehed}} (Haljastuse tööruum › Veel) avab selle projekti töölehed. Esimesel korral koostatakse sulle **taimeloend** ja **sillutise ja alade loend**. Tööleht arvutatakse objektidest iga kord, kui seda näidatakse, kirjutatakse välja või pannakse lehele: muuda istutusala ja selle arvud muutuvad kõikjal.

- **Read tulevad**: taimed (üks rida liigi, sordi ja suuruse kohta), istutatud alad, sillutis, seinad, trepid, maapinna muutjad (kaevand ja täide) või kõik kogused.
- **Veerud**: väli (`qty`, `area`, `botanical` või nimi nurksulgudes, näiteks `[Net area]`) või valem: `+ - * / ^ %`, `&` teksti ühendamiseks, `= <> < <= > >=`, ning `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Valem, mida ei saa arvutada, näitab oma lahtris `#ERR` (või `#DIV/0`). Valemeid loeb CadCrafti enda süntaksianalüsaator; neist midagi koodina ei käivitata.
- **Kokku** iga veeru kohta (summa, arv, keskmine, väikseim, suurim), **Rühmita** (vahesummad iga rühma kohta) ja **Ainult read, kus**.
- {{ui:Salvesta CSV-na}}, {{ui:Salvesta XLSX-na}} ja **Pane see tööleht lehtedele** (Lehed › Töölehed joonistab selle tabelina nii mitmele lehele, kui vaja).

Taimede ja alade sildid loevad samu väljanimesid (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
