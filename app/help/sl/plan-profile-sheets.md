---
title: Listi tlorisa in vzdolžnega profila
summary: Izris trase kot niz listov tlorisa in vzdolžnega profila v enem PDF-ju, z linijami navezave med njimi.
keywords: tloris in profil, listi, izris, pdf, linija navezave, izdelava tlorisov, cestni načrti, izris profila, navpična povečava, komplet listov
from: 34b4ec78
---

Listi tlorisa in vzdolžnega profila so običajen način risanja cestnih načrtov: vsak list prikazuje en odsek ceste dvakrat, tloris zgoraj in vzdolžni profil spodaj, pri enakem vodoravnem merilu, tako da je stacionaža na obeh na istem mestu.

## Izdelava listov

1. Izberite traso. V **Lastnostih** kliknite {{ui:Plan and profile sheets}}.
2. Izberite **Papir**, **Merilo tlorisa** in **Povečavo profila** (kolikokrat višji je profil od svoje dolžine; za začetek 10×). Pogovorno okno pove, koliko listov nastane in koliko trase prikazuje vsak.
3. Če želite izrisati del trase, spremenite **Od stacionaže** in **Do stacionaže**.
4. Kliknite {{ui:Download PDF}}. PDF ima eno stran na list.

## Kaj je na listu

| Del | Kaj prikazuje |
|---|---|
| Tloris | Vse na tlorisu (plastnice, geodetske točke, trasa in njena stacionaža, koridorji, ploščadi, karakteristične črte, cevi, prečne linije), zasukano tako, da ta odsek teče čez list, s puščico severa, zasukano enako |
| Linije navezave | Pika-črta, pravokotna na trasi na vsakem koncu, ki se nadaljuje na drugem listu, z oznako „Linija navezave sta 5+50.00, glej list 2“ |
| Profil | Obstoječi teren (črtkano), projektni profil (rdeče), naklon vsake tangente in vsaka navpična krivina z PVI, višino, L in K; stacionaže vzdolž spodnjega roba, višine na obeh straneh |
| Glava risbe | Ime projekta, trasa in njen obseg stacionaž, „List 1 od 3“, vodoravno in navpično merilo ter povečava |

Odsek na list je tako dolg, kot dovoli okno tlorisa pri merilu, zaokrožen navzdol na celih 50 ft (20 m) pri dolgih odsekih ali na celih 10 ft (5 m) pri kratkih.

:::note
Če višine profila pri izbrani povečavi ne bi bile prikazane, CivilCraft nariše vsak list pri največji od povečav 10×, 5×, 4×, 2× in 1×, ki ustreza, statusna vrstica pa to pove. Krivljena trasa se zasuka glede na smer od začetka do konca vsakega odseka, zato lahko cesta na listu rahlo teče navzgor ali navzdol.
:::
