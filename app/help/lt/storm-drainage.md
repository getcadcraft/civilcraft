---
title: Apskaičiuoti lietaus nuotekų srautus, vamzdžių dydžius ir hidraulinę nuolydžio liniją
summary: Nubrėžti surinkimo plotus, kurie nuteka į kiekvieną šulinį, susumuoti srautus visu tinklu racionaliuoju metodu, parinkti vamzdžių dydžius pagal Manningo lygtį ir matyti, kur hidraulinė nuolydžio linija yra pilna arba pasiekia paviršių.
keywords: lietaus nuotekos, surinkimo plotas, racionalusis metodas, nuotėkio koeficientas, koncentracijos laikas, lietaus intensyvumas, idf, manningas, vamzdžio dydžio parinkimas, hidraulinė nuolydžio linija, hgl, energijos nuolydžio linija, egl, perpildymas, užliejimas, išleidimo vandens lygis
from: e44872ec
---

Lietaus nuotekos veikia [vamzdynų tinkle](topic:pipe-network): pirmiausia nubrėžkite tinklą, tada plotus, kurie į jį nuteka. Viskas rodoma dešiniajame skydelyje po **Lietaus nuotekos**, kai nieko nepasirinkta.

## Nubrėžti surinkimo plotą

1. Spustelėkite **Nubrėžti surinkimo plotą** po **Lietaus nuotekos**.
2. Spustelėkite ploto, kuris nuteka į vieną šulinį, kampus. {{key:Enter}} arba dvigubas spustelėjimas baigia; {{key:Backspace}} atšaukia paskutinį kampą, {{key:Esc}} sustabdo.
3. Surinkimo plotas nuteka į jame esantį šulinį, kitu atveju į artimiausią. Atsidaro jo **Savybės**: nustatykite pavadinimą, **Nuotėkio koeficientą C** (lietaus dalis, kuri nuteka, nuo 0 iki 1), **Koncentracijos laiką** minutėmis ir tai, į kurį šulinį **Nuteka į**.

**Nubrėžti kitą surinkimo plotą** jo Savybėse pradeda kitą. Spustelėkite surinkimo plotą plane, kad jį pasirinktumėte; {{key:Delete}} jį pašalina. Kiekvienas pakeitimas yra vienas žingsnis: {{key:Mod+Z}} jį anuliuoja.

## Nustatyti projektinę liūtį

Lietaus intensyvumas yra i = a ÷ (tc + b) laipsniu c, colių per valandą projektams pėdomis ir milimetrų per valandą metrų projektams. Pritaikykite **Intensyvumas a**, **b** ir **c** prie savo intensyvumo–trukmės–dažnio kreivės tam pasikartojimo periodui, kuriam projektuojate.

:::warning
Pradinė intensyvumo kreivė, Manningo n (0,013) ir sankirtos nuostolis (0,5) yra laikinos reikšmės, o ne standartas. Nustatykite jas pagal savo lietaus duomenis ir projektavimo kriterijus.
:::

- **Trumpiausias koncentracijos laikas**: joks vamzdis neskaičiuojamas trumpesniam laikui (pradžioje 10 minučių).
- **Manningo n**: vamzdžių šiurkštumas.
- **Sankirtos nuostolis**: galva, prarandama kiekviename šulinyje, kaip dalis greičio aukščio V²/2g išeinančiam vamzdžiui.
- **Vandens lygis išleidimo angoje**: išleidimo vandens lygis, kur baigiasi paskutinis vamzdis. Palikite tuščią, kai išleidimas yra laisvas.

## Kaip sumuojami srautai

Kiekvienas vamzdis neša visus surinkimo plotus virš jo. Q = C × i × A, kur C × A sumuojama visu tinklu, o i yra intensyvumas ilgiausiam atvykstančio vandens koncentracijos laikui: paties surinkimo ploto laikui arba laikui nuo aukštupio surinkimo ploto plius tekėjimo laikas vamzdžiais (ilgis ÷ greitis pilnai užpildytame vamzdyje). Q išreiškiamas kubinėmis pėdomis per sekundę (A akrais) arba kubiniais metrais per sekundę (A hektarais).

## Parinkti vamzdžių dydžius

