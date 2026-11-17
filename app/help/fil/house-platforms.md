---
title: House platforms sa mga sloped na site
summary: I-grade ang pad sa burol: mga retaining wall bilang gilid ng pad, ang cut and fill map na may shading ayon sa lalim at spot level (plano at 3D), section na maaaring iguhit kahit saan sa ground at sa design, at mga ramp o sloped pad para sa driveway.
keywords: platform, pad, house pad, sloped site, burol, retaining wall, cut and fill, cut fill map, spot levels, free section, section line, council drawings, driveway, ramp, sloped pad, grade, swell factor, earthwork
from: daa08a3f
---

Ang house platform ay isang **pad** (**Design** › {{ui:Pad}}): isang flat na polygon sa iisang level, na ginrade sa ground. Apat na bagay ang nakakatulong sa slope.

## Retaining wall bilang gilid ng pad

Piliin ang pad at itakda ang isang gilid sa {{ui:Vertical (retaining wall)}} sa halip na slope (**Properties** › {{ui:Mga gilid at retaining wall}}, o {{ui:Vertical: retaining walls}} para sa lahat ng gilid nang sabay). Binabasa ang taas ng pader mula sa ground sa kahabaan nito: top sa ground, bottom sa pad, ipinapakita sa magkabilang dulo at sa pinakamataas nitong punto sa plano, na may babala kapag mas mataas ito sa limit na itinakda mo. Maaaring paghaluin ang mga pader at slope nang magkatabi.

## Ang cut and fill map

Lagyan ng tick ang {{ui:Cut and fill map}} sa ilalim ng **Show**. Nilalagyan ng shade ang plano ayon sa lalim ng cut o fill, sa pantay na hakbang (cut mainit, fill asul, halos pantay maputla) na may legend, at naka-print sa pad ang **spot levels**: ang pagbabago ng level sa mga punto sa isang grid, at ang pinakamalalim na cut at pinakamataas na fill na minarkahan ng ▲. Ang mga cell ay ang parehong ginagamit ng earthwork volumes, kaya laging nagkakasundo ang mapa at ang mga numero.

Sa 3D view, piliin ang **Cut and fill** mula sa listahan ng kulay para ipatong ang parehong kulay sa ground at sa design.

Nasa mass-haul tool (**Design** › {{ui:Mass haul}}) ang swell o shrink factor; hindi ito ina-apply sa volume ng pad.

## Free section

Sa ilalim ng **Surface** › {{ui:Higit pa}}, piliin ang {{ui:Free section}}, i-click ang mga punto ng section line kahit saan (maaari itong yumuko) at pindutin ang {{key:Enter}}. Iginuguhit ng dialog ang section: ang existing ground, ang graded design (dashed) at ang cut and fill sa pagitan ng mga ito, may shade, kasama ang kanilang mga area (binibilang lamang ang design sa loob ng mga pad at kalsada). Ang {{ui:Vertical exaggeration}} ay nakatakdang magkasya sa drawing; ang {{ui:Save as SVG}} at {{ui:Save as CSV}} ay nagbibigay ng drawing para sa council at ng mga numero.

## Ramps at sloped pad

Sa ilalim ng **Surface** › {{ui:Higit pa}}, piliin ang {{ui:Ramp or sloped pad}}, i-click ang mababang dulo at saka ang mataas na dulo, pindutin ang {{key:Enter}}, at ibigay ang lapad, ang level sa mababang dulo, at ang grade. Ang pad ay isang strip na may mga sulok na may dalang mga level na iyon (ang gilid sa pagitan ng dalawang sulok ay tumatakbo sa pare-parehong grade), at nagra-grade ito papunta sa ground gaya ng anumang pad. Maaari ring magkaroon ng sariling level ang mga sulok ng anumang pad, kaya ang driveway, ramp, o tilted terrace ay isang pad na may level sa bawat sulok.
