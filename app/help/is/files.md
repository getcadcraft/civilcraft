---
title: Skrár sem þú getur opnað, vistað og flutt út
summary: Punktaskrár, LandXML og CivilCraft-verkefni inn; verkefni, LandXML, DXF og PDF út; hvað hver geymir, hvar skrárnar fara og hvað breytist án nettengingar.
keywords: opna, vista, flytja inn, flytja út, skráarsnið, csv, txt, landxml, xml, dxf, pdf, json, sækja, verkefnaskrá
from: 82bff559
---

CivilCraft opnar skrár af tölvunni þinni og vistar með því að sækja skrár aftur á hana. Ekkert er hlaðið upp og ekkert er geymt á þjóni. Sjá einnig [Skrárnar þínar](common:your-files).

## Það sem er opnað

Smelltu á {{ui:Opna}} (eða ýttu á {{key:Mod+O}}) og veldu skrá, eða dragðu skrána úr {{pick:mac=Finder|windows=File Explorer|linux=skráastjórinn þinn}} yfir á grunnmyndina. Ein skrá í einu; skrár yfir 200 MB eru ekki teknar. LandXML- eða verkefnaskrá yfir 32 MB er lesin í bútum af um 4 MB, aldrei sem einn texti; meðan LandXML-skrá opnast má búast við að hún noti um 13 sinnum stærð skrárinnar í minni (69 MB skrá notaði um 0.9 GB í prófun okkar).

| Tegund | Skráarheiti | Hvað gerist |
|---|---|---|
| Punktaskrá | `.csv`, `.txt`, `.pnt`, `.xyz` (hvaða textaskrá sem er) | Glugginn **Flytja inn punkta** opnast. Punktarnir koma í stað punkta verkefnisins; veglínur, undirstöður og pípur haldast. |
| LandXML | `.xml`, `.landxml` | **Nýtt verkefni** er búið til úr skránni (fyrst er spurt ef núverandi verkefni hefur óvistaðar breytingar). |
| CivilCraft-verkefni | `.civilcraft.json` (hvaða `.json`) | Verkefnið opnast eins og það var vistað (fyrst er spurt ef núverandi verkefni hefur óvistaðar breytingar). |

CivilCraft ákvarðar eftir endingu skráarinnar, og síðan eftir fyrstu stöfunum: texti sem byrjar á `{` er lesinn sem verkefni, texti sem byrjar á `<` sem LandXML, annað sem punktaskrá. Skrá sem opnunarglugginn grámerkir má samt sleppa á grunnmyndina.

:::note
Að flytja inn punktaskrá í verkefni sem þegar hefur punkta kemur í staðinn fyrir þá án þess að spyrja, og hreinsar afturköllunarsöguna (að opna hvaða skrá sem er er ný byrjun fyrir afturköllun). Ef yfirborðið kom úr LandXML skiptir innflutningur punkta því yfir í yfirborð byggt á punktunum. Vistaðu fyrst ef þú vilt kannski fá gömlu punktana aftur.
:::

Nánar: [Snið punktaskráa](topic:point-file-formats), [LandXML: hvað er lesið og skrifað](topic:landxml-reference).

## Það sem er vistað

{{ui:Vista}} ({{key:Mod+S}}) skrifar tvær skrár hlið við hlið, nefndar eftir **Heiti** í vinstra spjaldinu: `<heiti>.civilcraft.json`, verkefnið sem þú heldur áfram að breyta, og `<heiti>.ifc`, sömu hönnun sem IFC 4.3 fyrir aðra (sjá [IFC-útflutningur og innflutningur](topic:ifc)). Hvor skrá vísar í hina, og IFC-skráin geymir líka þjappað afrit af verkefninu, þannig að IFC-skrá send ein sér opnast samt að fullu og er hægt að breyta henni.

- **Í Studio** eru báðar skrárnar skrifaðar hlið við hlið, á sama stað.
- **Í Chrome og Edge** biður fyrsta vistunin um möppu og skrifar báðar í hana; síðari vistanir fara í sömu möppu. Hættu við möppuspurninguna til að sækja báðar í staðinn.
- **Í öðrum vöfrum** eru báðar skrárnar sóttar, verkefnaskráin fyrst.

