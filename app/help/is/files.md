---
title: Skrár sem þú getur opnað, vistað og flutt út
summary: Punktaskrár, LandXML og CivilCraft-verkefni inn; verkefni, LandXML, DXF og PDF út; hvað hver skrá geymir, hvar skrárnar lenda og hvað breytist án nettengingar.
keywords: opna, vista, flytja út, flytja inn, skráarsnið, csv, txt, landxml, xml, dxf, pdf, json, sækja, verkefnaskrá
from: a7debb61
---

CivilCraft opnar skrár af tölvunni þinni og vistar með því að sækja skrárnar aftur í hana. Ekkert er sent upp og ekkert er geymt á þjóni. Sjá einnig [Skrárnar þínar](common:your-files).

## Hvað það opnar

Smelltu á {{ui:Opna}} (eða ýttu á {{key:Mod+O}}) og veldu skrá, eða dragðu skrána úr {{pick:mac=Finder|windows=Skráarkönnuður|linux=skráastjóranum þínum}} yfir grunnmyndina. Ein skrá í einu; skrár yfir 200 MB eru ekki teknar.

| Tegund | Skráarheiti | Hvað gerist |
|---|---|---|
| Punktaskrá | `.csv`, `.txt`, `.pnt`, `.xyz` (hvaða textaskrá sem er) | Gluggi **Flytja inn punkta** opnast. Punktarnir koma í stað punkta verkefnisins; veglínur, pallar og pípur haldast. |
| LandXML | `.xml`, `.landxml` | Búið er til **nýtt verkefni** úr skránni (spurt er fyrst ef núverandi verkefni hefur óvistaðar breytingar). |
| CivilCraft-verkefni | `.civilcraft.json` (hvaða `.json`) | Verkefnið opnast eins og það var vistað (spurt er fyrst ef núverandi verkefni hefur óvistaðar breytingar). |

CivilCraft ákveður eftir endingu skráarinnar, og síðan eftir fyrstu stöfunum: texti sem byrjar á `{` er lesinn sem verkefni, texti sem byrjar á `<` sem LandXML, og annað sem punktaskrá. Skrá sem opnunarglugginn sýnir í gráu má samt draga yfir grunnmyndina.

:::note
Þegar punktaskrá er flutt inn í verkefni sem þegar hefur punkta koma nýju punktarnir í staðinn án þess að spurt sé, og afturköllunarsagan hreinsast (það að opna hvaða skrá sem er er nýbyrjun fyrir afturköllun). Ef yfirborðið kom úr LandXML, skiptir innflutningur punkta því aftur yfir í yfirborð byggt á punktunum. Vistaðu fyrst ef þú gætir viljað fá gömlu punktana aftur.
:::

Nánar: [Snið punktaskráa](topic:point-file-formats), [LandXML: hvað er lesið og skrifað](topic:landxml-reference).

## Hvað það vistar

{{ui:Vista}} ({{key:Mod+S}}) skrifar tvær skrár hlið við hlið, nefndar eftir **Heiti** í vinstra spjaldinu: `<name>.civilcraft.json`, verkefnið sem þú heldur áfram að breyta, og `<name>.ifc`, sama hönnun sem IFC 4.3 fyrir alla aðra (sjá [IFC-útflutningur og -innflutningur](topic:ifc)). Hvor skrá vísar í hina, og IFC-skráin geymir einnig þjappað afrit af verkefninu, þannig að IFC-skrá sem er send ein og sér opnast samt aftur með fullri breytingarheimild.

- **Í Studio** eru báðar skrárnar skrifaðar hlið við hlið, á sama stað.
- **Í Chrome og Edge** spyr fyrsta vistun um möppu og skrifar báðar í hana; síðari vistanir fara í sömu möppu. Hættu við spurninguna um möppuna til að sækja báðar í staðinn.
- **Í öðrum vöfrum** eru báðar skrárnar sóttar, verkefnaskráin fyrst.

