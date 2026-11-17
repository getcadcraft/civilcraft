---
title: Basahin ang contours, elevations at slopes
summary: Itakda ang contour interval at major contours, ipakita ang elevation bands, slope arrows at triangles, at basahin ang ground elevations sa ilalim ng pointer.
keywords: contours, agwat ng contour, major contours, labels, elevation bands, slope arrows, triangles, spot elevation, pagsusuri ng surface, pagsusuri ng elevation, pagsusuri ng slope
from: 585e500a
---

Makikita ang surface na may contours sa sandaling mabuo ito. Lahat ng nasa topic na ito ay itinatakda sa ilalim ng **Display** sa kaliwang panel. Nagbabago lamang ang display settings sa nakikita mo (at sa ini-export mo); hindi ito mga undo step.

## Itakda ang contour interval

1. Sa ilalim ng **Display**, pumili ng value sa **Contours every**.
   - Sa feet: 0.25, 0.5, 1, 2, 5, 10 o 20 ft.
   - Sa metro: 0.1, 0.25, 0.5, 1, 2, 5 o 10 m.
2. Pumili ng **Major every**: ang ika-2, ika-4, ika-5 o ika-10 na contour.
   Ang major contours ay iginuguhit nang mas makapal at may label ng kanilang elevation. Nasa mga buong multiple ng major spacing sila (sa 1 ft contours at bawat ika-5 na major: 245, 250, 255 …).
3. I-off ang {{ui:Contour labels}} kung nagsisiksikan ang mga label sa maliit na plot.

Nagsisimula ang bagong project sa 1 unit na may bawat ika-5 contour na major. Yumuyuko ang contours sa breaklines; kung tumatawid sila nang tuwid sa isang flowline o ridge, hindi pa iyon breakline (tingnan ang [Buuin at pinuhin ang surface](topic:build-surface)).

:::note
Iginuguhit lamang ang contours kapag hindi lalampas sa 2,000 levels ang pagitan ng pinakamababa at pinakamataas na punto. Sa site na maraming relief at napakaliit na interval, walang contours na makikita sa plano: pumili ng mas malaking interval.
:::

## Pakinisin ang contours

Iginuguhit ang contours bilang tuwid na piraso, isa sa bawat triangle ng surface, kaya may maliit na sulok ang mga ito sa bawat gilid ng triangle. Binibilog ng **Contour smoothing** sa ilalim ng **Display** ang mga sulok na iyon:

- **None (straight pieces)**: ang mga guhit na walang pagbabago. Ito ang makikita sa bago o mas lumang drawing.
- **Light**: bahagyang bilog ang mga sulok. Hindi kailanman lumilipat ang guhit nang higit sa 10% patungo sa susunod na contour, at hindi kailanman lumalayo sa tuwid nitong piraso nang higit sa isang ikaanim ng haba ng piraso.
- **Strong**: dumadaloy na kurba. Hindi lumilipat ang guhit nang higit sa 25% patungo sa susunod na contour, at hindi lumalayo sa tuwid nitong piraso nang higit sa isang ikatlo ng haba nito.

Sa alinmang pagpipilian, tumatawid pa rin ang pinakinis na contour sa bawat gilid ng triangle sa parehong punto gaya ng tuwid na guhit, nananatili sa loob ng triangle na tinatawid ng bawat piraso, kaya hindi ito kailanman tatawid o didikit sa ibang contour. Kung saan tumatawid ang contour sa breakline o sa hangganan, pinapanatili nito ang matalas nitong sulok. Ang pinakinis na mga guhit ang ipinaplot at ini-export (DXF, DWG, PDF, GIS at 3D), at may mas maraming vertex kaysa sa tuwid na guhit.

Nagbabago lamang ang pagpapakinis sa mga iginuhit na guhit. Ang elevations, volumes, profiles at sections ay binabasa pa rin mula mismo sa surface. Ang contour na dumaraan nang eksakto sa survey points (halimbawa, punto sa 250.00 sa 250 contour) ay nananatiling may maliit na sulok sa bawat ganoong punto.

## Paano ginagawa ang surface sa likod ng contours

