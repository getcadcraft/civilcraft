---
title: Risanje parcel in zapis njihovih pravnih opisov
summary: Narišite parcelo po njenih vogalih ali vnesite odseke iz listine ali načrta parcelacije, preverite, kako dobro se odseki sklenejo, označite smeri in razdalje na načrtu, naredite poljuben odsek za krivino in kopirajte osnutek pravnega opisa.
keywords: parcele, lastniške meje, meja, listina, načrt parcelacije, meje in mere, smer, razdalja, zaprtje, odstopanje, natančnost, pravni opis, izhodiščna točka, krivina, polmer, površina, acres
from: 6793d6ce
---

Parcele so na načrtu z smerjo in razdaljo vzdolž vsakega ravnega odseka (krivina prikazuje svoj polmer, dolžino in središčni kot) ter z imenom in površino na sredini. Gredo v izris PDF ter v izvoze DWG in DXF, na slojih `V-PROP` (črte) in `V-PROP-TEXT` (oznake). Vse je pod **Parcele** v desnem podoknu, kadar nič ni izbrano.

## Narišite parcelo

1. Kliknite **Nariši parcelo**.
2. Kliknite vogale, začnite pri izhodiščni točki. Klik blizu geodetske točke prevzame natančen položaj te točke.
3. Za konec znova kliknite prvi vogal ali pritisnite {{key:Enter}}. {{key:Backspace}} povrne zadnji vogal; {{key:Esc}} izbriše doslej nanesene vogale; za izhod iz orodja ga pritisnite znova.

## Vnesite odseke iz listine

1. Kliknite **Vnesi odseke iz listine**.
2. Navedite, kje se odseki začnejo: številko geodetske točke ali severno in vzhodno koordinato.
3. Vnesite ali prilepite odseke, po enega v vrstici:
   - ravna črta: smer in razdalja, na primer `N 45°30'15" E 125.50`. Delujejo tudi `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` in azimuti (`AZ 45°30'15"`), besede "thence", vejice in "feet" pa se prezrejo.
   - krivina: `C R 300 L 52.36 right` (polmer in dolžina loka) ali `C R 300 D 10°00'00" left` (polmer in središčni kot). Krivina sledi odseku pred njo; če ne, dodajte njeno smer tetive: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` začne vrstico s komentarjem.
4. Med tipkanjem pogovorno okno prikazuje dolžino odsekov, **odstopanje zaprtja** (kako daleč od začetka se končajo in v katero smer), **natančnost** (dolžina, deljena z odstopanjem, 1 : 10,000 in podobno) ter površino. Vrstice, ki jih ne more prebrati, so naštete s številkami vrstic.
5. **Dodaj parcelo**. Če se odseki ne sklenejo, se parcela zaključi z ravnim odsekom čez vrzel: preverite odseke glede na listino. Če želite napako terenskega poligonskega vlaka razporediti po njegovih odsekih, jo najprej popravite.

## Krivine

V **Lastnostih** parcele ima vsak odsek **Polmer**. Vnesite ga, da odsek postane krivina med istima dvema vogaloma (polmer, manjši od polovice razdalje med vogaloma, ne more doseči, zato se zavrne), v **Krivinah** pa izberite **Desno** ali **Levo**: krivina na desno ima središče desno od smeri gibanja, kot v listini. Izbris polmera odsek spet naredi raven. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi.

## Pravni opis

Lastnosti parcele se končajo s pravnim opisom, napisanim iz risbe:

- „Začetek pri“ **izhodiščni točki**, ki jo vnesete (na primer „severovzhodni vogal parcele 4“), sicer severna in vzhodna koordinata prvega vogala ali geodetska točka, pri kateri so se odseki začeli.
- „nato“ vsak odsek: smer in razdalja ali krivina s polmerom, dolžino loka, središčnim kotom ter smerjo in razdaljo tetive.
- „Obsega“ površino v square feet in acres (square meters in hectares v projektu v metrih).

**Kopiraj** ga da na odložišče; **Prenesi kot besedilo** ga shrani kot datoteko `.txt`.

:::warning
Pravni opis je osnutek, narejen iz risbe, ne geodetska izmera. Preden se kdo nanj zanese, mora licencirani geodet preveriti, ali se ujema z evidenco, in ga podpisati.
:::

Kliknite znotraj parcele na načrtu, da jo izberete; {{key:Delete}} jo odstrani. Parcele se shranijo v projektno datoteko.
