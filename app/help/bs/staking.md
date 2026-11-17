---
title: Napravi izvještaj o obilježavanju
summary: Navedi kolčiće duž osi trase na stacionažama i odmacima, ili geodetske tačke u blizini, s stacionažom, odmakom, sjevernom i istočnom koordinatom, projektnom i kotom terena, te iskop ili nasip, i sačuvaj izvještaj kao CSV ili PDF.
keywords: obilježavanje, kolčići, izvještaj o kolčićima, lista iskopa, lista nivelacije, stacionaža, odmak, iskop, nasip, iskolčenje, obilježavanje gradnje, snimljeno stanje
from: d8a4e9f1
---

Odaberi osu trase i klikni **Izvještaj o obilježavanju** u njenim **Svojstvima**.

## Kolčići na stacionažama i odmacima

1. **Od** i **do**: stacionaže za obilježavanje (1+50 ili 150).
2. **svakih**: razmak. Kolčići idu na svakom umnošku, na oba kraja i (ako je kvadratić označen) tamo gdje počinju i završavaju krivine trase.
3. **Odmaci**: lijevo i desno od osi trase, gledajući u smjeru rastuće stacionaže: `12 L, 0, 12 R`, `L12 CL R12` ili `-12, 0, 12` (lijevo je minus). Trasa s koridorom počinje s ivicama kolovoza i bankina.
4. **Broj od** i **s prefiksom** imenuju kolčiće: 1, 2, 3, ili S101, S102.

## Geodetske tačke u blizini osi trase

Odaberi **geodetske tačke u blizini osi trase** i koliko blizu. Svaka tačka unutar te udaljenosti dobija svoju stacionažu i odmak, projekat na tom mjestu i vlastitu kotu kao kotu terena: provjera tačaka obilježenih ili snimljenih kao izvedeno stanje.

## Šta izvještaj kaže

| Kolona | Šta je |
|---|---|
| Tačka | Naziv kolčića, ili broj geodetske tačke |
| Stacionaža, Odmak | Gdje je duž osi trase: L lijevo, R desno |
| Sjever, Istok | Njegove koordinate |
| Projektna kota | Površina uređenog koridora na tom mjestu (od linije presjeka s terenom do linije presjeka), inače projektni uzdužni profil na osovini |
| Kota terena | Postojeća površina na tom mjestu, ili vlastita kota geodetske tačke |
| Iskop/nasip | C kada je teren iznad projekta (spustiti ga), F kada je ispod (nasuti), na stotinku |

Kolčić bez projektne kote (van koridora, ili na trasi bez nje izvan osovine) nema iskop ni nasip; dijalog kaže koliko ih je.

## Spremi ga

- **CSV**: red s naslovom, zatim kolone iznad, plus iskop ili nasip kao označen broj (teren minus projekat) za tabele i prikupljače podataka.
- **PDF**: stranice tabele na papiru koji odaberete, jedan kolčić po redu, iskopi narandžasto a nasipi zeleno, s naslovnom trakom kao na ostalim listovima.

:::note
Kolčići se računaju iz projekta u projektu. Provjerite ih u odnosu na odobrene planove prije nego se bilo šta izgradi.
:::
