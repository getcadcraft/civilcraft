---
title: Greina GIS-lög
summary: Jaðarsvæði, yfirlögn (skurðpunktur, sameining, eyðing, samruni), rúmfræðileg tenging, val eftir eigindum og mæling á GIS-lögum í verkefni, hvert sem nýtt lag sem hægt er að afturkalla.
keywords: gis, greining, jaðarsvæði, buffer, yfirlögn, skurðpunktur, sameining, eyðing, klippa, samruni, rúmfræðileg tenging, tenging, velja eftir eigind, fyrirspurn, þar sem, segð, tölfræði, flatarmál, lengd, ummál, mæling, lóðir, kvöð, byggingarmörk, shapefile, geopackage, eigindatafla
from: a6b2d3f9
---

Þegar verkefni hefur GIS-lög (sjá [Flytja inn GIS-gögn](topic:gis-import)), opnar hnappurinn **Greina** í GIS-hópnum (skrifaður `GISANALYSIS`, `ANALYZE` eða `BUFFER`) glugga með fimm flipum. Hann helst opinn við hlið grunnmyndarinnar, þannig að það sem þú velur er teiknað á grunnmyndina á meðan þú vinnur.

Sérhvert verkfæri sem býr til eitthvað **bætir við nýju lagi** og skilur lögin sem það las eftir alveg eins og þau voru. Hvert þeirra er eitt skref í afturköllun: {{ui:Afturkalla}} í glugganum (eða Ctrl+Z) fjarlægir nýja lagið. Flyttu út niðurstöðuna eins og hvert annað lag með [Flytja út gögn eins og byggt fyrir GIS](topic:gis-export) sem shapefile, GeoJSON eða GeoPackage.

Öll tafla lags, með röðun, breytingum og reiknivél fyrir reiti, er í [Vinna með eigindatöflu lags](topic:gis-table); litun eftir reit er í [Stíll lags eftir eigind](topic:gis-symbology).

Allt er unnið á grunnmyndinni, í einingum verkefnisins (feet eða meters). Verkefni er alltaf í varpaðu eða staðbundnu hnitakerfi, þannig að fjarlægð 50 þýðir 50 feet eða 50 meters, aldrei gráður. Hæðir (z) eru ekki geymdar í niðurstöðunum.

## Jaðarsvæði

Teiknar svæði í ákveðinni fjarlægð umhverfis sérhvern hlut, sem nýtt marghyrningslag. Punktar verða að hringjum, línur verða að göngum með ávölum endum, marghyrningar stækka. **Neikvæð** fjarlægð minnkar marghyrninga (ferningur 100 x 100 sem minnkaður um 5 verður 90 x 90; minnkaður um 60 er ekkert eftir og glugginn segir það). Taktu fjarlægðina úr talnareit til að gefa hverjum hlut sína eigin, eða hakaðu við **Sameina öll jaðarsvæðin í eitt form** til að leysa þau upp í eitt form.

Ávölu hlutarnir eru beinir bútar teiknaðir innan við raunverulegu bogalínuna, þannig að jaðarsvæði er örlítið minna en nákvæmur hringur: um 0.6 % í flatarmáli við venjulega stillingu, 0.16 % við Fínt. Notaðu Fínt fyrir allt sem þú ætlar að mæla.

## Yfirlögn

| Tól | Það sem þú færð |
|---|---|
| Skurðpunktur | Hlutarnir þar sem inntakslagið mætir yfirlagsmarghyrningunum, hver með reitum beggja. Línur og punktar eru klipptir við marghyrningana. |
| Sameining | Báðum marghyrningalögunum er skorið eftir jöðrum hvors annars: sameiginlegir hlutar bera reiti beggja laga, hinir bera reiti annars lagsins (reitir hins eru tómir). |
| Eyðing | Inntaksmarghyrningarnir með yfirlagsmarghyrningunum teknum út. Reitir haldast hjá inntakinu. Hlut sem er eyddur alveg er sleppt (glugginn telur þá). |
| Samruni | Sameinar marghyrninga sem snertast eða skarast, allir saman eða eitt form fyrir hvert gildi reits. Bætir við `COUNT` og `AREA`. |

Reitanafn sem bæði lögin hafa er geymt fyrir fyrra lagið, en nafn annars lagsins er skrifað með `_2`. Hlutir innan eins lags ættu ekki að skarast: þar sem þeir gera það telur Sameining skörunina í báðum.

## Rúmfræðileg tenging

Rúmfræðileg tenging afritar eigindi úr **upprunalagi** yfir á hvern **markhlut** sem það mætir, og býr til nýtt lag með lögun markhlutarins. Veldu hvenær þau mætast: snerta eða skarast, markhluturinn liggur innan upprunamarghyrnings, markhluturinn hefur upprunahlutinn innan sín, næsti upprunahlutur (með valfrjálsu takmarki) eða sérhver upprunahlutur innan fjarlægðar.

Þegar margir upprunahlutir passa tekurðu eigindi þess fyrsta (þess næsta, fyrir næsta- og fjarlægðartengingar; `DISTANCE` er bætt við), eða **teldu þá og leggðu saman talnareiti þeirra**: `COUNT`, og `SUM_`, `MEAN_`, `MIN_`, `MAX_` fyrir hvern talnareit. Afhakaðu **Halda markhlutum sem fundu enga samsvörun** til að sleppa þeim. Tengdir reitir eru tómir þar sem ekkert passaði, og glugginn telur þá sem vantar samsvörun.

## Velja

Skrifaðu spurningu um eigindin eða lögunina, ýttu á **Velja**, og hlutirnir eru teiknaðir á grunnmyndina með fjölda sínum, töflu og heildarflatarmáli, lengd eða fjölda. Síðan er hægt að gera þá að eigin lagi, þysja að þeim eða hreinsa valið.

| Þú getur skrifað | Dæmi |
|---|---|
| Reit eftir nafni; notaðu "gæsalappir" eða [hornklofa] ef nafnið hefur bil | `VALUE`, `"Lot Number"` |
| Tölur, 'texta', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (texti er óháður hástöfum; í `like` þýðir `%` hvaða runa sem er og `_` einn stafur) | `Notes contains 'corner'` |
| `is null`, `is not null` (tómt gildi telst sem null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` og svigar | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Gildi lögunar `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Spurning sem er ófullkomin eða nefnir reit sem lagið hefur ekki er hafnað með setningu sem segir hvar vandinn er.

## Mæling

Sýnir heildarflatarmál og ummál, lengd eða fjölda lagsins, og **bætir reitum** við það: `AREA` og `PERIMETER` fyrir marghyrninga, `LENGTH` fyrir línur (lengd á grunnmynd), `X` og `Y` fyrir punkta. Reitur sem er þegar til er aldrei skrifaður yfir: nýi reiturinn heitir `AREA_2`. Þetta er eitt skref í afturköllun. **Tölfræði** gefur fjölda, summu, meðaltal, lágmark og hámark talnareits, að vild fyrir hvert gildi annars reits.

:::note
Prófanirnar á bak við þessi verkfæri eru unnar handvirkt í prófuninni (`node bin/test-civilcraft-gisanalysis.mjs`): til dæmis skerast lóðir 100 x 100 undir svæði 100 x 80 í 3,000 plús 3,000, og 100 langa línu sem er jaðarsvæðuð um 10 er 2,000 plús hringur.
:::
