---
title: Kalkulahin ang oras ng sikat ng araw sa isang site
summary: Pumili ng araw (o season) at time zone, at tingnan ang oras ng direktang sikat ng araw sa bawat pader ng bawat mass at sa lupa sa paligid nila, kasama ang lupang iginuhit sa plan at ang mga numero bilang CSV.
keywords: sun, sun hours, shadow, shade, solar access, oras ng liwanag ng araw, facade, wall, season, solstice, equinox, time zone, daylight saving, latitude, longitude, CSV, raster
from: 4e32a314
---

**Sun hours** ay binibilang ang oras ng direktang sikat ng araw na umaabot sa bawat pader ng bawat building mass at sa lupa sa paligid nila, sa araw na pipiliin mo o karaniwan sa isang season. Ang mga mass at ang lupa mismo ang nagbibigay ng anino; wala nang iba (walang puno, walang kapitbahay na hindi mo iginuhit). Hindi binibilang ang liwanag ng langit na hindi direktang sikat ng araw.

## Bago ka magsimula

Galing sa latitude at longitude ng site ang posisyon ng araw, na nanggagaling sa **coordinate system** ng project. Tatanggihan ang project na walang ganito, na may mensaheng nagsasabing itakda muna ito (**Coordinates** sa GIS group). Walang kahon para sa latitude at longitude na i-type nang manu-mano, dahil hula lang ang anumang ganoong halaga.

## Kalkulahin ito

Sa **Properties**, sa ilalim ng **Building masses**, **Sun hours**:

1. Piliin ang **Day**. Nagsisimula ito sa araw na pinakamababa ang sikat ng araw sa lugar mo (21 Disyembre, o 21 Hunyo sa southern hemisphere). Para sa season, lagyan ng tsek ang **Over a season**, piliin ang **Last day** at kung ilang araw ang pagitan ng sampling.
2. I-type ang **Time zone**: pangalan gaya ng `America/Mexico_City`, o offset mula sa UTC gaya ng `-6`. Sumusunod ang pangalan sa daylight saving rules ng zone na iyon para sa araw; ang offset na i-type mo ay ginagamit nang eksakto kung paano mo ito tinype, kaya gamitin ang nasa bisa sa araw na iyon. Sinasabi ng linya sa ilalim ng kahon kung anong offset ang nahanap nito.
3. Piliin kung gaano kadalas ilagay ang araw (bawat 5, 10, 15 o 30 minuto), saka i-click ang **Kalkulahin ang sun hours**. Tumatakbo ang season sa background workers; kinakansela ito ng **Ihinto**.

## Ano ang makukuha mo

- Table kada mass: ang **worst wall**, ang **average** at ang **best wall**, sa oras kada araw, at table ng bawat pader kasama ang direksyon nito at oras kada palapag.
- Ang lupa sa paligid ng mass, iginuhit sa plan mula madilim (walang araw) hanggang dilaw (pinakamarami na nakukuha ng alinmang cell), kasama ang key. Walang laman ang mga cell sa ilalim ng mass. Pinapatay ito ng **Ipakita ang lupa sa plan**.
- **Mga pader bilang CSV** at **Lupa bilang CSV** ang nagse-save ng mga numero.

Para sa season, ang mga figure ay ang average kada araw sa mga araw na na-sample. Walang naka-save sa project: pang-tingin lang ang resulta, at muling nagagawa kapag inulit ang pagkalkula.

## Mabuting malaman

- Binibilang lang ng pader ang isang sandali bilang maaraw kapag nakaharap ito sa araw at walang nakaharang. Ang pader na nakatalikod ay walang nakukuha.
- Sina-sample ang lupa sa grid na nakadepende sa laki ng site, at ang posisyon ng araw sa gitna ng bawat time step, kaya tama ang mga oras hanggang sa lapad ng step na pinili mo.
- Ang posisyon ng araw ay isang nailathalang astronomical formula, tama hanggang humigit-kumulang isang minuto ng arc.
