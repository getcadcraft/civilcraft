---
title: LandXML: mitä luetaan ja kirjoitetaan
summary: LandXML 1.2 -elementit ja -attribuutit, joita CivilCraft lukee ja kirjoittaa elementti kerrallaan, sekä kaikki, minkä se ohittaa.
keywords: landxml, xml, cgpoints, pinta, tin, murtoviivat, raja, linjaus, coordgeom, profiili, profalign, pvi, paracurve, pipenetworks, kaivo, putki, planfeatures, planfeature, ominaisuusviiva, skeema
from: ca3cf359
---

CivilCraft kirjoittaa LandXML 1.2 -tiedostoon virallisen nimiavaruuden ja skeeman sijainnin. Se lukee minkä tahansa tiedoston, jonka juurielementti on `LandXML`, ja ottaa alla luetellut elementit nimen perusteella (nimiavaruusetuliitteet ohitetaan, versiota ei tarkisteta). Sen XML-lukija hyväksyy vain viisi vakiomerkkiviittausta ja numeeriset merkkiviittaukset. Se ei lataa koskaan DTD:tä eikä ulkoista tiedostoa. Vaiheet ovat kohdassa [LandXML-vaihto](topic:landxml).

LandXML kirjoittaa koordinaatit ensin pohjoisena: piste on ”N E” tai ”N E Z”.

## Kirjoitettu