Sinusundan ng contours ang surface, at sinusundan ng surface ang **Contouring method** sa ilalim ng **Surface** sa kaliwang panel. Ang default, **Triangulation with linear interpolation**, ay pinagdudugtong ang iyong mga punto sa triangles at pinapanatili ang bawat punto at breakline nang eksakto. Ang ibang method ay unang nag-aakma ng regular na grid sa mga punto (kriging, minimum curvature, natural neighbor, inverse distance at iba pa), na nagbibigay ng mas bilog na contours sa pagitan ng mga punto ngunit hindi dumadaan nang eksakto sa bawat punto. Sinasabi ng surface report sa ilalim ng **Surface** kung gaano kalayo ang resulta sa iyong mga punto.

Ang **ABOS (approximation based on smoothing)** ay isa sa mga gridded method. May sarili itong dalawang setting: **Smoothness** (0.5 para magsimula; mas mababa ay mas makinis) at **Accuracy** (1 para magsimula: dinadala ang surface sa loob ng 1% ng height range ng site sa iyong mga punto; mag-type ng mas maliit na numero para sa mas malapit na pagkakasya). Kung hindi nito maabot ang accuracy sa grid na mayroon ito, sasabihin ito ng surface report: mag-type ng mas maliit na **Grid spacing**.

## Basahin ang elevation kahit saan

Ilipat ang pointer sa ibabaw ng plano. Ipinapakita ng status bar ang:

- **E** at **N** sa ilalim ng pointer
- **Ground** at ang existing ground elevation doon, na in-interpolate sa triangle sa ilalim ng pointer
- **Graded** at ang proposed elevation, kung saan binago ng pad o corridor ang ground
- "Wala sa surface" sa labas ng surface

Para basahin nang eksakto ang isang survey point, piliin ang {{ui:Select}} at i-click ang punto: ipinapakita ng kanang panel ang numero nito, easting, northing, elevation, description at group.

## Ipakita ang elevation bands

1. Lagyan ng tsek ang {{ui:Elevation bands}}.
   Pinupuno ang surface ng kulay mula mababa (blue-green) hanggang mataas (ochre-brown). Ang legend sa ilalim ng checkboxes ay naglilista ng saklaw ng elevation ng bawat band.
2. Pumili kung ilang band ang nasa **Bands**: 5, 8, 10 o 12. Hinahati ng mga band ang saklaw mula pinakamababa hanggang pinakamataas na elevation sa pantay na hakbang.

Para lamang sa pagtingin ang bands. Hindi sila ini-export sa DXF o ipinaplot sa PDF.

## Ipakita ang slope arrows

Lagyan ng tsek ang {{ui:Slope arrows}}. Ang maikling arrow sa bawat triangle na sapat ang laki para maglaman nito ay tumuturo pababa. Walang arrow ang flat na triangles. Mabilis na pagsusuri ang arrows ng direksyon ng drainage; ang mismong slope value ay wala pang label.

## Ipakita ang triangles, points at edges

- {{ui:Triangles}} ay gumuguhit ng mga gilid ng TIN. I-on ito para suriin kung paano kumokonekta ang surface sa mga punto, lalo na sa kahabaan ng breaklines at sa labas.
- {{ui:Points}} ay gumuguhit ng bawat survey point; ang {{ui:Point labels}} ay nagdaragdag ng numero, elevation at description nito (o mas kaunti: tingnan ang **Point labels** sa [Mga setting ng CivilCraft](topic:settings)).
- {{ui:Breaklines}} ay gumuguhit ng breaklines (at ng hangganan) sa kulay orange.
- {{ui:Surface edge}} ay gumuguhit ng balangkas ng surface.

## Existing o proposed

Kapag tuwid nang nag-grade ang isang pad o corridor, nag-aalok ang **Surface** sa ilalim ng **Display** ng {{ui:Proposed (graded)}}. Ang contours, bands at arrows ay magpapakita na ng graded surface, kaya makikita mo ang bagong ground at ang daylight sa paligid nito. Bumalik sa {{ui:Existing ground}} para makita ang survey.

## Ano ang ini-export

Sinusunod ng DXF at PDF output ang mga setting na ito: ang mga naka-off mo ay hindi isinusulat, at ang contours ay yaong sa surface na nakikita. Hindi kailanman ini-export ang elevation bands.