Að opna aðra hvora skrána leitar að hinni. Opnaðu báðar saman (eða dragðu báðar), eða opnaðu aðra: í Studio finnst hin í sömu möppu; í vafra spyr CivilCraft hvort þú viljir bæta henni við, eða halda áfram með þá sem þú hefur. Ef IFC-skránni var breytt af öðru forriti eftir að CivilCraft vistaði hana, eða önnur skráin er eldri en hin, opnast verkefnið frá nýrri hönnuninni og spjaldið Vandamál segir hvað gerðist, með **Vista núna** (skrifar báðar skrárnar aftur) og **Sýna rúmfræði IFC-skráarinnar sem viðmið**. IFC-skrá ein sér, sem annað forrit breytti, opnast frá afriti sínu af verkefninu með því sem enn samsvarar: veglínur sem það breytti taka rúmfræði þess, hlutir sem það eyddi eru skildir eftir, og aðrar breytingar eru skráðar en ekki teknar. Verkefnaskrá frá því fyrir 0.7.1 opnast eins og áður.

Verkefnaskráin geymir:

- hvern punkt (númer, hnit, hæð, lýsingu) og heiti punktaskrárinnar sem þeir komu úr
- stillingar yfirborðs: val á hópum, teiknaðar brotalínur, mörkin, lengstu ytri brún, og TIN lesið úr LandXML
- birtingarstillingar
- veglínur með PI-punktum sínum, radíusum og upphafsstöð, hönnunarsnið þeirra (PVI og lengdir bogra) og stillingar corridor
- lóðir og pípunetið með reglum sínum

Verkefnaskráin geymir ekki afturköllunarsöguna. Yfirborð, hæðarlínur, daylight-línur og rúmmál eru ekki geymd; þau eru endurbyggð úr vistuðu inntakinu þegar verkefnið opnast. Verkefnaskrá frá nýrri CivilCraft-útgáfu er hafnað með skilaboðum sem nefna útgáfuna hennar.

## Það sem er flutt út

| Hnappur | Skrá | Innihald |
|---|---|---|
| {{ui:LandXML}} | `<heiti>.xml` | LandXML 1.2: punktar, núverandi landslag (og mótaða yfirborðið ef það er til) sem TIN-yfirborð, veglínur, landsnið og hönnunarsnið, pípunetið |
| {{ui:DXF}} | `<heiti>.dxf` | R12 DXF af línum grunnmyndarinnar eins og þær birtast, á nefndum lögum |
| {{ui:DWG}} | `<heiti>.dwg` | Sömu línur sem DWG-teikning, í sniðinu sem þú velur (2000 til 2018) |
| {{ui:PDF}} | `<heiti>.pdf` | Vigurútprentun af grunnmyndinni á blaði, í mælikvarða sem þú velur |
| {{ui:GLB}} eða {{ui:OBJ}} (á stikunni í 3D-sýninni) | `<heiti>-3d.glb`, `<heiti>-3d.obj` | Það sem 3D-sýnin sýnir sem þrívíddarlíkan: metrar, Y upp, raunverulegur mælikvarði, um skráðan staðbundinn uppruna |

Hvað hver skilur eftir: [Skiptilíkan LandXML](topic:landxml), [Flytja grunnmyndina út í DXF](topic:dxf-export) (DWG líka), [Prenta grunnmyndina í PDF](topic:plot-pdf), [Flytja svæðið út í 3D](topic:export-3d).

## Hvar skrárnar fara

Vistaðar og útfluttar skrár fara þangað sem vafrinn setur niðurhal, yfirleitt í möppuna Niðurhal. Til að velja möppu í hvert skipti:

:::chromium
Opnaðu **Stillingar** vafrans, síðan **Niðurhal**, og kveiktu á **Spyrja hvar á að vista hverja skrá áður en hún er sótt**.
:::

:::firefox
Opnaðu **Stillingar**, síðan **Almennt**, og undir **Skrár og forrit** veldu **Spyrja alltaf hvar á að vista skrár**.
:::

:::safari
Opnaðu **Safari > Stillingar > Almennt** og stilltu **Staðsetning niðurhals skráa** á **Spyrja við hvert niðurhal**.
:::

Ef þú vistar tvisvar með sama heiti getur vafrinn bætt númeri við seinni skrána, til dæmis `Site (1).civilcraft.json`. Opnaðu þá nýjustu næst.

## Á netinu og án nettengingar

