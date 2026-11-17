---
title: Koordinate tal in lokalne koordinate
summary: Delajte v koordinatah tal (površja), skaliranih iz mreže s kombiniranim faktorjem merila, ki ga vpišete ali izračunate v točki, ali v predpostavljeni lokalni mreži mesta, navezani na sistem z dvema kontrolnima točkama.
keywords: koordinate tal, koordinate površja, mreža v tla, kombinirani faktor merila, csf, kombinirani faktor, faktor mreže, faktor višine, faktor morske gladine, konvergenca, kot preslikave, faktor merila, predpostavljene koordinate, lokalne koordinate, mreža mesta, 5000 5000, kontrolne točke, lokalizacija, kalibracija, dvotočkovno, napaka zaprtja
from: 3d7453de
---

Koordinate državne ravnine in UTM so **mrežne** koordinate: kartografska projekcija malce razteza ali krči razdalje (desetine delcev na milijon), in višje ko je mesto, bolj se izmerjena razdalja na terenu razlikuje od mrežne. Mnogi geodetski elaborati zato predajo **koordinate tal**, skalirane tako, da so razdalje na načrtu enake razdaljam, izmerjenim na terenu, ali **predpostavljeno** mrežo mesta (5000, 5000 v kontrolni točki). CivilCraft ohrani vaše številke, kakršne so, in zabeleži, kako so povezane z mrežo, tako da zemljepisna širina in dolžina, datoteke GIS in kartografski sloji še vedno pristanejo na pravem mestu.

Odprite {{ui:Koordinate}} v skupini {{ui:GIS}}, izberite (ali pustite) sistem, nato pod **Mrežne, tla ali lokalne koordinate** izberite:

| Izbira | Vaše koordinate so | Kako se navezujejo na mrežo |
|---|---|---|
| {{ui:Mreža}} | Sistemove lastne (izhodišče) | Enake številke |
| {{ui:Tla}} | Skalirane na razdalje na terenu | mreža = osnova + kombinirani faktor × (tla − osnova) |
| {{ui:Lokalno}} | Predpostavljena mreža mesta | Premaknjena, zasukana in skalirana na mrežo z dvema kontrolnima točkama |

Kar izberete, se shrani v projekt in je en korak razveljavitve; nič se ne premakne.

## Koordinate tal

1. Izberite {{ui:Tla}}.
2. Vpišite **Kombinirani faktor merila** iz geodetskega elaborata (na primer `0.99987`) ali ga izračunajte:
   1. Pod **Izračunaj faktor v točki** je točka na začetku v sredini projekta. Izberite {{ui:Izberi točko na načrtu}} in kliknite mesto (klik blizu geodetske točke vzame to točko), ali vpišite E in N.
   2. Višina pride s površja na tem mestu; če potrebujete drugo, jo vpišite.
   3. Izberite {{ui:Izračunaj}}. CivilCraft prikaže:
      - **Mrežni faktor merila k**: koliko kartografska projekcija tam razteza razdalje.
      - **Faktor višine**: koliko krajše so razdalje na elipsoidu kot na tej višini.
      - **Kombinirani faktor** = k × faktor višine: mrežna razdalja = razdalja na terenu × to.
      - **Konvergenca**: kot od mrežnega severa do pravega severa tam (geodetski azimut = mrežni azimut + konvergenca).
   4. Izberite gumb {{ui:Uporaba}} pod številkami, da kombinirani faktor vstavite v polje.
3. Nastavite **Izhodiščna točka**, kjer sta koordinati tal in mrežni enaki. Začne se pri 0, 0: večina pristojnih organov, ki objavljajo koordinate tal, skalira okoli izhodišča, zato koordinate tal ostanejo prepoznavno blizu mrežnih. Nekateri elaborati skalirajo okoli kontrolne točke projekta: uporabite, kar piše v elaboratu.
4. Izberite {{ui:Uporabi}}.

:::warning
Višina je vzeta kot višina nad elipsoidom. CivilCraft nima modela geoida, zato je tam, kjer je geoid 30 m (100 ft) pod ali nad elipsoidom, faktor višine napačen za približno 5 ppm. Kadar elaborat navede svoj kombinirani faktor, vpišite tega.
:::

## Lokalne (predpostavljene) koordinate

1. Izberite {{ui:Lokalno}}.
2. Za **Kontrolno točko 1** vpišite številko geodetske točke (ali izberite {{ui:Izberi}} in jo kliknite na načrtu). Njene lokalne koordinate se prikažejo poleg nje.
3. Vpišite njeni **mrežni** E in N ali njeno zemljepisno širino in dolžino v tretje polje (na primer `30.2672, -97.7431`).
4. Enako storite za **Kontrolno točko 2**, čim dlje od prve.
5. CivilCraft prikaže najdeno **Merilo** in **Zasuk** ter opomni: **Dve točki se vedno prilegata natančno — preverite tretjo.**
6. Dodajte **Preverjalno točko** na enak način. CivilCraft prikaže, za koliko jo prilagoditev postavi od mrežnih koordinat, ki ste jih vpisali (njeno napako zaprtja, v enotah projekta in v delcih na milijon). Velika napaka zaprtja pomeni napačno točko, tipkarsko napako ali koordinate v drugi enoti.
7. Izberite {{ui:Uporabi}}.

Merilo, daleč od 1 (onkraj 0.5 do 2), je zavrnjeno: preverite točke in njihove enote.

## Kaj je bilo preverjeno

- Faktor merila in konvergenca se ujemata s PROJ (pyproj 3.7.1 s PROJ 9.5.1), knjižnico koordinat, ki jo večina GIS-programov uporablja, na 1 del v milijardi za več kot 300 sistemov s konformnimi projekcijami (državna ravnina, UTM, prečna Mercatorjeva, Lambertova konformna stožčasta) in v brskalniku pri točki, izbrani na načrtu.
- Koraki tal in lokalnih koordinat se pretvarjajo tja in nazaj na 1 del v milijardi; dve kontrolni točki vrneta merilo in zasuk, s katerima sta bili ustvarjeni; preverjalna točka, oddaljena 0.05 ft, pokaže napako zaprtja 0.05 ft.