Þegar opnuð er önnur hvor skráin er leitað að hinni. Opnaðu báðar saman (eða dragðu báðar), eða opnaðu aðra: í Studio finnst hin í sömu möppu; í vafra spyr CivilCraft hvort þú viljir bæta henni við, eða halda áfram með þá sem þú hefur. Ef IFC-skránni var breytt af öðru forriti eftir að CivilCraft vistaði hana, eða önnur skráin er eldri en hin, opnast verkefnið úr nýrri hönnuninni og Vandamálaspjaldið segir hvað gerðist, með **Vista núna** (skrifar báðar skrárnar aftur) og **Sýna rúmfræði IFC-skrárinnar til viðmiðunar**. IFC-skrá ein og sér, sem annað forrit breytti, opnast úr eigin afriti af verkefninu með því sem enn stemmir: veglínur sem það breytti taka rúmfræði þess, hlutir sem það fjarlægði eru skildir eftir, og aðrar breytingar þess eru skráðar en ekki teknar upp. Verkefnaskrá frá því fyrir 0.7.1 opnast eins og áður.

Verkefnaskráin geymir:

- sérhvern punkt (númer, hnit, hæð, lýsingu) og heiti punktaskrárinnar sem þeir komu úr
- stillingar yfirborðsins: val á hópum, teiknaðar brotlínur, mörkin, lengsta ytri jaðarinn og TIN lesið úr LandXML
- birtingarstillingarnar
- veglínur með PI-punktum, radíusum og upphafsstöð, hönnunarlangsnið þeirra (PVI og bogalengdir) og stillingar vegarbeltis
- palla og pípunetið með reglum sínum

Afturköllunarsagan er ekki geymd. Yfirborð, hæðarlínur, skurðlínur og rúmmál eru ekki geymd; þau eru byggð aftur úr vistuðu inntakinu þegar verkefnið opnast. Verkefnaskrá frá nýrri útgáfu CivilCraft er hafnað með skilaboðum sem nefna útgáfuna.

## Hvað það flytur út

