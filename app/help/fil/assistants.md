---
title: Hayaan ang AI assistant na magtrabaho sa site mo
summary: I-on ang assistant sa Settings para mabasa ng assistant sa computer mo ang bukas na site (mga punto, surface, volume, profile, parcel), makapagdagdag ng survey point, makapag-save at mag-export ng LandXML o DWG, sa pamamagitan ng CadCraft Studio. Naka-off hangga't hindi mo ito binubuksan.
keywords: ai, assistant, mcp, script, automation, studio, mga punto, elevation, station, offset, alignment, volume, cut, fill, profile, parcel, landxml, dwg, usd, mga folder, permissions, disconnect, activity
from: d0356582
---

## Ano ang matututunan mo

Paano hayaan ang AI assistant (anumang assistant na nagsasalita ng MCP) na magtrabaho sa site na bukas mo, ano ang kaya at hindi nito gawin, at kung paano ito pahintuin.

## Ano ang magagawa ng assistant sa CivilCraft

| Humihingi ng | Ano ang nakukuha nito | Kailangan |
|---|---|---|
| Ang site | Pangalan, unit, coordinate system, point group, alignment, surface, pad, parcel at pipe | Basa |
| Survey points | Numero, easting, northing, elevation at deskripsyon, ayon sa group, ayon sa deskripsyon o sa loob ng isang kahon | Basa |
| Elevation ng surface | Ang umiiral na lupa (o ang graded surface) sa anumang punto na itinakda nito | Basa |
| Station at offset | Ang station at offset ng mga punto sa kahabaan ng alignment, o ang coordinates at elevation ng lupa ng mga station | Basa |
| Profile | Elevation ng lupa, design profile at graded surface sa kahabaan ng alignment, bawat ilang feet o metro | Basa |
| Cut at fill | Mga volume sa pagitan ng umiiral na lupa at ng graded surface (bawat pad at corridor din), o sa pagitan ng lupa at isang level | Basa |
| Parcel | Mga sulok, lawak (may acres o hectares), perimeter at legal na deskripsyon | Basa |
| Isang selection | Ang mga punto na pinangalanan nito ay napipili sa plano, na parang ikaw ang pumili | I-edit |
| Bagong survey points | Mga punto na idinagdag gamit ang mga numerong ibinigay nito, o ang susunod na libre. Bawat tawag ay isang hakbang na maaari mong i-undo | I-edit |
| Save | Ang sariling {{ui:Save}} ng CivilCraft | I-save |
| LandXML o DWG | Ang parehong file gaya ng mga button na {{ui:LandXML}} at {{ui:DWG}} | I-export |
| Ang site sa 3D | OpenUSD (.usdz, .usda o .usdc) ng lupa, graded surface, pad at pipe, gaya ng pag-export ng 3D view | I-export |
| Mga halaman at iskedyul ng halaman | Mga halamang nakita sa listahan ng halaman sa anumang pangalan, at ang bilang ng iskedyul ng halaman | Basa |
| Pagtatanim at grading | Mga halaman, kama o bakod na inilagay, o platform, berm, swale o grading area na idinagdag, bawat isa ay isang hakbang na maaari mong i-undo, kasama ang cut at fill nito | I-edit |
| Pagsusuri ng irrigation | Daloy ng bawat zone, presyong kailangan sa balbula nito at sa supply, ang pinakamasamang head, run time, mga problema at bill of materials, bilang tulong sa kalkulasyon na sinusuri ng irrigation designer | Basa |

Gumagana ito sa site na bukas. Sa Studio, maaari rin itong mag-save at mag-export sa mga folder na pipiliin mo (sa ibaba); kung walang folder, dina-download ang mga file nito gaya ng mga button.

## Buksan ito

Naaabot ng mga assistant ang CivilCraft sa pamamagitan ng CadCraft Studio sa computer mo; walang paraan papasok ang plain na browser.

1. Buksan ang {{ui:Settings}} at piliin ang tab na **CivilCraft**.
2. Sa ilalim ng **Assistants**, lagyan ng tsek ang **Payagan ang AI assistant at script na gamitin ang CivilCraft**.
3. Naka-tsek na ang **Basa** para sa iyo. Lagyan ng tsek ang **I-edit**, **I-save** o **I-export** lamang kung kailangan ng assistant ang mga iyon.
4. Para payagan itong mag-save at mag-export sa isang folder, piliin ang {{ui:Magdagdag ng folder…}} sa ilalim ng **Mga folder na maaari nitong gamitin** at piliin ang folder sa dialog ng Studio. Kinukuha ito ng {{ui:Alisin}} agad; anumang ibang path ay tinatanggihan.
5. Ikonekta ang assistant sa Studio (ipinapakita ng Studio ang address at ang mga setting na ipo-paste dito).

## Habang nakakonekta ang assistant

Ang tala sa itaas ng kanang panel ay nagsasabi kung aling assistant ang nakakonekta at ano ang kaya nitong gawin. I-click ang {{ui:Disconnect}} para tapusin agad ang session nito; kailangan nitong kumonekta muli para magpatuloy.

Ang **Activity**, sa ilalim ng **Assistants** sa Settings, ay naglilista ng bawat tawag na ginawa ng assistant, ang pinakabago muna, kasama kung nagtagumpay ito.

:::tip
Magtanong sa simpleng salita, halimbawa "ano ang elevation ng lupa kada 50 feet sa kahabaan ng Main Street?", "magkano ang cut at fill na kailangan ng mga pad?" o "magdagdag ng control point sa mga coordinates na ito". Binabasa ng assistant ang site at sumasagot, o gumagawa ng pagbabago bilang isang hakbang na maaari mong i-undo.
:::

## Nang hindi binubuksan ang CivilCraft

Ang file server ng CadCraft para sa mga assistant (`npx @getcadcraft/mcp`) at ang `cadcraft` command line ay nagbubukas ng mga sine-save na proyekto ng CivilCraft (`.civilcraft.json`) at mga points file gamit ang sariling code ng CivilCraft, nang walang window: ang parehong tool sa pagbabasa, pagdaragdag ng punto, pag-save ng proyekto, LandXML at ang site sa 3D bilang OpenUSD. Isinusulat ng `cadcraft convert site.civilcraft.json site.xml` ang LandXML mula sa command line. Kailangan pa rin ng window ng CivilCraft para sa pagbubukas ng LandXML, sa DWG export at sa mga tool ng Landscape workspace.

## Patayin ito

Alisin ang tsek sa **Payagan ang AI assistant at script na gamitin ang CivilCraft**. Agad na madidiskonekta ang bawat assistant, at mananatili ang setting para sa susunod na pagkakataon.

## Tingnan din

- [Mga recipe para sa AI assistant](common:assistants-recipes): mga halimbawang may kasamang tool na tinatawag ng bawat isa.
- [Gumawa ng horizontal alignment](topic:alignment)
- [Buuin at pinuhin ang surface](topic:build-surface)
- [Pumili, kopyahin at i-paste ang survey points](topic:copy-paste-points)
- [Mga setting ng CivilCraft](topic:settings)
