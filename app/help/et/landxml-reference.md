---
title: LandXML: mida loetakse ja kirjutatakse
summary: LandXML 1.2 elemendid ja atribuudid, mida CivilCraft loeb ja kirjutab, element elemendi kaupa, ning kõik, mida ta vahele jätab.
keywords: landxml, xml, cgpoints, pind, tin, murdejooned, piir, trass, coordgeom, profiil, profalign, pvi, paracurve, torustikud, rajatis, toru, planfeatures, planfeature, tunnusjoon, skeem
from: ca3cf359
---

CivilCraft kirjutab LandXML 1.2 ametliku nimeruumi ja skeemi asukohaga. Ta loeb iga faili, mille juurelement on `LandXML`, ning võtab allpool loetletud elemendid nime järgi (nimeruumi eesliited jäetakse arvestamata; versiooni ei kontrollita). Tema XML-lugeja aktsepteerib ainult viit standardset olemit ja numbrilisi märgiviiteid; ta ei lae kunagi DTD-d ega välist faili. Sammude kohta vaata [LandXML-i vahetamine](topic:landxml).

LandXML kirjutab koordinaadid esmalt põhjasuunas: punkt on „N E“ või „N E Z“.

## Kirjutatud

| Element | Mida CivilCraft kirjutab |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, pindalad ruutjalgades, mahud kuupjardides, läbimõõdud tollides) või `Metric` (meeter, ruutmeeter, kuupmeeter, millimeeter) |
| `Project` | `name` = projekti nimi |
| `Application` | nimi CivilCraft, tootja CadCraft |
| `CgPoints` / `CgPoint` | `name` = punkti number, `desc` = kirjeldus, `code` = rühm; tekst „N E Z“ (või „N E“ ilma kõrguseta) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw või ccw, `radius`, `length`, `staStart`, `chord`, `delta` (kraadides), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | olemasolev maapind mööda trassi jaama- ja kõrguspaaridena (`PntList2D`), jagatud seal, kus see pinnast lahkub |
| `Profile` / `ProfAlign` | projekteeritud profiil (nimega „<trass> projekt“): `PVI` otste ja nurkade jaoks, `ParaCurve` koos `length`-iga vertikaalkõverate jaoks |
| `Surfaces` / `Surface` | `name` ja `desc`; esimesena olemasolev maapind, seejärel „Proposed“, kui platvormid või koridorid vertikaalplaneeritakse |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (ainult olemasolev maapind) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (ainult olemasolev maapind, kui seda on) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` koos `id`-ga; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm või sanitary |
| `Struct` | `name`, `elevRim` (kasutatud äär, seatud või pinnalt), `elevSump`; `Center`; `CircStruct` koos `diameter`-iga; `Invert` koos `elev`-iga, `flowDir` in või out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` koos `diameter`-iga |
| `PlanFeatures` / `PlanFeature` | üks iga tunnusjoone kohta: `name`; `CoordGeom` koos `Line`-iga (`length`, `Start`, `End`) ja `Curve`-iga (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` ja `End` kujul „N E Z“, `Center` kujul „N E“); `Feature` `code="CivilCraft"`-ga, koos `Property` kasutuse ja suletusega |

Ei kirjutata: platvormid ja koridorid objektidena (nende tulemus on pind „Proposed“), vigadega trassid, torud ilma mõlema sisepõhjata ja võrgureeglid.

## Loetud

| Element | Mida CivilCraft võtab |
|---|---|
| `Units` | `Imperial` või `Metric` ning nende `linearUnit` otsustavad, kas jalad või meetrid. Tundmatu ühik märgitakse üles. |
| `Project` | `name` saab projekti nimeks. |
| `CgPoints` / `CgPoint` (ka pesastatud) | nimi (või `oID`), „N E“ või „N E Z“, `desc` (või `code`) kirjeldusena |
| `Surface` koos `Definition surfType="TIN"`-ga | `Pnts` ja `Faces` olemasoleva maapinnana (ainult esimene pind); nähtamatud tahud (`i="1"`) jäetakse välja |
| `SourceData` / `Breaklines` | 3D-murdejooned, hoitakse koos pinnaga |
| `SourceData` / `Boundaries` | välispiir |
| `Alignment` / `CoordGeom` | `Line`- ja `Curve`-elemendid; PI-d taastatakse iga kõvera `PI`-st või selle `Center`-ist ja puutujatest; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ja `ParaCurve` (koos `length`-iga); esimene projekteeritud profiil, millel on vähemalt kaks PVI-d |
| `PlanFeatures` / `PlanFeature` | igaüks tunnusjoonena: `Line`, `Curve` (selle `Start`, `Center`, `End` ja `rot`) ning `IrregularLine` (`PntList3D` või `PntList2D`), ühendatud otsast otsa (vahe ühendatakse sirglõiguga ja märgitakse üles); suletud, kui lõpeb seal, kus algas; kasutus ja suletus CivilCrafti enda `Feature`-st, muidu **Ainult joonistatud**. Kõrguseta punktid saavad väärtuse 0 (märgitud). |
| `Spiral` | klotoidsed spiraalid `Curve`-elemendi kõrval (sisse ja välja; loetakse PI-na koos raadiuse ja spiraalide pikkustega, kirjutatakse tagasi koos `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`-iga) |
| `PipeNetwork` | esimene võrk, millel on torud: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` läbimõõt, `Invert` iga toru kohta) ja `Pipe` (`refStart`, `refEnd`, `CircPipe` läbimõõt) |

## Vahele jäetud ja märgitud märkmetes

- Esimesele järgnevad pinnad, ruudustikupinnad ja muud mitte-TIN pinnad
- Trassid, mis sisaldavad elemente `IrregularLine` või `Chain`, klotoidist erinevad spiraalid, spiraal kahe kõvera vahel või trassid ilma geomeetriata
- Esimesele järgnevad projekteeritud profiilid; `CircCurve` ja `UnsymParaCurve` vertikaalkõverad (nende PVI-d jäetakse alles ilma kõverata)
- Punktid, mis viitavad ainult teistele punktidele (`pntRef`), ja punktid ilma loetavate koordinaatideta
- Korduvad punktinimed (esimene jäetakse alles)
- Peidetud, näidatud ja andmeklambriga piirid; murdejooned ilma 3D-punktideta
- Esimesele järgnevad torustikud; muud võrgutüübid kui storm ja sanitary (loetakse stormiks)
- Ristkülik-, sisse- ja väljavoolurajatised (loetakse ümarana); munakujulised, elliptilised ja kastikujulised torud ning kanalid (loetakse ümarate torudena, suuruseta)
- `Spiral`-elemendid tunnusjoonte planeeringus
- `Parcels`, `Roadways`, `GradeModel` ja `Survey`

Failis olevaid maapinna profiile (`ProfSurf`) ei kasutata: CivilCraft võtab maapinna proovid pinnalt endalt.

## Sõnumid, kui fail ei avane

| Sõnum | Tähendus |
|---|---|
| „See on XML, kuid mitte LandXML (juurelement on <…>).“ | Fail on mõni muu XML-tüüp. |
| „… ei sisalda punkte, TIN-pindu ega trasse, mida CivilCraft suudab lugeda.“ | Kõik failis on vahele jäetud loendis. Järgmised märkused ütlevad, mis seal oli. |
| „Lõppsilt ei vasta algussildile …“, „Sulgemata silt …“, „Fail lõpeb …-i sees“ | Fail on rikutud või katkenud. |