CivilCraft virkar aðeins á tölvunni þinni í hvoru tilviki: opnun les skrána í vafranum, vistun sækir hana. Til að opna CivilCraft án nettengingar skaltu fyrst vista það til notkunar án nettengingar:

1. Meðan þú ert á netinu, smelltu á {{ui:Vista til notkunar án nettengingar}} á forritastikunni efst.
2. Hnappurinn telur upp ("Vista 12 af 30") og sýnir síðan {{ui:Tilbúið án nettengingar}}. CivilCraft er lítið (um 0.6 MB) svo þetta tekur smá stund. Vistaða afritið inniheldur þessa hjálp og sýnishornssvæðið.
3. Án tengingar, opnaðu sömu slóð (eða bókamerki hennar). Allt virkar, þar á meðal {{ui:Opna sýnishornssvæðið}}.

Aðrar stöður hnappsins:

- {{ui:Ekki tókst að vista}}: sumar skrár voru ekki sóttar. Athugaðu tenginguna og smelltu á hnappinn til að reyna aftur.
- {{ui:Notkun án nettengingar er ekki í boði}}: þessi vafragluggi getur ekki geymt afrit án nettengingar (einkagluggar og sumar stýrðar tölvur loka á það). Notaðu venjulegan glugga.

Smelltu á {{ui:Tilbúið án nettengingar}} til að sjá hvenær afritið var vistað, með tveimur valkostum: {{ui:Vista aftur (sækja nýjustu útgáfu)}} og {{ui:Fjarlægja afritið án nettengingar}}. Vistaðu aftur áður en farið er á staðinn svo afritið samsvari nýjustu smíðinni. Meira í [Án nettengingar](common:offline).

:::offline
Þú ert án nettengingar núna. Ef CivilCraft var vistað til notkunar án nettengingar virkar allt, þar á meðal sýnishornssvæðið. Ef ekki, haltu áfram að vinna í þessum flipa, en endurhlaðdu hann ekki fyrr en þú ert kominn aftur á netið; án vistaðs afrits mistekst {{ui:Opna sýnishornssvæðið}} með skilaboðunum "Sýnishornið gat ekki hlaðist".
:::

:::tip
Fyrir vettvangsvinnu, vistaðu CivilCraft til notkunar án nettengingar og færðu punktaskrárnar þínar yfir á fartölvuna sjálfa. Verkefni og útflutningar vistast sem niðurhal án tengingar, svo þú getur flutt inn mælingar dagsins, athugað yfirborðið og vistað verkefnið á staðnum.
:::

Skýjavistun er ekki í boði enn, og skjáborðsútgáfur eru ekki komnar út. Eins og er eru skrárnar sem þú vistar eina eintakið: geymdu þær einhvers staðar sem tekið er öryggisafrit af.

## Viðbætur sem skrá notar

Þegar þú vistar verkefni sem geymir gögn úr viðbót (hökunum um byggingarreglur, eða uppsprettu Address to site), skráir skráin hvaða viðbætur og hvaða útgáfur. Opnaðu hana á tölvu sem hefur ekki viðbótina og stika fyrir ofan grunnmyndina segir það og býður að bæta henni við af lista reikningsins þíns. Skráningin er aðeins athugasemd: skráin opnast hvort sem er.

## Afturkalla úr Studio

Innan CadCraft Studio er hvert skref sem þú klárar í CivilCraft sagt Studio, svo verkefnisstig afturköllunar þess getur tekið til baka síðasta skrefið yfir öpp. Studio afturkallar skref aðeins þegar afturköllunarstafla CivilCraft er nákvæmlega eins og það skref skildi hana eftir; eftir að þú opnar aðra skrá sleppir það þessum glugga.

## Lokun með óvistuðum breytingum

Þegar verkefnið hefur óvistaðar breytingar og þú lokar flipanum, endurhleður eða yfirgefur síðuna, spyr vafrinn hvort þú viljir fara. Orðalag hans og útlit tilheyra vafranum og CivilCraft getur ekki breytt því. {{ui:Nýtt}}, og opnun verkefnis- eða LandXML-skrár, spyrja í staðinn í eigin **Óvistaðar breytingar**-glugga CivilCraft, með {{ui:Hætta við}}, {{ui:Ekki vista}} og {{ui:Vista afrit}}.
