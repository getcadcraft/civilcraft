---
title: Napravi izveštaj o iskolčenju
summary: Navedi kočiće duž trase na stacionažama i odmacima, ili geodetske tačke u blizini, sa stacionažom, odmakom, severnom i istočnom koordinatom, projektovanom kotom i kotom terena, te iskopom ili nasipom, i sačuvaj izveštaj kao CSV ili PDF.
keywords: iskolčenje, izveštaj o kočićima, list iskopa, list nivelacije, stacionaža, odmak, iskop, nasip, obeležavanje, građenje, stvarno izvedeno
from: d8a4e9f1
---

Izaberi trasu i kliknite **Izveštaj o iskolčenju** u njenim **Svojstvima**.

## Kočići na stacionažama i odmacima

1. **Od** i **do**: stacionaže za iskolčenje (1+50 ili 150).
2. **na svakih**: razmak. Kočići se postavljaju na svaki umnožak tog razmaka, na oba kraja i (kada je polje označeno) tamo gde krivine trase počinju i završavaju.
3. **Odmaci**: levo i desno od trase, gledajući u smeru rastuće stacionaže: `12 L, 0, 12 R`, `L12 CL R12` ili `-12, 0, 12` (levo je minus). Trasa sa koridorom počinje ivicama kolovoza i bankina.
4. **Numeriši od** i **sa prefiksom** imenuju kočiće: 1, 2, 3, ili S101, S102.

## Geodetske tačke u blizini trase

Izaberi **geodetske tačke u blizini trase** i koliko blizu. Svaka tačka unutar te udaljenosti dobija svoju stacionažu i odmak, projektovanu kotu na tom mestu i sopstvenu kotu kao kotu terena: to je provera tačaka obeleženih ili snimljenih kao izvedeno stanje.

## Šta izveštaj sadrži

| Kolona | Šta je |
|---|---|
| Tačka | Ime kočića, ili broj geodetske tačke |
| Stacionaža, Odmak | Gde je duž trase: L levo, R desno |
| Sever, Istok | Njene koordinate |
| Projektovana kota | Površina projektovanog koridora na tom mestu (od linije preseka sa terenom do linije preseka), inače projektovani podužni profil na osovini |
| Kota terena | Postojeća površina na tom mestu, ili sopstvena kota geodetske tačke |
| Iskop/nasip | C kada je teren iznad projekta (treba skinuti), F kada je ispod (treba nasuti), na dve decimale |

Kočić bez projektovane kote (van koridora, ili na trasi bez nje van osovine) nema iskop ni nasip; dijalog kaže koliko ih je.

## Sačuvaj ga

- **CSV**: red sa naslovom, pa kolone iznad, plus iskop ili nasip kao označen broj (teren minus projekat) za tabele i uređaje za prikupljanje podataka.
- **PDF**: stranice tabele na papiru koji izaberete, jedan kočić po redu, iskopi narandžasto a nasipi zeleno, sa naslovnom trakom kao na ostalim listovima.

:::note
Kočići se računaju iz projekta. Proverite ih u odnosu na odobrene planove pre nego što se bilo šta izgradi.
:::