Lentelėje po **Srautai ir nuolydžio linijos** kiekvienam vamzdžiui rodomas srautas, tai, ką jis neša tekėdamas pilnai esant savo nuolydžiui, greitis, hidraulinė nuolydžio linija jo viršuje ir apačioje bei kaip giliai jis teka.

**Parinkti vamzdžius pagal šiuos srautus** kiekvienam vamzdžiui suteikia mažiausią standartinį dydį, kuris neša jo srautą esant jo nuolydžiui (nuo 12 iki 72 colių arba nuo 300 iki 1800 mm). Tai vienas žingsnis. Dugnai lieka savo vietose: jei dydžiai pasikeičia, naudokite **Nustatyti visus dugnų aukščius pagal taisykles**, kad išlaikytumėte dengimo gylį, tada vėl patikrinkite lentelę.

## Skaityti nuolydžio linijas

Hidraulinė nuolydžio linija (HGL) apskaičiuojama nuo išleidimo angos aukštupio kryptimi:

- Iš dalies pilnai tekantis vamzdis turi HGL vandens paviršiuje: dugnas plius normalus gylis.
- Kai vanduo žemiau yra aukštesnis už viršutinį vamzdžio tašką arba neša daugiau, nei gali pilnai tekėdamas, vamzdis teka pilnas (perpildytas) ir jo HGL pakyla pagal trinties nuolydį per jo ilgį.
- Kiekvienoje sankirtoje HGL yra išeinančio vamzdžio viršutinis HGL plius sankirtos nuostolis.
- Energijos nuolydžio linija (EGL) yra HGL plius greičio aukštis.

Vamzdis, kuris teka pilnas, išvardijamas, taip pat ir kiekvienas šulinys, kuriame HGL yra virš viršutinio krašto: ten vanduo pasiekia paviršių, o šulinys plane apibraukiamas raudonai. Pasirinkite vamzdį ar šulinį, kad jo Savybėse pamatytumėte srautą, gylį, greitį ir abi nuolydžio linijas.

## Nuvesti liūtį

Racionalusis metodas duoda vieną smailę kiekvienam vamzdžiui. {{ui:Route the storm}} (rezultatų apačioje, tinklo Savybėse) apskaičiuoja visą liūtį: kiekvieno surinkimo ploto nuotėkį laike, nuvestą vamzdžiais su jų tekėjimo laiku ir talpa bei sudėtą ten, kur jie susitinka.

1. Palikite tuščius {{ui:Rain lasts}} ir {{ui:Rain intensity}}, kad būtų naudojamas ilgiausias koncentracijos laikas ir aukščiau nurodyta lietaus kreivė, arba įveskite savo.
2. Paspauskite {{ui:Route the storm}}. Lentelėje kiekvienam vamzdžiui išvardijamas didžiausias įtekantis ir ištekantis srautas, kiek mažesnė išeinanti smailė, kokia dalis pilnos vamzdžio talpos naudojama ir minutė, kurioje pasiekiama smailė.
3. Kiekviena išleidimo vieta gauna mažą srauto laiko diagramą ir {{ui:Download the hydrograph (CSV)}}.

Surinkimo plotas siunčia lietų, vidurkintą per savo koncentracijos laiką, todėl trumpesnė už jį liūtis duoda žemesnę smailę nei C × i × A. Kiekvienas vamzdis nuvedamas Muskingum–Cunge metodu, naudojant srauto gylį, kurį jau rado racionalusis metodas. Dvi šakos su skirtingais koncentracijos laikais nesiekia smailių kartu, todėl jų suma yra mažesnė už smailių sumą.

Tai nemodeliuoja perpildymo, atoslūgio, talpos šuliniuose ar užliejimo. Vamzdis, kurio nuvestos smailės viršija pilną talpą, išvardijamas, o jo vanduo perduodamas tarsi tilptų. Naudokite tai laiko ir slopinimo matymui, o ne vamzdžio dydžiui parinkti. Tai skaičiavimo pagalba: skaičiavimą tikrina inžinierius.

## Išsaugoma su projektu

Surinkimo plotai ir liūties nustatymai išsaugomi projekto faile. Jų dar nėra PDF spausdinyje, DWG ar DXF failuose ar LandXML: žr. [Dar neįgyvendinta](topic:not-built-yet).
