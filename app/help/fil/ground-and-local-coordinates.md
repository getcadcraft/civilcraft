---
title: Ground at local na coordinates
summary: Magtrabaho sa ground (surface) coordinates na na-scale mula sa grid gamit ang combined scale factor na itinype mo o kinalkula sa isang punto, o sa assumed na site grid na nakatali sa sistema sa pamamagitan ng dalawang control point.
keywords: ground coordinates, surface coordinates, grid to ground, combined scale factor, csf, combined factor, grid factor, elevation factor, sea level factor, convergence, mapping angle, scale factor, assumed coordinates, local coordinates, site grid, 5000 5000, control points, localization, calibration, two point, misclosure
from: 3d7453de
---

Ang State plane at UTM coordinates ay **grid** coordinates: bahagyang iniuunat o pinapaliit ng map projection ang mga distansya (sampu-sampung parts per million), at habang mas mataas ang site, mas nagkakaiba ang sinukat na ground distance sa grid distance. Kaya maraming survey ang nagbibigay ng **ground** coordinates, na na-scale para pantay ang distansya sa plano sa distansyang sinusukat sa lupa, o isang **assumed** na site grid (5000, 5000 sa isang control point). Pinananatili ng CivilCraft ang mga numero mo gaya ng mga ito at itinatala kung paano sila nauugnay sa grid, kaya ang latitude at longitude, GIS file at map layer ay tama pa rin ang lugar.

Buksan ang {{ui:Coordinates}} sa {{ui:GIS}} group, piliin (o panatilihin) ang sistema, pagkatapos pumili sa ilalim ng **Grid, ground or local coordinates**:

| Pagpipilian | Ang iyong coordinates ay | Paano sila nauugnay sa grid |
|---|---|---|
| {{ui:Grid}} | Sarili ng sistema (ang simula) | Parehong mga numero |
| {{ui:Ground}} | Na-scale sa ground distances | grid = base + combined factor × (ground − base) |
| {{ui:Local}} | Isang assumed na site grid | Inilipat, pinaikot at in-scale sa grid sa pamamagitan ng dalawang control point |

Anuman ang piliin mo ay naka-save sa project at isang undo step; walang gumagalaw.

## Ground coordinates

1. Piliin ang {{ui:Ground}}.
2. I-type ang **Combined scale factor** mula sa survey (halimbawa `0.99987`), o kalkulahin ito:
   1. Sa ilalim ng **Compute the factor at a point**, nagsisimula ang punto sa gitna ng project. Piliin ang {{ui:Pick a point on the plan}} at i-click ang lugar (ang click malapit sa survey point ay kinukuha ang punto na iyon), o i-type ang E at N.
   2. Galing sa surface doon ang elevation; mag-type ng iba kung kailangan mo.
   3. Piliin ang {{ui:Compute}}. Ipinapakita ng CivilCraft:
      - **Grid scale factor k**: gaano kalaki ang iniuunat ng map projection ang mga distansya doon.
      - **Elevation factor**: gaano kaikli ang mga distansya sa ellipsoid kaysa sa taas na iyon.
      - **Combined factor** = k × elevation factor: grid distance = ground distance × ito.
      - **Convergence**: ang anggulo mula grid north papuntang true north doon (geodetic azimuth = grid azimuth + convergence).
   4. Piliin ang button na {{ui:Use}} sa ilalim ng mga numero para ilagay ang combined factor sa kahon.
3. Itakda ang **Base point**, kung saan parehas ang ground at grid coordinates. Nagsisimula ito sa 0, 0: karamihan sa mga hurisdiksyong naglalathala ng ground coordinates ay nagsa-scale sa paligid ng origin, kaya nananatiling malapit sa grid ang ground coordinates. Ang ilang survey ay nagsa-scale sa paligid ng control point ng project: gamitin ang sinasabi ng survey.
4. Piliin ang {{ui:Apply}}.

:::warning
Kinukuha ang elevation bilang taas sa ibabaw ng ellipsoid. Walang geoid model ang CivilCraft, kaya kapag 30 m (100 ft) sa ilalim o sa itaas ng ellipsoid ang geoid, ang elevation factor ay mali nang humigit-kumulang 5 ppm. Kapag sinasabi ng survey ang combined factor nito, i-type ang iyon.
:::

## Local (assumed) coordinates

1. Piliin ang {{ui:Local}}.
2. Para sa **Control point 1**, i-type ang numero ng survey point (o piliin ang {{ui:Pick}} at i-click ito sa plano). Ipinapakita sa tabi nito ang local coordinates nito.
3. I-type ang **grid** na E at N nito, o ang latitude at longitude nito sa ikatlong kahon (halimbawa `30.2672, -97.7431`).
4. Gawin din ito para sa **Control point 2**, hangga't kaya mong ilayo ito sa una.
5. Ipinapakita ng CivilCraft ang nahanap na **Scale** at **Rotation**, at ipinapaalala: **Laging tumutugma nang eksakto ang dalawang punto — suriin ang ikatlo.**
6. Magbigay ng **Check point** sa parehong paraan. Ipinapakita ng CivilCraft kung gaano kalayo ito inilalagay ng fit mula sa grid coordinates na itinype mo (ang misclosure nito, sa project units at parts per million). Ang malaking misclosure ay nangangahulugang maling punto, typing error, o coordinates sa ibang unit.
7. Piliin ang {{ui:Apply}}.

Tinatanggihan ang scale na malayo sa 1 (lampas sa 0.5 hanggang 2): suriin ang mga punto at ang kanilang unit.

## Ano ang sinuri

- Tumutugma sa PROJ (pyproj 3.7.1 kasama ang PROJ 9.5.1), ang coordinate library na ginagamit ng karamihan sa GIS program, ang scale factor at convergence hanggang 1 part sa isang bilyon sa mahigit 300 sistemang may conformal projection (state plane, UTM, transverse Mercator, Lambert conformal conic), at sa browser sa punto na napili sa plano.
- Bumabalik-balik nang hanggang 1 part sa isang bilyon ang mga hakbang ng ground at local; ibinabalik ng dalawang control point ang scale at rotation na ginawa sa mga ito; ang check point na 0.05 ft ang layo ay nagpapakita ng misclosure na 0.05 ft.
