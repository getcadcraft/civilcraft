---
title: Haljastuse tööruum
summary: Istutusplaanid, vertikaalplaneerimine, sillutis, seinad, astmed, niisutus ja haljastuslehed samal objektil, samade pindade ja samas failis, mis tsiviiltööd.
keywords: haljastus, haljastusarhitektuur, aed, istutus, taimed, puud, vertikaalplaneerimine, kõvad pinnad, sillutis, niisutus, pihustid, tööruum, objekti kavandamine, haljastusplaan
from: eea929d1
---

Haljastuse tööruum paneb haljastuse kavandamise tööriistad sinu olemasolevale CivilCrafti objektile: samad mõõdistuspunktid, sama olemasolev maapind, sama projekteeritud pind ja sama projektifail.

## Ava see

Vali {{ui:Pind}} › {{ui:Veel}} › {{ui:Haljastuse tööruum}}. Tööriistariba näitab siis valikut **Tööruum** ja rühma **Haljastus**; rühmad Pind, Kavandus ja GIS taanduvad, et ruumi jätkuks. Tagasi minemiseks vali tööruumi all **Civil**. CivilCraft mäletab selles arvutis viimati kasutatud tööruumi.

Vasak paneel saab üles kolm jaotist:

- **Taimed**: taimenimekiri, kust otsida ja valida, mida paigutada. Vaata [Taimenimekiri](topic:plant-list).
- **Vertikaalplaneerimise kontrollid**: kalde analüüs, voolunoolted ja veelompimine. Vaata [Vertikaalplaneerimine](topic:landscape-grading).
- **Niisutus**: pihustid ja torud, mis paigutad järgmisena, veevarustuse seaded. Vaata [Niisutus](topic:irrigation).

## Mis on rühmas Haljastus

| Tööriist | Mida see teeb | Teema |
|---|---|---|
| **Taim**, **Istutusala**, **Hekk** | Üksikud taimed, istutusalad, mis täidetakse taimede vahega, hekid joone järgi | [Istutus](topic:planting) |
| **Vertikaalplaneerimine** | Platvormid, vallid, kraavid, vertikaalplaneerimisalad punktkõrguste ja samakõrgusjoontega, kalde ja voolu kontrollid | [Vertikaalplaneerimine](topic:landscape-grading) |
| **Kõvad pinnad** | Sillutis, rajad, seinad, äärekivid, kaldteed ja astmed, mis järgivad maapinda | [Kõvad pinnad](topic:hardscape) |
| **Alad** | Istutatud alad: muru, istutusalad, niidud ja katteaed koos konstruktsiooniga, lõigatud kõvade pindade ümber | [Istutatud alad](topic:planted-areas) |
| **Kõrgused** | Maapinna muutjad järjekorras koos kaevamise ja täitmisega, punktkõrgused, kaldenoolted, lõikejooned | [Maapinna muutjad](topic:ground-modifiers), [Lõiked](topic:landscape-sections) |
| **Niisutus** | Pihustid, torud, ventiilid, tilgutusliinid, toide, katvus ja hüdrauliline kontroll | [Niisutus](topic:irrigation) |
| **Veel** | Joonest (objektid seotud joonestikuga), taimeloend, taimetabel, töölehed, taimede graafika, vabakujulised objektid, haljastuslehed ja väljastuskomplekt, IFC-eksport, taime suurus ja sildid | [Objektid joonestikust](topic:objects-from-lines), [Taimekirjed](topic:plant-records), [Töölehed](topic:worksheets), [Haljastuslehed](topic:landscape-sheets), [Vabakujulised objektid](topic:freeform-objects) |

Kõik, mida lisad, on ühe tagasivõtmise samm, salvestatakse projektifaili ja joonistatakse plaanile kihtidel nimega `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` ja `L-IRRG-…`, nii et ka DXF-, DWG- ja PDF-eksport need kaasavad.

## Üks pind kõige jaoks

Platvormid, vallid, kraavid, vertikaalplaneerimisalad, sillutis ja rajad on planeeritud **projekteeritud pinda**, sama, mida kasutavad koridorid ja alused. **Olemasolev maapind** ei muutu kunagi. Taimed asuvad sellel maapinnal, mis nende all on, nii et nad liiguvad, kui vertikaalplaneerimine muutub. Pinnasetööde arvestus võtab haljastuse vertikaalplaneerimise arvesse koos kõige muuga.

:::tip
Uus selle juures? [Aia kavandamine algusest lõpuni](topic:landscape-walkthrough) käib kogu tööruumist läbi näidisobjekti peal.
:::
