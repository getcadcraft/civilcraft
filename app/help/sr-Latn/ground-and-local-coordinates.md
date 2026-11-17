---
title: Koordinate tla i lokalne koordinate
summary: Radite u koordinatama tla (površi) skaliranim iz mreže kombinovanim faktorom razmere koji upišete ili izračunate u tački, ili u pretpostavljenoj lokalnoj mreži vezanoj za sistem sa dve kontrolne tačke.
keywords: koordinate tla, koordinate površi, mreža u tlo, kombinovani faktor razmere, csf, kombinovani faktor, faktor mreže, faktor visine, faktor nivoa mora, konvergencija, ugao preslikavanja, faktor razmere, pretpostavljene koordinate, lokalne koordinate, mreža lokacije, 5000 5000, kontrolne tačke, lokalizacija, kalibracija, dve tačke, odstupanje zatvaranja
from: 3d7453de
---

Koordinate državne ravni i UTM-a su koordinate **mreže**: kartografska projekcija malo rasteže ili steže rastojanja (desetine delova na milion), a što je lokacija viša, to se izmereno rastojanje na terenu više razlikuje od rastojanja u mreži. Zato mnoga geodetska snimanja predaju koordinate **tla**, skalirane tako da su rastojanja na osnovi jednaka rastojanjima izmerenim na terenu, ili **pretpostavljenu** lokalnu mrežu (5000, 5000 u kontrolnoj tački). CivilCraft čuva vaše brojeve onakvim kakvi jesu i beleži kako se odnose prema mreži, tako da geografska širina i dužina, GIS datoteke i mapni slojevi i dalje stignu na pravo mesto.

Otvorite {{ui:Koordinate}} u grupi {{ui:GIS}}, izaberite (ili zadržite) sistem, pa pod **Koordinate mreže, tla ili lokalne** izaberite:

| Izbor | Vaše koordinate su | Kako se odnose prema mreži |
|---|---|---|
| {{ui:Mreža}} | Sopstvene koordinate sistema (početno stanje) | Isti brojevi |
| {{ui:Tlo}} | Skalirane na rastojanja na terenu | mreža = osnova + kombinovani faktor × (tlo − osnova) |
| {{ui:Lokalne}} | Pretpostavljena lokalna mreža | Pomerene, okrenute i skalirane na mrežu pomoću dve kontrolne tačke |

Šta god izaberete čuva se u projektu i jedan je korak opozivanja; ništa se ne pomera.

## Koordinate tla

1. Izaberite {{ui:Tlo}}.
2. Upišite **Kombinovani faktor razmere** iz geodetskog snimanja (na primer `0.99987`), ili ga izračunajte:
   1. Pod **Izračunaj faktor u tački**, tačka počinje u sredini projekta. Izaberite {{ui:Izaberi tačku na planu}} i kliknite mesto (klik blizu geodetske tačke uzima tu tačku), ili upišite E i N.
   2. Visinska kota dolazi iz površi na tom mestu; upišite drugu ako vam treba.
   3. Izaberite {{ui:Izračunaj}}. CivilCraft prikazuje:
      - **Faktor razmere mreže k**: koliko kartografska projekcija rasteže rastojanja tu.
      - **Faktor visine**: koliko su rastojanja kraća na elipsoidu nego na toj visini.
      - **Kombinovani faktor** = k × faktor visine: rastojanje u mreži = rastojanje na terenu × ovo.
      - **Konvergencija**: ugao od severa mreže do pravog severa tu (geodetski azimut = azimut mreže + konvergencija).
   4. Izaberite dugme {{ui:Upotreba}} ispod brojeva da upišete kombinovani faktor u polje.
3. Podesite **Osnovnu tačku**, gde su koordinate tla i mreže iste. Počinje od 0, 0: većina nadležnih organa koji objavljuju koordinate tla skalira oko koordinatnog početka, pa koordinate tla ostaju prepoznatljivo bliske koordinatama mreže. Neka geodetska snimanja skaliraju oko kontrolne tačke projekta: koristite ono što snimanje kaže.
4. Izaberite {{ui:Primeni}}.

:::warning
Visina se uzima kao visina iznad elipsoida. CivilCraft nema model geoida, pa tamo gde je geoid 30 m (100 ft) ispod ili iznad elipsoida faktor visine je pogrešan za oko 5 ppm. Kada snimanje navodi svoj kombinovani faktor, upišite taj.
:::

## Lokalne (pretpostavljene) koordinate

1. Izaberite {{ui:Lokalne}}.
2. Za **Kontrolnu tačku 1** upišite broj geodetske tačke (ili izaberite {{ui:Izaberi}} i kliknite je na planu). Njene lokalne koordinate prikazuju se pored nje.
3. Upišite njene **mrežne** E i N, ili njenu geografsku širinu i dužinu u trećem polju (na primer `30.2672, -97.7431`).
4. Uradite isto za **Kontrolnu tačku 2**, što dalje od prve.
5. CivilCraft prikazuje nađeni **Razmeru** i **Rotaciju**, i podseća: **Dve tačke uvek se tačno poklope — proverite treću.**
6. Zadajte **Kontrolnu tačku za proveru** na isti način. CivilCraft prikazuje koliko je poklapanje udaljava od mrežnih koordinata koje ste upisali (njeno odstupanje zatvaranja, u jedinicama projekta i delovima na milion). Veliko odstupanje znači pogrešnu tačku, grešku u kucanju, ili koordinate u drugoj jedinici.
7. Izaberite {{ui:Primeni}}.

Razmera daleko od 1 (preko 0,5 do 2) se odbija: proverite tačke i njihove jedinice.

## Šta je proverено

- Faktor razmere i konvergencija poklapaju se sa PROJ-om (pyproj 3.7.1 sa PROJ 9.5.1), bibliotekom koordinata koju koristi većina GIS programa, do 1 dela u milijardu na preko 300 sistema sa konformnim projekcijama (državna ravan, UTM, poprečna Merkatorova, Lambertova konformna konusna), i u pregledaču u tački izabranoj na osnovi.
- Koraci tla i lokalni koraci se pretvaraju napred i nazad do 1 dela u milijardu; dve kontrolne tačke vraćaju razmeru i rotaciju sa kojima su napravljene; kontrolna tačka 0,05 ft pomerena pokazuje odstupanje zatvaranja od 0,05 ft.
