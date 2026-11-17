---
title: Suriin ang mga GIS layer
summary: Buffer, overlay (intersect, union, erase, dissolve), spatial join, piliin ayon sa attribute, at sukatin ang mga GIS layer sa isang project, bawat isa bilang bagong layer na maaari mong i-undo.
keywords: gis, analysis, buffer, overlay, intersect, union, erase, clip, dissolve, spatial join, join, piliin ayon sa attribute, query, where, expression, statistics, lawak, haba, perimeter, sukatin, parcels, easement, setback, shapefile, geopackage, attribute table
from: a6b2d3f9
---

Kapag may GIS layers na ang project (tingnan ang [I-import ang datos ng GIS](topic:gis-import)), ang button na **Analyze** sa GIS group (tina-type bilang `GISANALYSIS`, `ANALYZE` o `BUFFER`) ay magbubukas ng panel na may limang tab. Nananatili itong bukas sa tabi ng plano, kaya ang piliin mo ay iginuguhit sa plano habang nagtatrabaho ka.

Ang bawat tool na gumagawa ng isang bagay ay **nagdadagdag ng bagong layer** at iniiwan ang mga layer na binasa nito nang eksaktong gaya ng dati. Bawat isa ay isang undo step: ang {{ui:Undo}} sa panel (o Ctrl+Z) ang nag-aalis ng bagong layer. I-export ang resulta na gaya ng anumang layer gamit ang [I-export ang as-built data para sa GIS](topic:gis-export) bilang shapefile, GeoJSON o GeoPackage.

Ang buong table ng isang layer, kasama ang sorting, pag-edit at field calculator, ay nasa [Gamitin ang attribute table ng layer](topic:gis-table); ang pagkulay ayon sa field ay nasa [I-style ang layer ayon sa attribute](topic:gis-symbology).

Lahat ay ginagawa sa plano, sa mga unit ng project (feet o meters). Ang project ay palaging nasa projected o local na sistema, kaya ang distansyang 50 ay nangangahulugang 50 feet o 50 meters, hindi kailanman degrees. Hindi itinatabi sa mga resulta ang mga taas (z).

## Buffer

Gumuguhit ng zone na may itinakdang distansya sa palibot ng bawat feature, bilang bagong polygon layer. Ang mga punto ay nagiging bilog, ang mga linya ay nagiging corridor na may bilugang dulo, at lumalaki ang mga polygon. Ang **negatibong** distansya ay nagpapaliit ng polygon (ang parisukat na 100 by 100 na pinaliit ng 5 ay magiging 90 by 90; kapag pinaliit ng 60 ay wala nang matitira, at sinasabi ito ng panel). Kunin ang distansya mula sa number field para bigyan ng sarili nitong distansya ang bawat feature, o lagyan ng check ang **Pagsamahin ang lahat ng buffer sa isang hugis** para pagsamahin ang mga ito.

Ang mga bilugang bahagi ay binubuo ng tuwid na piraso na iginuhit sa loob ng totoong kurba, kaya ang buffer ay bahagyang mas maliit kaysa sa eksaktong bilog: mga 0.6 % sa lawak sa normal na setting, 0.16 % sa Fine. Gamitin ang Fine para sa anumang susukatin mo.

## Overlay

| Tool | Makukuha mo |
|---|---|
| Intersect | Ang mga piraso kung saan nagtatagpo ang input layer at ang overlay polygon, bawat isa ay may field ng dalawa. Ang mga linya at punto ay pinuputol sa loob ng mga polygon. |
| Union | Pinuputol ang dalawang polygon layer sa kahabaan ng gilid ng isa't isa: ang mga magkasalong piraso ay may field ng parehong layer, at ang natitira ay may field ng isang layer lamang (walang laman ang field ng isa). |
| Erase | Ang input polygon na tinanggal ang overlay polygon. Nananatili sa input ang mga field. Ang feature na ganap na nabura ay hindi isinasama (binibilang ito ng panel). |
| Dissolve | Pinagsasama ang mga polygon na nagdidikit o nagsasapawan, lahat sila o isang hugis para sa bawat value ng field. Nagdaragdag ng `COUNT` at `AREA`. |

Ang pangalan ng field na mayroon ang parehong layer ay pinananatili para sa unang layer, at ang sa ikalawang layer ay isinusulat na may `_2`. Ang mga feature sa loob ng iisang layer ay hindi dapat magsapawan: kapag nagsapawan sila, binibilang ng Union ang sapaw sa dalawa.

## Join

Kinokopya ng spatial join ang mga attribute mula sa **source** layer papunta sa bawat **target** feature na nagtatagpo rito, at nagbibigay ng bagong layer na may hugis ng target. Piliin kung kailan sila nagtatagpo: nagdidikit o nagsasapawan, ang target ay nasa loob ng source polygon, ang target ay naglalaman ng source feature, ang pinakamalapit na source feature (na may opsyonal na limit), o alinmang source feature sa loob ng isang distansya.

Kapag maraming source feature ang tumugma, kukunin mo ang attribute ng una (ang pinakamalapit, para sa nearest at distance join; idinadagdag ang `DISTANCE`), o **bilangin ang mga ito at i-total ang kanilang number field**: `COUNT`, at `SUM_`, `MEAN_`, `MIN_`, `MAX_` para sa bawat number field. Alisin ang check sa **Keep target features that found no match** para hindi isama ang mga ito. Walang laman ang mga naidugtong na field kung saan walang tumugma, at binibilang ng panel ang mga hindi tumugma.

## Piliin

I-type ang tanong tungkol sa mga attribute o sa hugis, pindutin ang **Piliin**, at iginuguhit sa plano ang mga feature kasama ang bilang nito, isang table, at ang kabuuang lawak, haba o bilang. Pagkatapos, gawin silang sariling layer, i-zoom sila, o burahin ang pagpili.

| Maaari mong isulat | Halimbawa |
|---|---|
| Field sa pangalan nito; gamitin ang "quotes" o [brackets] kung may espasyo ang pangalan | `VALUE`, `"Lot Number"` |
| Mga numero, 'teksto', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (hindi pinapansin ng teksto ang case; sa `like`, ang `%` ay anumang sunod-sunod na karakter at ang `_` ay isang letra) | `Notes contains 'corner'` |
| `is null`, `is not null` (ang walang lamang value ay itinuturing na null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` at mga bracket | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Mga value ng hugis `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Ang tanong na kulang o tumutukoy sa field na wala sa layer ay tinatanggihan na may pangungusap na nagsasabi kung saan ang problema.

## Sukatin

Ipinapakita ang kabuuang lawak at perimeter, haba o bilang ng layer, at **nagdadagdag ng field** dito: `AREA` at `PERIMETER` para sa polygon, `LENGTH` para sa mga linya (haba sa plano), `X` at `Y` para sa mga punto. Hindi kailanman pinapalitan ang field na umiiral na: ang bago ay tatawaging `AREA_2`. Isa itong undo step. Ang **Statistics** ay nagbibigay ng bilang, sum, mean, minimum at maximum ng isang number field, opsyonal para sa bawat value ng ibang field.

:::note
Ang mga pagsusuri sa likod ng mga tool na ito ay ginagawa nang manwal sa test (`node bin/test-civilcraft-gisanalysis.mjs`): halimbawa, ang parcels na 100 by 100 sa ilalim ng zone na 100 by 80 ay nagsasalubong ng 3,000 plus 3,000, at ang linyang 100 ang haba na binuffer ng 10 ay 2,000 plus isang bilog.
:::