| Elementti | Mitä CivilCraft kirjoittaa |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, pinta-alat neliojalkoina, tilavuudet kuutiojaardeina, halkaisijat tuumina) tai `Metric` (meter, neliömetri, kuutiometri, millimetri) |
| `Project` | `name` = projektin nimi |
| `Application` | nimi CivilCraft, valmistaja CadCraft |
| `CgPoints` / `CgPoint` | `name` = pistenumero, `desc` = kuvaus, `code` = ryhmä; teksti ”N E Z” (tai ”N E” ilman korkeutta) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw tai ccw, `radius`, `length`, `staStart`, `chord`, `delta` (asteina), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | olemassa oleva maanpinta linjausta pitkin paalu- ja korkeusparina (`PntList2D`), jaettuna kohdasta, jossa se poistuu pinnalta |
| `Profile` / `ProfAlign` | suunniteltu profiili (nimeltään ”<linjaus> design”): `PVI` päätepisteille ja kulmapisteille, `ParaCurve` attribuutilla `length` pystykaarille |
| `Surfaces` / `Surface` | `name` ja `desc`; ensin nykyinen maanpinta, sitten ”Proposed”, kun alustat tai käytävät tasataan |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (vain nykyinen maanpinta) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (vain nykyinen maanpinta, kun sellainen on) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` tunnuksella `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm tai sanitary |
| `Struct` | `name`, `elevRim` (käytetty reuna, asetettu tai pinnalta), `elevSump`; `Center`; `CircStruct` attribuutilla `diameter`; `Invert` attribuuteilla `elev`, `flowDir` in tai out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` attribuutilla `diameter` |
| `PlanFeatures` / `PlanFeature` | yksi per ominaisuusviiva: `name`; `CoordGeom`, jossa `Line` (`length`, `Start`, `End`) ja `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` ja `End` muodossa ”N E Z”, `Center` muodossa ”N E”); `Feature` `code="CivilCraft"`, jossa käyttö `Property` ja `closed` |

Ei kirjoiteta: alustat ja käytävät kohteina (niiden tulos on ”Proposed”-pinta), virheelliset linjaukset, putket ilman molempia pohjia ja verkkosäännöt.

## Luettu

| Elementti | Mitä CivilCraft ottaa |
|---|---|
| `Units` | `Imperial` tai `Metric` ja niiden `linearUnit` ratkaisevat, ovatko yksiköt jalkoja vai metrejä. Tuntematon yksikkö kirjataan muistiin. |
| `Project` | `name` tulee projektin nimeksi. |
| `CgPoints` / `CgPoint` (myös sisäkkäin) | nimi (tai `oID`), ”N E” tai ”N E Z”, `desc` (tai `code`) kuvaukseksi |
| `Surface`, jossa `Definition surfType="TIN"` | `Pnts` ja `Faces` nykyisenä maanpintana (vain ensimmäinen pinta); näkymättömät pinnat (`i="1"`) jätetään pois |
| `SourceData` / `Breaklines` | 3D-murtoviivat, säilytetään pinnan kanssa |
| `SourceData` / `Boundaries` | ulkoraja |
| `Alignment` / `CoordGeom` | `Line`- ja `Curve`-elementit; PI:t rakennetaan kunkin kaaren `PI`:stä tai sen `Center`- ja tangenttipisteistä; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ja `ParaCurve` (attribuutilla `length`); ensimmäinen suunniteltu profiili, jossa on vähintään kaksi PVI:tä |
| `PlanFeatures` / `PlanFeature` | jokainen ominaisuusviivana: `Line`, `Curve` (sen `Start`, `Center`, `End` ja `rot`) ja `IrregularLine` (`PntList3D` tai `PntList2D`) yhdistettynä päästä päähän (aukko yhdistetään suoralla osuudella ja mainitaan); suljettu, kun se päättyy samaan kohtaan, mistä alkaa; käyttö ja suljettu CivilCraftin omasta `Feature`-elementistä, muuten **Vain piirretty**. Pisteet ilman korkeutta saavat arvon 0 (mainitaan). |
| `Spiral` | klotoidispiraalit `Curve`-kaaren vieressä (sisään ja ulos; luetaan PI:nä, jossa on säde ja spiraalin pituudet, ja kirjoitetaan takaisin `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | ensimmäinen verkko, jossa on putkia: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` `diameter`, `Invert` per putki) ja `Pipe` (`refStart`, `refEnd`, `CircPipe` `diameter`) |

## Ohitettu, ja mainitaan huomautuksissa

- Ensimmäisen jälkeiset pinnat, ruudukkopinnat ja muut kuin TIN-pinnat
- Linjaukset, jotka sisältävät `IrregularLine`- tai `Chain`-elementtejä, muut spiraalit kuin klotoidi, spiraali kahden kaaren välissä tai linjaukset, joilla ei ole geometriaa
- Ensimmäisen jälkeiset suunnitellut profiilit; `CircCurve`- ja `UnsymParaCurve`-pystykaaret (niiden PVI:t säilytetään ilman kaarta)
- Pisteet, jotka viittaavat vain muihin pisteisiin (`pntRef`), ja pisteet ilman luettavia koordinaatteja
- Toistuvat pistenimet (ensimmäinen säilytetään)
- Piilotus-, näyttö- ja tietojen leikkausrajat; murtoviivat ilman 3D-pisteitä
- Ensimmäisen jälkeiset putkiverkot; muut verkkotyypit kuin storm ja sanitary (luetaan storm-tyyppisinä)
- Suorakaiteen-, sisääntulo- ja ulosmenorakenteet (luetaan pyöreinä); munan-, ellipsin- ja laatikkomuotoiset putket ja kanavat (luetaan pyöreinä putkina ilman kokoa)
- `Spiral`-elementit ominaisuusviivoissa
- `Parcels`, `Roadways`, `GradeModel` ja `Survey`

Tiedoston maanpinnan profiileja (`ProfSurf`) ei käytetä: CivilCraft ottaa maanpinnan näytteet itse pinnasta.

## Viestit, kun tiedostoa ei voi avata

| Viesti | Merkitys |
|---|---|
| ”Tämä on XML, mutta ei LandXML (sen juurielementti on <…>).” | Tiedosto on jokin muu XML-tyyppi. |
| ”… ei sisällä pisteitä, TIN-pintoja tai linjauksia, joita CivilCraft voi lukea.” | Kaikki tiedostossa on ohitettujen listalla. Sen jälkeiset huomautukset kertovat, mitä siellä oli. |
| ”Lopputunniste ei vastaa …”, ”Sulkematon tunniste …”, ”Tiedosto päättyy kesken …” | Tiedosto on vioittunut tai katkaistu. |
