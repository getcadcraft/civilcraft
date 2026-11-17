---
title: LandXML: kas nuskaitoma ir įrašoma
summary: LandXML 1.2 elementai ir atributai, kuriuos CivilCraft nuskaito ir įrašo, elementas po elemento, ir viskas, ką jis praleidžia.
keywords: landxml, xml, cgpoints, paviršius, tin, lūžio linijos, riba, trasa, coordgeom, profilis, profalign, pvi, paracurve, pipenetworks, struct, vamzdis, planfeatures, planfeature, charakteringoji linija, schema
from: ca3cf359
---

CivilCraft įrašo LandXML 1.2 su oficialia vardų sritimi ir schemos vieta. Jis nuskaito bet kurį failą, kurio šakninis elementas yra `LandXML`, ir paima žemiau nurodytus elementus pagal pavadinimą (vardų srities prefiksai ignoruojami; versija netikrinama). Jo XML skaitiklis priima tik penkias standartines esybes ir skaitines simbolių nuorodas; jis niekada neįkelia DTD ar išorinio failo. Žingsnius žr. [LandXML keitimas](topic:landxml).

LandXML koordinates rašo pirmiausia šiaurę: taškas yra „N E“ arba „N E Z“.

## Įrašoma

| Elementas | Ką įrašo CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, plotai kvadratinėmis pėdomis, tūriai kubiniais jardais, skersmenys coliais) arba `Metric` (metras, kvadratinis metras, kubinis metras, milimetras) |
| `Project` | `name` = projekto pavadinimas |
| `Application` | pavadinimas CivilCraft, gamintojas CadCraft |
| `CgPoints` / `CgPoint` | `name` = taško numeris, `desc` = aprašymas, `code` = grupė; tekstas „N E Z“ (arba „N E“ be aukščio) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw arba ccw, `radius`, `length`, `staStart`, `chord`, `delta` (laipsniais), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | esamas gruntas palei trasą kaip stoties ir aukščio poros (`PntList2D`), padalintas ten, kur jis išeina iš paviršiaus |
| `Profile` / `ProfAlign` | projektinis profilis (pavadintas „<trasa> design“): `PVI` galams ir kampiniams taškams, `ParaCurve` su `length` vertikalioms kreivėms |
| `Surfaces` / `Surface` | `name` ir `desc`; pirmiausia esamas gruntas, tada „Proposed“, kai aikštelės arba koridoriai formuoja gruntą |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (tik esamas gruntas) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (tik esamas gruntas, kai jis yra) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` su `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm arba sanitary |
| `Struct` | `name`, `elevRim` (naudojamas kraštas, nustatytas arba paimtas iš paviršiaus), `elevSump`; `Center`; `CircStruct` su `diameter`; `Invert` su `elev`, `flowDir` in arba out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` su `diameter` |
| `PlanFeatures` / `PlanFeature` | po vieną kiekvienai charakteringajai linijai: `name`; `CoordGeom` su `Line` (`length`, `Start`, `End`) ir `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` ir `End` kaip „N E Z“, `Center` kaip „N E“); `Feature` `code="CivilCraft"` su `Property` use ir closed |

Neįrašoma: aikštelės ir koridoriai kaip objektai (jų rezultatas yra „Proposed“ paviršius), trasos su klaidomis, vamzdžiai be abiejų invertų, tinklo taisyklės.

## Nuskaitoma

| Elementas | Ką paima CivilCraft |
|---|---|
| `Units` | `Imperial` arba `Metric` ir jo `linearUnit` nusprendžia, ar tai pėdos, ar metrai. Nežinomas vienetas pažymimas. |
| `Project` | `name` tampa projekto pavadinimu. |
| `CgPoints` / `CgPoint` (ir įdėti) | pavadinimas (arba `oID`), „N E“ arba „N E Z“, `desc` (arba `code`) kaip aprašymas |
| `Surface` su `Definition surfType="TIN"` | `Pnts` ir `Faces` kaip esamas gruntas (tik pirmas paviršius); nematomi paviršiai (`i="1"`) praleidžiami |
| `SourceData` / `Breaklines` | 3D lūžio linijos, išsaugomos su paviršiumi |
| `SourceData` / `Boundaries` | išorinė riba |
| `Alignment` / `CoordGeom` | `Line` ir `Curve` elementai; PI atkuriami iš kiekvienos kreivės `PI` arba iš jos `Center` ir liestinių; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ir `ParaCurve` (su `length`); pirmas projektinis profilis su bent dviem PVI |
| `PlanFeatures` / `PlanFeature` | kiekvienas kaip charakteringoji linija: `Line`, `Curve` (jos `Start`, `Center`, `End` ir `rot`) ir `IrregularLine` (`PntList3D` arba `PntList2D`), sujungti galas į galą (tarpas sujungiamas tiesiu segmentu ir pažymimas); uždaryta, kai baigiasi ten, kur prasidėjo; naudojimas ir uždarymas iš CivilCraft savo `Feature`, kitaip **Tik nubraižyta**. Taškai be aukščio gauna 0 (pažymima). |
| `Spiral` | klotoidinės spiralės šalia `Curve` (įėjime ir išėjime; nuskaitomos kaip PI su spinduliu ir spiralių ilgiais, vėl įrašomos su `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | pirmas tinklas, turintis vamzdžių: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` skersmuo, `Invert` kiekvienam vamzdžiui) ir `Pipe` (`refStart`, `refEnd`, `CircPipe` skersmuo) |

## Praleidžiama ir nurodoma pastabose

- Paviršiai po pirmojo, tinklelio paviršiai ir kiti ne TIN paviršiai
- Trasos, turinčios `IrregularLine` ar `Chain` elementų, spiralės, kitos nei klotoidinės, spiralė tarp dviejų kreivių arba trasos be geometrijos
- Projektiniai profiliai po pirmojo; `CircCurve` ir `UnsymParaCurve` vertikaliosios kreivės (jų PVI išlaikomi be kreivės)
- Taškai, kurie tik nurodo kitus taškus (`pntRef`), ir taškai be nuskaitomų koordinatų
- Pasikartojantys taškų pavadinimai (išlaikomas pirmasis)
- Paslėptos, rodomos ir duomenų apkirpimo ribos; lūžio linijos be 3D taškų
- Vamzdynų tinklai po pirmojo; tinklų tipai, kiti nei storm ir sanitary (nuskaitomi kaip storm)
- Stačiakampės, įtekėjimo ir ištekėjimo konstrukcijos (nuskaitomos kaip apvalios); ovalūs, elipsiniai ir dėžiniai vamzdžiai bei kanalai (nuskaitomi kaip apvalūs vamzdžiai be dydžio)
- `Spiral` elementai charakteringosiose linijose
- `Parcels`, `Roadways`, `GradeModel` ir `Survey`

Grunto profiliai (`ProfSurf`) faile nenaudojami: CivilCraft grunto reikšmes ima tiesiai iš paviršiaus.

## Pranešimai, kai failas neatsidaro

| Pranešimas | Reikšmė |
|---|---|
| „Tai XML, bet ne LandXML (jo šakninis elementas yra <…>).“ | Failas yra kitokio tipo XML. |
| „… neturi taškų, TIN paviršių ar trasų, kurias CivilCraft gali nuskaityti.“ | Visas failo turinys yra praleidžiamų sąraše. Po pranešimo esančios pastabos nurodo, kas ten buvo. |
| „Neatitinkanti uždaromoji žymė …“, „Neuždaryta žymė …“, „Failas baigiasi elemento … viduje“ | Failas sugadintas arba nukirstas. |
