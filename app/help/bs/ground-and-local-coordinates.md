---
title: Koordinate terena i lokalne koordinate
summary: Radi u koordinatama terena (površi) skaliranim od mreže faktorom kombinovane razmjere koji upišeš ili izračunaš u tački, ili u pretpostavljenoj lokalnoj mreži vezanoj za sistem sa dvije kontrolne tačke.
keywords: koordinate terena, koordinate površi, mreža u teren, kombinovani faktor razmjere, csf, kombinovani faktor, faktor mreže, faktor kote, faktor nivoa mora, konvergencija, ugao preslikavanja, faktor razmjere, pretpostavljene koordinate, lokalne koordinate, lokalna mreža, 5000 5000, kontrolne tačke, lokalizacija, kalibracija, dvije tačke, neslaganje
from: 3d7453de
---

Koordinate State Plane i UTM su **mrežne** koordinate: kartografska projekcija malo rasteže ili steže udaljenosti (desetine dijelova na milion), a što je lokacija viša, to se izmjerena udaljenost na terenu više razlikuje od mrežne. Mnogi premjeri zato predaju **koordinate terena**, skalirane tako da su udaljenosti na planu jednake udaljenostima izmjerenim na terenu, ili **pretpostavljenu** lokalnu mrežu (5000, 5000 u kontrolnoj tački). CivilCraft čuva tvoje brojeve kakvi jesu i bilježi kako se odnose prema mreži, pa geografska širina i dužina, GIS datoteke i kartografski slojevi i dalje padaju na pravo mjesto.

Otvori {{ui:Koordinate}} u grupi {{ui:GIS}}, odaberi (ili zadrži) sistem, pa izaberi pod **Mrežne, terenske ili lokalne koordinate**:

| Izbor | Tvoje koordinate su | Kako se odnose prema mreži |
|---|---|---|
| {{ui:Mreža}} | Vlastite koordinate sistema (početak) | Isti brojevi |
| {{ui:Tlo}} | Skalirane na udaljenosti na terenu | mreža = baza + kombinovani faktor × (teren − baza) |
| {{ui:Lokalne}} | Pretpostavljena lokalna mreža | Pomjerene, okrenute i skalirane na mrežu pomoću dvije kontrolne tačke |

Ono što izabereš se čuva sa projektom i jedan je korak poništavanja; ništa se ne pomjera.

## Koordinate terena

1. Odaberi {{ui:Tlo}}.
2. Upiši **Kombinovani faktor razmjere** iz premjera (na primjer `0.99987`), ili ga izračunaj:
   1. Pod **Izračunaj faktor u tački** tačka počinje u središtu projekta. Odaberi {{ui:Odaberi tačku na planu}} i klikni mjesto (klik blizu premjerne tačke uzima tu tačku), ili upiši E i N.
   2. Kota dolazi iz površi na tom mjestu; upiši drugu ako ti treba.
   3. Odaberi {{ui:Izračunaj}}. CivilCraft prikazuje:
      - **Faktor mrežne razmjere k**: koliko kartografska projekcija rasteže udaljenosti na tom mjestu.
      - **Faktor kote**: koliko su kraće udaljenosti na elipsoidu nego na toj visini.
      - **Kombinovani faktor** = k × faktor kote: mrežna udaljenost = udaljenost na terenu × ovo.
      - **Konvergencija**: ugao od mrežnog sjevera do pravog sjevera na tom mjestu (geodetski azimut = mrežni azimut + konvergencija).
   4. Odaberi dugme {{ui:Upotreba}} ispod brojeva da upišeš kombinovani faktor u polje.
3. Postavi **Baznu tačku**, gdje su koordinate terena i mrežne iste. Počinje od 0, 0: većina nadležnih organa koji objavljuju koordinate terena razmjerava oko ishodišta, pa koordinate terena ostaju prepoznatljivo blizu mrežnih. Neki premjeri razmjeravaju oko kontrolne tačke projekta: koristi ono što premjer kaže.
4. Odaberi {{ui:Primijeni}}.

:::warning
Kota se uzima kao visina iznad elipsoida. CivilCraft nema model geoida, pa gdje je geoid 30 m (100 ft) ispod ili iznad elipsoida, faktor kote je pogrešan za oko 5 ppm. Kad premjer navede svoj kombinovani faktor, upiši taj.
:::

## Lokalne (pretpostavljene) koordinate

1. Odaberi {{ui:Lokalne}}.
2. Za **Kontrolnu tačku 1** upiši broj tačke premjera (ili odaberi {{ui:Odaberi}} i klikni je na planu). Njene lokalne koordinate se prikazuju pored nje.
3. Upiši njene **mrežne** E i N, ili njenu geografsku širinu i dužinu u trećem polju (na primjer `30.2672, -97.7431`).
4. Uradi isto za **Kontrolnu tačku 2**, što dalje od prve.
5. CivilCraft prikazuje pronađene **Razmjeru** i **Rotaciju**, i podsjeća: **Dvije tačke uvijek pristaju tačno — provjeri treću.**
6. Zadaj **Tačku za provjeru** na isti način. CivilCraft prikazuje koliko ju je poravnanje udaljilo od mrežnih koordinata koje si upisao (njeno neslaganje, u jedinicama projekta i u dijelovima na milion). Veliko neslaganje znači pogrešnu tačku, grešku u kucanju, ili koordinate u drugoj jedinici.
7. Odaberi {{ui:Primijeni}}.

Razmjera daleko od 1 (izvan 0.5 do 2) se odbija: provjeri tačke i njihove jedinice.

## Šta je provjereno

- Faktor razmjere i konvergencija se poklapaju sa PROJ-om (pyproj 3.7.1 sa PROJ 9.5.1), bibliotekom koordinata koju većina GIS programa koristi, do 1 dijela u milijardi nad preko 300 sistema sa konformnim projekcijama (state plane, UTM, poprečni Merkatorov, Lambertov konformni konus), i u pregledniku u tački odabranoj na planu.
- Koraci terena i lokalni se konvertuju tamo i nazad do 1 dijela u milijardi; dvije kontrolne tačke vraćaju razmjeru i rotaciju sa kojima su napravljene; tačka za provjeru 0.05 ft van pokazuje neslaganje od 0.05 ft.
