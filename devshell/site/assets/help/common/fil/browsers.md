---
title: Mga browser at computer
summary: Aling mga browser ang pinapatakbuhan ng mga app, ano ang pagkakaiba ng mga ito, at ano ang kailangan ng iyong computer.
keywords: chrome, edge, firefox, safari, brave, browser, mac, windows, linux, ipad, tablet, webgl, requirements, memory, kinakailangan, memorya
from: a11b09b1
---

Tumatakbo ang mga app sa loob ng web browser. Sila ang gumagawa ng trabaho sa sarili mong computer: binubuksan doon ang iyong mga file at hindi kailanman ipinapadala sa amin (tingnan ang [Saan napupunta ang iyong mga file](common:your-files)).

## Aling browser

Gamitin ang up-to-date na bersyon ng isa sa mga ito:

| Browser | Engine | Mga tala |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Ang pinakakumpleto: pagpili ng folder, pag-save para sa offline na paggamit, paghawak ng file. |
| Firefox | Gecko | Gumagana. Ang pagbukas ng buong folder ay gumagamit ng mas simpleng picker. Maaaring hindi gumana ang offline saving sa private windows. |
| Safari | WebKit | Gumagana sa Mac at iPad. Ang pagbukas ng buong folder ay gumagamit ng mas simpleng picker. Maaaring burahin ng Safari ang offline na kopyang hindi mo nagamit nang ilang linggo. |

Pareho ang tatlong engine para sa araw-araw na trabaho. Kapag iba ang ginagawa ng app sa isa sa mga ito, ipinapakita ng help nito ang mga hakbang para sa browser mo.

## Ano ang pagkakaiba ng mga browser

- **Pagbukas ng folder.** Nagpapakita ang mga Chromium browser ng totoong folder picker at kaya nilang basahin nang diretso ang folder. Hinihiling ng Firefox at Safari na pumili ka ng folder, at pagkatapos ay binabasa nila ang bawat file doon, na mas matagal para sa malalaking project folder; gumagana sa lahat ng tatlo ang pag-drag ng folder papunta sa app.
- **Pag-save.** Nagse-save ang mga app sa pamamagitan ng pag-download ng file. Ang browser mo ang nagpapasya kung saan napupunta ang mga download at kung nagtatanong muna ito.

:::chromium
Sa Chrome o Edge, i-on ang "Ask where to save each file before downloading" (sa Settings, sa ilalim ng Downloads) para pumili ng folder sa bawat pagkakataon.
:::

:::firefox
Sa Firefox, buksan ang Settings, pagkatapos General, pagkatapos Downloads, at piliin ang "Always ask you where to save files" para pumili ng folder sa bawat pagkakataon.
:::

:::safari
Sa Safari, buksan ang Settings, pagkatapos General, at itakda ang "File download location" sa "Ask for each download" para pumili ng folder sa bawat download.
:::

## Mac, Windows at Linux

Pareho ang mga app sa bawat computer. Ang nagbabago ay ang keyboard: awtomatikong isinusulat ang mga shortcut para sa computer mo. Tingnan ang [Mga key, mouse at trackpad](common:keys).

## Mga tablet at touch screen

May ilang app na tumatanggap ng touch (isang daliri ang gumuguhit o pumipili, dalawang daliri ang pinch para mag-zoom at mag-pan). Sinasabi ng help ng bawat app kung ginagawa nito iyon. Sa iPad, gamitin ang Safari o Chrome. Nakakatulong ang keyboard sa mga app na gumagamit ng typed commands.

## Pinakalumang browser at sistema

Binasa namin ito mula sa code ng 0.7 apps, hindi hula lang: na-parse ang bawat file at hinanap ang bawat feature ng wika na ginagamit nito sa published compatibility data ng mga browser. Sa ilalim ng mga bersyong ito, hindi man lang makapagsimula ang mga app, dahil hindi naiintindihan ng browser ang code.

| | Pinakalumang bersyon na makapagsisimula ng mga app |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS at iOS 16.4) |

Tumatakbo ang CadCraft Studio sa sarili nitong web engine sa Windows, kaya kailangan nito ng Windows 10 o 11; sa Mac, ginagamit nito ang sa sistema, kaya kailangan nito ng macOS 13.3 o mas bago. Ipinapakita ng Mga setting › Updates sa Studio kung saang sistema tumatakbo ang kopya mo.

Ito ang pinakalumang bersyon na *nagsisimula*, base sa code. Hindi ito listahan ng mga lumang browser na pinatakbuhan namin ng app, kaya ang mas lumang browser na nagsisimula ay maaari pa ring kulang sa ilang feature.

## Ano ang kailangan ng iyong computer

Ito ay mga planong minimum para sa mga app, hindi mga nasukat na kinakailangan:

- 8 GB ng memorya (inirerekomenda ang 16 GB para sa malalaking federated model).
- Graphics chip na may WebGL 2 para sa mga 3D app. Kung nananatiling blangko ang 3D view, tingnan kung naka-on ang hardware acceleration sa settings ng browser mo.
- Screen na hindi bababa sa 1280 pixels ang lapad para sa buong toolbar; ibinabalot ng mas maliliit na screen ang mga ito.

Ang napakalalaking file (malalaking plan set, malalaking model) ay gumagamit ng maraming memorya sa isang browser tab. Isara ang ibang mabibigat na tab kung bumagal ang app.
