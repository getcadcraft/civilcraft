---
title: Piliin, kopyahin at i-paste ang survey points
summary: Pumili ng survey points sa pamamagitan ng click, Shift at box, o lahat nang sabay; kopyahin, i-cut, i-paste, i-paste sa mismong lugar, i-duplicate at burahin ang mga ito na may bagong point numbers na hindi kailanman nagbabanggaan; mag-paste ng point rows papunta at mula sa spreadsheet.
keywords: kopyahin, copy, paste, cut, duplicate, burahin ang points, piliin ang points, select points, piliin lahat, select all, box select, window, clipboard, spreadsheet, csv, renumber, point numbers, paste sa mismong lugar, clone, stakeout
from: 78a6aea7
---

Maaaring kopyahin at i-paste ang survey points sa loob ng isang project, sa pagitan ng mga project sa dalawang browser tab, at papunta at mula sa spreadsheet. Bawat pagbabago ay isang undo step, at agad nabubuo muli ang surface mula sa mga bagong punto.

## Pumili ng points

Gamit ang {{ui:Select}} ({{key:V}}):

- **I-click** ang punto para piliin ito (at iyon lamang). Lalabas ang mga numero nito sa ilalim ng **Properties**.
- {{key:Shift}} at **i-click** ay nagdaragdag ng punto sa pagpili, o inaalis ito.
- {{key:Shift}} at **i-drag** ay gumuguhit ng box: idinadagdag sa pagpili ang mga punto sa loob nito. Kung i-drag mo sa paligid ng mga punto, nagiging lasso ito; tingnan ang [Lasso selection ng survey points](topic:lasso-selection). Ang pag-drag nang walang {{key:Shift}} ay nagpa-pan, gaya ng dati.
- {{key:Mod+A}} (o {{ui:More}} › {{ui:Select all points}}) ay pumipili ng lahat ng punto.
- {{key:Esc}} (o {{ui:More}} › {{ui:Select none}}) ay inaalis ang pagpili.

May singsing ang mga piniling punto. Kapag higit sa isa ang napili, ipinapakita ng **Properties** kung ilan sila, ang kanilang mga numero, saklaw ng elevation at mga group.

## Kopyahin, i-cut at burahin

- {{ui:Copy}} o {{key:Mod+C}} ay kinokopya ang piniling punto. Itinatago ng CivilCraft ang kopya, at inilalagay din ito sa system clipboard bilang point rows, para maipa-paste mo diretso sa spreadsheet o text file.
- {{ui:More}} › {{ui:Cut}} o {{key:Mod+X}} ay kinokopya ang mga ito at binubura, sa isang hakbang.
- {{ui:More}} › {{ui:Delete}} o {{key:Delete}} ay bumubura sa kanila. Ibinabalik sila ng {{key:Mod+Z}}.

Ang mga row ay point, northing, easting, elevation, description (P,N,E,Z,D), pinaghihiwalay ng kuwit, na may tatlong decimal. Para mauna ang easting bago ang northing, itakda ang **Point rows** sa [Mga setting ng CivilCraft](topic:settings). Ang description na babasahin ng spreadsheet bilang formula (nagsisimula sa =, +, - o @) ay nilalagyan ng apostrophe sa unahan, para manatili itong text.

## I-paste

1. Pindutin ang {{key:Mod+V}} o i-click ang {{ui:Paste}}. Sumusunod ang mga punto sa pointer bilang maliliit na krus, na may tuldok-tuldok na linya pabalik sa pinanggalingan nila.
2. I-click kung saan sila pupunta. Ang gitna ng mga kinopyang punto ay lalapag sa click.
3. O pindutin ang {{key:Enter}} para ilagay sila sa sarili nilang coordinates, o {{key:Esc}} para kanselahin.

{{ui:More}} › {{ui:Paste in place}} o {{key:Mod+Shift+V}} ay nagpa-paste sa sarili nilang coordinates kaagad. Pagkatapos, napipili ang mga na-paste na punto, kaya maaari mo silang kopyahin, ilipat o burahin muli.

