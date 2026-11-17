---
title: Koordinate tla i lokalne koordinate
summary: Radite u koordinatama tla (terena) skaliranim od mreže faktorom mjerila koji upišete ili izračunate u točki, ili u pretpostavljenoj mreži lokacije vezanoj uz sustav dvjema kontrolnim točkama.
keywords: koordinate tla, koordinate terena, mreža u tlo, kombinirani faktor mjerila, csf, kombinirani faktor, faktor mreže, faktor visine, faktor razine mora, konvergencija, kut preslikavanja, faktor mjerila, pretpostavljene koordinate, lokalne koordinate, lokalna mreža, 5000 5000, kontrolne točke, lokalizacija, kalibracija, dvotočkovno, zatvaranje
from: 3d7453de
---

Državna ravnina i UTM koordinate su **mrežne** koordinate: kartna projekcija malo rasteže ili steže udaljenosti (desetke dijelova na milijun), a što je lokacija viša, to se izmjerena udaljenost na terenu više razlikuje od mrežne. Mnoga geodetska mjerenja zato predaju **koordinate tla**, skalirane tako da su udaljenosti na tlocrtu jednake udaljenostima izmjerenim na terenu, ili **pretpostavljenu** mrežu lokacije (5000, 5000 u kontrolnoj točki). CivilCraft zadržava vaše brojeve kakvi jesu i bilježi kako se odnose prema mreži, pa zemljopisna širina i dužina, GIS datoteke i kartni slojevi i dalje završavaju na pravom mjestu.

Otvorite {{ui:Koordinate}} u grupi {{ui:GIS}}, odaberite (ili zadržite) sustav, zatim pod **Mrežne, tlo ili lokalne koordinate** izaberite:

| Izbor | Vaše koordinate su | Kako se odnose prema mreži |
|---|---|---|
| {{ui:Mreža}} | Vlastite koordinate sustava (početni) | Isti brojevi |
| {{ui:Tlo}} | Skalirane na udaljenosti na terenu | mreža = baza + kombinirani faktor × (tlo − baza) |
| {{ui:Lokalno}} | Pretpostavljena mreža lokacije | Pomaknute, zaokrenute i skalirane na mrežu dvjema kontrolnim točkama |

Što god izaberete, sprema se s projektom i jedan je korak poništavanja; ništa se ne pomiče.

## Koordinate tla

1. Izaberite {{ui:Tlo}}.
2. Upišite **Kombinirani faktor mjerila** iz geodetskog mjerenja (na primjer `0.99987`), ili ga izračunajte:
   1. Pod **Izračunaj faktor u točki** točka počinje u sredini projekta. Odaberite {{ui:Odaberite točku u tlocrtu}} i kliknite mjesto (klik blizu geodetske točke uzima tu točku), ili upišite E i N.
   2. Visina dolazi s terena na tom mjestu; upišite drugu ako vam treba.
   3. Odaberite {{ui:Izračunaj}}. CivilCraft prikazuje:
      - **Faktor mjerila mreže k**: koliko kartna projekcija rasteže udaljenosti na tom mjestu.
      - **Faktor visine**: koliko su udaljenosti kraće na elipsoidu nego na toj visini.
      - **Kombinirani faktor** = k × faktor visine: udaljenost u mreži = udaljenost na terenu × ovo.
      - **Konvergencija**: kut od mrežnog sjevera do pravog sjevera na tom mjestu (geodetski azimut = azimut mreže + konvergencija).
   4. Odaberite gumb {{ui:Namjena}} ispod brojeva da upišete kombinirani faktor u okvir.
3. Postavite **Baznu točku**, gdje se koordinate tla i mreže podudaraju. Počinje s 0, 0: većina nadležnih tijela koja objavljuju koordinate tla skalira oko ishodišta, pa koordinate tla ostaju prepoznatljivo blizu mrežnih. Neka geodetska mjerenja skaliraju oko kontrolne točke projekta: koristite ono što mjerenje kaže.
4. Odaberite {{ui:Primijeni}}.

:::warning
Visina se uzima kao visina iznad elipsoida. CivilCraft nema model geoida, pa je tamo gdje je geoid 30 m (100 ft) ispod ili iznad elipsoida faktor visine netočan za oko 5 ppm. Kad geodetsko mjerenje navodi svoj kombinirani faktor, upišite taj.
:::

## Lokalne (pretpostavljene) koordinate

1. Izaberite {{ui:Lokalno}}.
2. Za **Kontrolnu točku 1** upišite broj geodetske točke (ili odaberite {{ui:Odaberi}} i kliknite je na tlocrtu). Njezine lokalne koordinate prikazuju se pokraj nje.
3. Upišite njezine **mrežne** E i N, ili njezinu zemljopisnu širinu i dužinu u trećem okviru (na primjer `30.2672, -97.7431`).
4. Učinite isto za **Kontrolnu točku 2**, što dalje od prve možete.
5. CivilCraft prikazuje pronađeni **Mjerilo** i **Rotaciju** i podsjeća: **Dvije točke uvijek pristaju savršeno: provjerite treću.**
6. Zadajte **Točku provjere** na isti način. CivilCraft prikazuje koliko je pristajanje udaljuje od mrežnih koordinata koje ste upisali (njezino zatvaranje, u jedinicama projekta i u ppm). Veliko zatvaranje znači pogrešnu točku, pogrešku pri tipkanju ili koordinate u drugoj jedinici.
7. Odaberite {{ui:Primijeni}}.

Mjerilo daleko od 1 (izvan 0.5 do 2) se odbija: provjerite točke i njihove jedinice.

## Što je provjereno

- Faktor mjerila i konvergencija podudaraju se s PROJ-om (pyproj 3.7.1 s PROJ 9.5.1), bibliotekom koordinata koju koristi većina GIS programa, do 1 dijela u milijardi na više od 300 sustava s konformnim projekcijama (državna ravnina, UTM, poprečni Mercator, Lambertov konformni konusni), te u pregledniku u točki odabranoj na tlocrtu.
- Koraci tla i lokalni koraci pretvaraju se naprijed i natrag do 1 dijela u milijardi; dvije kontrolne točke vraćaju mjerilo i rotaciju s kojima su nastale; kontrolna točka 0.05 ft izvan prikazuje zatvaranje od 0.05 ft.
