---
title: Ključi opisa in kode črt
summary: Terenske kode spremenite v skupine točk z opisi in povežite kodirane točke v črte (začetek, konec, zaprtje), ki postanejo prelomnice.
keywords: ključi opisa, terenske kode, kode črt, geodetske kode, zbiralnik podatkov, črte, začetek, konec, zaprtje, skupine točk, kode, prelomnice, robnik, rob vozišča
from: b3d1af8d
---

Geodetske ekipe kodirajo vsak posnetek na terenu: `EP` za rob vozišča, `TC` za vrh robnika, `BLDG` za vogal stavbe. Koda je prva beseda v opisu točke. CivilCraft točke razvršča po njej in kode črt za njo spremeni v črte.

## Kode črt

Koda črte je beseda takoj za terensko kodo:

| Opis | Pomen |
|---|---|
| `EP B` | Na tej točki začne novo črto roba vozišča |
| `EP` | Nadaljuje trenutno črto EP |
| `EP E` | Na tej točki konča trenutno črto EP |
| `BLDG C` | Zapre stavbo: to točko poveže nazaj na prvo točko črte |

Točke z isto kodo se povežejo po vrstnem redu številk točk. Različne kode so različne črte, tudi če so v isti skupini, zato `EP1` in `EP2` dasta hkrati dva robova. Koda, ki nikoli ne uporabi kode črte, se poveže prek vseh svojih točk, kot v prejšnjih različicah.

Črte v skupini, uporabljeni kot **Prelomnica**, postanejo prelomnice, po ena za vsako črto, tako da robnik z vrzeljo ni raztegnjen čez vrzel. Črte v drugih skupinah se narišejo na načrt (sloj V-NODE-LINE) in gredo v DXF, DWG in PDF.

Besede za začetek, konec in zaprtje so `B`, `BEG`, `START`; `E`, `END`; in `C`, `CLO`, `CLOSE`. Spremenite jih ali izklopite kode črt v spodnjem pogovornem oknu.

## Ključi opisa

Ključ opisa spremeni kodo v skupino točk, namen in dolg opis.

1. Pod **Točke** kliknite {{ui:Ključi opisa in kode črt}}.
2. Kliknite {{ui:Dodaj ključ}} in izpolnite vrstico:
   - **Koda**: terenska koda, ki se ujema. `*` pomeni poljubne znake in `?` en znak, tako da `EP*` zajame EP, EP1 in EP12.
   - **Skupina**: skupina točk, v katero se te točke združijo (prazno = sama koda). `EP*` s skupino `EP` da EP1 in EP2 v eno skupino, čeprav ostaneta ločeni črti.
   - **Namen**: Točke, Prelomnica ali Izpusti, za trenutek, ko se skupina prvič pojavi (ali prepustite to tabeli **Točke**).
   - **Opis**: dolgo ime, prikazano v **Lastnostih** točke.
3. Stolpec **Točke** šteje točke, ki jih vsak ključ zajame, ko tipkate. Zmaga prvi ključ, ki se ujema s kodo.
4. Kliknite {{ui:Uporabi}}. Skupine, površje in načrt sledijo v enem koraku: {{key:Mod+Z}} jo razveljavi.

Skupina obdrži namen, ki ste ga dali v tabeli **Točke**; namen ključa ga nastavi le za novo skupino. Ključi in kode črt se shranijo v datoteko projekta.