| Hnappur | Skrá | Innihald |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punktar, núverandi land (og mótaða yfirborðið þegar það er til) sem TIN-yfirborð, veglínur, land- og hönnunarlangsnið, pípunetið |
| {{ui:DXF}} | `<name>.dxf` | R12 DXF af línuteikningu grunnmyndarinnar eins og hún birtist, á nefndum lögum |
| {{ui:DWG}} | `<name>.dwg` | Sama línuteikning sem DWG-teikning, á því sniði sem þú velur (2000 til 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vektorprentun af grunnmyndinni á blað, í mælikvarða sem þú velur |
| {{ui:GLB}} eða {{ui:OBJ}} (á stiku þrívíddarsýnarinnar) | `<name>-3d.glb`, `<name>-3d.obj` | Það sem þrívíddarsýnin sýnir sem þrívíddarlíkan: metrar, Y upp, rétt mælikvarði, miðað við skráðan staðaruppruna |

Hvað hver og ein skilur eftir: [LandXML til skipta](topic:landxml), [Flytja grunnmynd út í DXF](topic:dxf-export) (DWG líka), [Prenta grunnmynd í PDF](topic:plot-pdf), [Flytja svæði út í þrívídd](topic:export-3d).

## Hvert skrárnar fara

Vistaðar og útfluttar skrár fara þangað sem vafrinn setur niðurhöl, venjulega í möppuna Niðurhal. Til að velja möppu í hvert skipti:

:::chromium
Opnaðu **Stillingar** vafrans, síðan **Niðurhal**, og kveiktu á **Spyrja hvar eigi að vista hverja skrá áður en hún er sótt**.
:::

:::firefox
Opnaðu **Stillingar**, síðan **Almennt**, og undir **Skrár og forrit** veldu **Spyrja alltaf hvar eigi að vista skrár**.
:::

:::safari
Opnaðu **Safari > Stillingar > Almennt** og stilltu **Staðsetning niðurhals** á **Spyrja við hvert niðurhal**.
:::

Ef þú vistar tvisvar undir sama heiti gæti vafrinn bætt tölu við seinni skrána, til dæmis `Site (1).civilcraft.json`. Opnaðu þá nýjustu næst.

## Á netinu og án nettengingar

CivilCraft vinnur hvort sem er aðeins í tölvunni þinni: opnun les skrána í vafranum, vistun sækir hana. Til að opna CivilCraft án nokkurrar tengingar skaltu fyrst vista það til notkunar án nettengingar:

1. Meðan þú ert á netinu, smelltu á {{ui:Vista til notkunar án nettengingar}} í forritastikunni efst.
2. Hnappurinn telur upp („Vistar 12 af 30“) og sýnir síðan {{ui:Tilbúið án nettengingar}}. CivilCraft er lítið (um 0.6 MB), þannig að þetta tekur smá stund. Vistaða afritið inniheldur þessa hjálp og sýnishornssvæðið.
3. Án nettengingar skaltu opna sömu vefslóð (eða bókamerki hennar). Allt virkar, þar á meðal {{ui:Opna sýnishornssvæði}}.

Hnappurinn hefur önnur ástönd:

- {{ui:Ekki tókst að vista}}: sumar skrár voru ekki sóttar. Athugaðu tenginguna og smelltu aftur til að reyna aftur.
- {{ui:Notkun án nettengingar er ekki í boði}}: þessi vafragluggi getur ekki geymt afrit án nettengingar (einkagluggar og sumar stýrðar tölvur loka á það). Notaðu venjulegan glugga.

Smelltu á {{ui:Tilbúið án nettengingar}} til að sjá hvenær afritið var vistað, með tveimur valkostum: {{ui:Vista aftur (sækja nýjustu útgáfu)}} og {{ui:Fjarlægja afritið án nettengingar}}. Vistaðu aftur áður en farið er á staðinn svo afritið passi við nýjustu útgáfuna. Nánar í [Án nettengingar](common:offline).

:::offline
Þú ert án nettengingar núna. Ef CivilCraft var vistað til notkunar án nettengingar virkar allt, þar á meðal sýnishornssvæðið. Ef ekki, haltu áfram að vinna í þessum flipa, en endurhladdu hann ekki fyrr en þú ert aftur á netinu; án vistaðs afrits mistekst {{ui:Opna sýnishornssvæði}} með skilaboðunum „Ekki tókst að hlaða sýnishorninu“.
:::

:::tip
Fyrir notkun í vettvangsferð skaltu vista CivilCraft til notkunar án nettengingar og hafa punktaskrárnar á fartölvunni sjálfri. Verkefni og útflutningur vistast sem niðurhöl án tengingar, þannig að þú getur flutt inn mælingar dagsins, yfirfarið yfirborðið og vistað verkefnið á staðnum.
:::

Skýjavistun er ekki í boði enn, og skjáborðsútgáfur eru ekki komnar út enn. Eins og er eru skrárnar sem þú vistar eina afritið: geymdu þær þar sem tekið er afrit af þeim.

## Viðbætur sem skrá notar

Þegar þú vistar verkefni sem geymir gögn úr viðbót (hakanna fyrir byggingarreglugerð, eða uppsprettu heimilisfangs á lóð), skráir skráin hvaða viðbætur og hvaða útgáfur. Opnaðu hana á tölvu sem hefur ekki viðbótina og stika fyrir ofan grunnmyndina segir það og býður að bæta henni við af lista aðgangsins þíns. Skráningin er aðeins athugasemd: skráin opnast hvort sem er.

## Afturkalla úr Studio

Inni í CadCraft Studio er hverju skrefi sem þú lýkur í CivilCraft tilkynnt til Studio, þannig að afturköllun verkefnisins þar getur tekið síðasta skrefið til baka yfir öll forrit. Studio afturkallar skref aðeins þegar afturköllunarstafli CivilCraft er nákvæmlega eins og það skref skildi hann eftir; eftir að þú opnar aðra skrá sleppir hann þessum glugga.

## Lokun með óvistuðum breytingum

Þegar verkefnið hefur óvistaðar breytingar og þú lokar flipanum, endurhleður síðuna eða yfirgefur hana, spyr vafrinn hvort þú viljir fara. Orðalag hans og útlit tilheyra vafranum og CivilCraft getur ekki breytt því. {{ui:Nýtt}}, og opnun verkefnis eða LandXML-skrár, spyrja í staðinn í eigin glugga CivilCraft, **Óvistaðar breytingar**, með {{ui:Hætta við}}, {{ui:Ekki vista}} og {{ui:Vista afrit}}.
