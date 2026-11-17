---
title: Gamitin ang attribute table ng layer
summary: Tingnan ang bawat feature ng GIS layer bilang table, i-sort at i-filter ito, pumili ng mga row at feature nang sabay, ayusin ang mga value, magdagdag ng field, kalkulahin ang bagong value, at i-save ang table bilang CSV.
keywords: attribute table, table, field, column, row, ayusin, filter, expression, piliin, i-edit, field calculator, kalkulahin, magdagdag ng field, palitan ang pangalan ng field, alisin ang field, csv, i-export, gis, shapefile, geopackage, symbology
from: fd9d6c11
---

Buksan ang table ng layer mula sa menu na **tatlong tuldok** sa listahan ng GIS layers ({{ui:Attribute table…}}), mula sa Surface › More › {{ui:Attribute table}}, o sa pag-type ng `ATTRIBUTES`, `ATTTABLE` o `TABLE`. Bumubukas ang table sa tabi ng plano at nananatiling bukas habang nagtatrabaho ka. Ang mga row lang na nakikita mo ang iginuguhit, kaya mabilis bumukas at mag-scroll ang layer na may libu-libong feature.

## Ayusin, i-filter at pumili

- **Sort:** i-click ang pamagat ng column. Ang pangalawang click ay binabaligtad ito, ang pangatlo ay ibinabalik ang orihinal na ayos ng file. Laging nasa ibaba ang mga walang lamang value. Ang pag-sort ay nagbabago lang ng nakikita mo, hindi kailanman ang layer.
- **Filter:** mag-type sa filter box. Ang expression tulad ng `AREA > 500 and USE = 'Res'` ay nagpapanatili ng mga row kung saan ito totoo (ang parehong salita ng Select tab ng [Suriin ang mga GIS layer](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Ang anumang hindi expression, tulad ng `oak maple`, ay humahanap ng mga salitang iyon sa bawat column.
- **Pumili ng mga row:** i-click ang isang row. Ang Ctrl+click ay nagdadagdag o nag-aalis ng isa, ang Shift+click ay pumipili ng sunod-sunod, at ang {{ui:Select shown rows}} ay kinukuha ang bawat row na pumapasa sa filter. Iginuguhit sa plano ang mga napiling feature, at ang pag-click sa feature sa plano ay pumipili ng row nito dito.
- Kapag may napiling row, maaari mong gamitin ang {{ui:Zoom}} sa mga ito, gumawa ng **layer mula sa pagpili**, at basahin ang kabuuang lawak o haba sa status line.

## Ayusin ang mga value

I-double-click ang cell (o pumunta rito gamit ang arrow keys at pindutin ang Enter), i-type ang bagong value at pindutin ang Enter. Ibinabalik ng Escape ang dating value. Dapat tumugma ang value sa column: mga numero bilang numero, mga petsa bilang `YYYY-MM-DD`, yes/no bilang yes, no, true o false. Tinatanggihan ang value na hindi tumutugma, na may pangungusap, at walang nagbabago. Ang walang lamang kahon ay ginagawang walang laman ang value. Bawat edit ay isang undo step: nasa ibaba ng table ang {{ui:Undo}} at {{ui:Redo}}, at gumagana ang Ctrl+Z sa plano.

## Mga field

Sa ilalim ng **Mga field** maaari kang magdagdag ng field (teksto, number, date o yes/no), magpalit ng pangalan ng isa, o mag-alis ng isa. Nagsisimulang walang laman ang bagong field. Sumusunod sa pagpapalit ng pangalan: ang label field at ang [style ayon sa attribute](topic:gis-symbology) ng layer ay lilipat sa bagong pangalan, at ang pag-alis ng field ay nag-aalis ng label at style na gumamit nito. Bawat isa ay isang undo step na nagbabalik ng lahat.

## Field calculator

Nagsusulat ng value sa bawat row (o sa napiling row lang) mula sa iba pang field ng row, sa geometry nito at ilang function. Pumili ng umiiral na field o **Bagong field…** at bigyan ito ng pangalan at uri. Walang tinatakbong code: binabasa ang expression ng maliit na parser na may nakapirming listahan ng function.

| Grupo | Mga salita |
|---|---|
| Numbers | `+ - * /`, bracket, `abs round(x, digits) floor ceil sqrt pow min max` |
| Teksto | `upper lower trim len substr(text, from, count) left right replace concat` (ang teksto ay nasa 'single quotes'; ang pangalan ng field na may espasyo ay nasa "double quotes" o [square brackets]) |
| Pagpili | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Petsa | `year month day` ng value na `YYYY-MM-DD` |
| Geometry | `$area $perimeter $length $x $y $vertices`, sa mga unit ng project |

Ang resultang hindi maitatago sa uri ng field (teksto sa number field) ay iniiwang walang laman at binibilang sa mensahe. Ang paghahati sa zero ay nagbibigay ng walang laman na value. Halimbawa, ang `round($area / 43560, 2)` ay sumusulat ng acres mula sa square feet.

## I-export

{{ui:Export CSV}} ay nagse-save ng mga row na nakikita mo (pagkatapos ng filter at sort) bilang UTF-8 na CSV file na may mga pangalan ng field sa unang linya. Ang teksto na nagsisimula sa `=`, `+`, `-` o `@` ay binibigyan ng apostrophe sa unahan para hindi ito patakbuhin ng spreadsheet bilang formula. Para i-save ang mismong layer, gamitin ang [I-export ang as-built data para sa GIS](topic:gis-export).

## Mga limitasyon

Ipinapakita ng table ang layer sa iisang ayos ng pag-sort at isang filter sa bawat pagkakataon. Hindi maaaring magdagdag o burahin ang row dito (gumawa ng bagong layer mula sa pagpili sa halip), hindi ine-edit ang geometry, at hindi mapapalitan ang uri ng field pagkatapos itong gawin.
