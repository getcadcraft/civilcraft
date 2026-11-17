---
title: Vinna með eigindatöflu lags
summary: Sjáðu alla hluti GIS-lags sem töflu, raðaðu og síaðu hana, veldu raðir og hluti saman, lagfærðu gildi, bættu við reitum, reiknaðu ný gildi og vistaðu töfluna sem CSV.
keywords: eigindatafla, tafla, reitir, dálkar, raðir, röðun, sía, segð, velja, breyta, reiknivél reita, reikna, bæta við reit, endurnefna reit, fjarlægja reit, csv, útflutningur, gis, shapefile, geopackage, táknfræði
from: fd9d6c11
---

Opnaðu töflu lags úr valmyndinni með **þremur punktum** í lagalistanum **GIS-lög** ({{ui:Eigindatafla…}}), úr Yfirborð › Meira › {{ui:Eigindatafla}}, eða með því að skrifa `ATTRIBUTES`, `ATTTABLE` eða `TABLE`. Taflan opnast við hlið grunnmyndarinnar og helst opin á meðan þú vinnur. Aðeins þær raðir sem þú sérð eru teiknaðar, þannig að lag með þúsundum hluta opnast og flettist hratt.

## Raða, sía og velja

- **Röðun:** smelltu á dálkstitil. Annar smellur snýr henni við, þriðji skilar upprunalegri röð skrárinnar. Tóm gildi halda sér alltaf neðst. Röðun breytir aðeins því sem þú sérð, aldrei laginu.
- **Sía:** skrifaðu í síureitinn. Segð eins og `AREA > 500 and USE = 'Res'` heldur þeim röðum þar sem hún er sönn (sömu orð og á flipanum Velja í [Greina GIS-lög](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Allt sem er ekki segð, eins og `oak maple`, leitar að þeim orðum í öllum dálkum.
- **Velja raðir:** smelltu á röð. Ctrl+smellur bætir einni við eða fjarlægir hana, Shift+smellur velur runu, og {{ui:Velja sýndar línur}} tekur allar raðir sem standast síuna. Völdu hlutirnir eru teiknaðir á grunnmyndina, og smellur á hlut á grunnmyndinni velur röðina hér.

Þegar raðir eru valdar geturðu {{ui:Aðdráttur}} að þeim, búið til **lag úr valinu**, og lesið heildarflatarmál eða lengd í stöðulínunni.

## Lagfæra gildi

Tvísmelltu á reit (eða færðu þig þangað með örvatökkunum og ýttu á Enter), skrifaðu nýja gildið og ýttu á Enter. Escape skilur það eftir eins og það var. Gildi verður að passa í dálkinn: tölur sem tölur, dagsetningar sem `YYYY-MM-DD`, já/nei sem yes, no, true eða false. Gildi sem passar ekki er hafnað með setningu og engu breytist. Tómur reitur gerir gildið tómt. Sérhver breyting er eitt skref í afturköllun: {{ui:Afturkalla}} og {{ui:Endurgera}} eru neðst í töflunni, og Ctrl+Z virkar á grunnmyndinni.

## Reitir

Undir **Reitir** geturðu bætt við reit (texta, tölu, dagsetningu eða já/nei), endurnefnt einn eða fjarlægt einn. Nýr reitur byrjar tómur. Endurnefning fylgir með: merkimiðareiturinn og [stíll eftir eigind](topic:gis-symbology) lagsins færast yfir á nýja nafnið, og fjarlæging reits fjarlægir merkimiðann og stílinn sem notaði hann. Hvert er eitt skref í afturköllun sem skilar öllu aftur.

## Reiknivél reita

Skrifar gildi í sérhverja röð (eða aðeins valdar raðir) út frá öðrum reitum raðarinnar, rúmfræði hennar og nokkrum föllum. Veldu reit sem er til eða **Nýr reitur…** og gefðu honum nafn og gerð. Ekkert er keyrt sem kóði: segðin er lesin af litlum þáttara með föstum lista falla.

| Hópur | Orð |
|---|---|
| Tölur | `+ - * /`, svigar, `abs round(x, digits) floor ceil sqrt pow min max` |
| Texti | `upper lower trim len substr(text, from, count) left right replace concat` (texti fer í 'einfaldar gæsalappir'; reitanafn með bilum fer í "tvöfaldar gæsalappir" eða [hornklofa]) |
| Val | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Dagsetningar | `year month day` af gildi `YYYY-MM-DD` |
| Rúmfræði | `$area $perimeter $length $x $y $vertices`, í einingum verkefnisins |

Niðurstaða sem ekki er hægt að geyma í gerð reitsins (texti í talnareit) er höfð tóm og talin í skilaboðunum. Deiling með núlli gefur tómt gildi. Til dæmis skrifar `round($area / 43560, 2)` acres út frá square feet.

## Útflutningur

{{ui:Flytja út CSV}} vistar raðirnar sem þú sérð (eftir síun og röðun) sem UTF-8 CSV-skrá með reitanöfnum í fyrstu línu. Texti sem byrjar á `=`, `+`, `-` eða `@` fær einfalda gæsalöpp (') fremst svo töflureiknir keyri hann ekki sem formúlu. Til að vista lagið sjálft, notaðu [Flytja út gögn eins og byggt fyrir GIS](topic:gis-export).

## Takmarkanir

Taflan sýnir lagið í einni röðun og einni síu í einu. Ekki er hægt að bæta við eða eyða röðum hér (búðu til nýtt lag úr valinu í staðinn), rúmfræði er ekki breytt, og gerð reits er ekki hægt að breyta eftir að hann er búinn til.