:::note
Ang pag-click sa {{ui:Paste}} sa toolbar ay binabasa ang system clipboard. Sa unang pagkakataon, maaaring itanong ng browser kung pinapayagan ang CivilCraft na makita ang clipboard. Kung tumanggi ka, ang toolbar button ay nagpa-paste lamang ng sariling kopya ng CivilCraft; ang {{key:Mod+V}} ay nagpa-paste pa rin ng mga row mula sa spreadsheet nang hindi nagtatanong.
:::

## Hindi nagbabanggaan ang point numbers

Walang dalawang punto ang nagbabahagi ng numero. Kapag nagpa-paste ka:

- Pinapanatili ng na-paste na punto ang numero nito kapag walang punto sa project ang may hawak nito. Kaya pagkatapos ng **Cut**, bumabalik ang mga punto na may sariling numero, at ang mga punto mula sa ibang project ay pinananatili ang kanilang numero kung malaya pa ang mga ito.
- Ang na-paste na punto na okupado ang numero ay makakakuha ng bagong buong numero: isa pa sa pinakamataas na numerong ginagamit, pataas nang pataas.
- Sinasabi ng status bar kung ano ang nangyari, halimbawa "1 ang nanatili ng numero; 9 ang nakakuha ng bagong numero: 10–18 naging 277–285".

Sa [Mga setting ng CivilCraft](topic:settings) maaari mong piliin ang **Always new numbers**, at ang numerong sisimulan ng mga bagong numero, halimbawa 5000 para sa design points.

:::warning
Ang point groups na bumubuo sa surface bilang **breakline** ay dinudugtong ang mga punto ayon sa pagkakasunod-sunod ng numero. Ang na-paste na kopya ng breakline points (halimbawa, FL shots) ay nakakakuha ng bago at mas mataas na numero at dumudugtong sa dulo ng breakline na iyon, posibleng may mahabang paglundag. Tingnan ang plano pagkatapos mag-paste ng ganoong punto, o itakda ang group nito sa {{ui:Points}}.
:::

## Duplicate

{{ui:More}} › {{ui:Duplicate}} o {{key:Mod+D}} ay gumagawa ng kopya ng piniling punto na sumusunod sa pointer: i-click kung saan ito pupunta. Laging nakakakuha ng bagong numero ang mga kopya, at nananatili ang clipboard ng CivilCraft sa dati nitong kalagayan.

## Mula sa spreadsheet o text file

Pumili ng mga row ng punto sa spreadsheet (point, northing, easting, elevation, description) at kopyahin ang mga ito. Sa CivilCraft, pindutin ang {{key:Mod+V}} at i-click kung saan sila pupunta, o pindutin ang {{key:Mod+Shift+V}} para ilagay sila sa sarili nilang coordinates, na kadalasang gusto mo para sa totoong survey data.

Binabasa ang mga row nang eksakto gaya ng isang [point file](topic:point-file-formats): kuwit, tab o space, header row kung mayroon. Kung walang header, ang pagkakasunod ng column ay mula sa **Point rows** sa [Mga setting ng CivilCraft](topic:settings).

Kapag pareho silang nandiyan, nagpapasya ang CivilCraft batay sa alin ang mas bago: ang mga row sa system clipboard na naiiba sa huling kopya ng CivilCraft ay kinopya nang mas huli, kaya sila ang ipina-paste. Binabalewala ang text na walang punto, at ang sariling kopya ng CivilCraft ang ipina-paste.

## Sa pagitan ng project at tab

Nananatili ang kopya sa browser na ito, kaya maaaring mag-paste ang ikalawang tab ng CivilCraft, kahit magsara na ang una. Ang mga punto na kinopya sa metro project at ipinaste sa feet project ay pinapanatili ang kanilang numero gaya ng dati: walang kino-convert, at sinasabi ito ng status bar.

## Ano ang hindi kinokopya

Mga survey point lamang ang kinokopya sa ngayon. Hindi pa maaaring kopyahin o i-paste ang alignments, pads, pipe networks, breaklines at hangganan. Hindi nailipat ng pag-paste ang umiiral na mga punto: gamitin ang {{ui:Cut}} at paste, o ilipat ang isang punto sa bawat pagkakataon ([I-edit ang survey point](topic:edit-points)).
