---
title: Ang screen, bahagi-bahagi
summary: Isang pag-tour sa bawat bar at panel ng CivilCraft ayon sa pangalang nakikita sa screen, mula sa toolbar hanggang sa status bar.
keywords: interface, screen, toolbar, panel, properties, status bar, profile view, layout, pag-tour, ui
from: 76272010
---

Isang screen lang ang CivilCraft. Walang tab at walang layout. Maaaring ilipat, i-float, o ilagay sa sariling window ang mga side panel: tingnan ang [Ayusin ang mga panel at gumamit ng pangalawang monitor](common:arrange-panels). Mula itaas hanggang ibaba at kaliwa hanggang kanan:

- ang **app bar** (marka ng CadCraft, pangalan ng app, bersyon, About, screen mode, Tulong, I-save para sa offline, Papel at Model)
- ang **toolbar** na may pitong grupo ng button
- ang **kaliwang panel**: Site, Mga punto, Surface, Display at, kapag may na-import ka na, mga GIS layer
- ang **plan** sa gitna, na may **profile view** sa ilalim kapag bukas ito
- ang **kanang panel**: Properties ng napiling bagay
- ang **status bar** sa ibaba

## App bar

Ang manipis na bar sa pinakaitaas ay nabibilang sa site ng CadCraft, hindi sa mismong CivilCraft.

- Ipinapakita ng menu ng bersyon kung aling build ang tumatakbo.
- Binubuksan ng {{ui:Tungkol sa CivilCraft}} ang pahina ng app sa site.
- Nagpapalipat-lipat sa mga screen mode ang {{ui:Full screen}}: full screen, saka full screen na nakatago ang mga bar, saka bumabalik sa normal. Ginagawa rin ito ng {{key:Ctrl+Shift+F}} sa lahat ng platform, kasama ang Mac (Control key ang gamit doon, hindi Command). Kapag nakatago ang mga bar, ilipat ang pointer sa itaas na gilid para ibalik ang mga ito.
- Binubuksan ng {{ui:Tulong}} (o {{key:F1}}) ang help na ito sa side panel; isinasara ito ng {{key:F1}} o {{key:Esc}}.
- Itinatago ng {{ui:I-save para sa offline}} ang CivilCraft sa browser na ito para mabuksan ito nang walang koneksyon; pagkatapos ay ipinapakita nito ang {{ui:Handa offline}}. Tingnan ang [Mga file na mabubuksan, mai-save at ma-export](topic:files#online-and-offline).
- Nagpapalipat sa light at dark theme ang {{ui:Papel}} at {{ui:Model}}. Sumusunod ang plan at profile sa theme; laging nagpi-print sa puti ang mga PDF.

## Toolbar

Bawat grupo ay may maliit na label sa itaas ng mga button nito. I-hover ang isang button para makita ang tooltip at key nito.

| Grupo | Mga button | Ano ang ginagawa nila |
|---|---|---|
| File | {{ui:Bago}}, {{ui:Buksan}}, {{ui:I-save}} | Magsimula ulit, magbukas ng point file, LandXML o project, i-save ang project bilang download |
| I-export | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Sumulat ng LandXML 1.2, R12 DXF o DWG ng plan, o i-plot ang plan sa PDF |
| Surface | {{ui:Breakline}}, {{ui:Boundary}} | Gumuhit ng breakline sa mga survey point; gumuhit ng panlabas na boundary |
| Design | {{ui:Alignment}}, {{ui:Pad}}, {{ui:Pipes}}, {{ui:Profile}} | Gumuhit ng alignment, pad, o takbo ng tubo; ipakita o itago ang profile view |
| Edit | {{ui:I-undo}}, {{ui:I-redo}}, {{ui:Kopyahin}}, {{ui:I-paste}}, {{ui:Higit pa}} | I-undo, i-redo, kopyahin at i-paste ang survey points; nasa {{ui:Higit pa}} ang Gupitin, I-paste sa lugar, Duplicate, Burahin, Piliin lahat ng punto at Huwag piliin ang alinman |
| GIS | {{ui:Coordinates}}, {{ui:I-import}}, {{ui:I-export}}, {{ui:Map}} | Itakda ang coordinate system, i-import at i-export ang GIS file, ipakita ang map layer sa ilalim ng plan |
| View | {{ui:Piliin}}, {{ui:Fit}}, {{ui:3D}} | Pumili at maglipat ng mga bagay; mag-zoom para ipakita ang lahat; ipakita ang site sa 3D ([Tingnan ang site sa 3D](topic:site-3d)) |

Nananatiling nakapindot ang tool sa pagguhit habang aktibo ito. Ang muling pag-click dito, pagpindot sa {{key:Esc}}, o pagpindot sa {{key:V}} ay bumabalik sa {{ui:Piliin}}. Naka-gray out ang {{ui:I-undo}}, {{ui:I-redo}}, {{ui:Kopyahin}} at ang mga item sa {{ui:Higit pa}} kapag hindi sila makakilos; ipinapaliwanag ng tooltip kung bakit (halimbawa "Piliin muna ang survey points"). Nakalista ang bawat button sa [Toolbar reference](topic:toolbar).

Sa makitid na window, nag-s-scroll sa gilid ang toolbar.

## Kaliwang panel

### Site

- **Pangalan**: ang pangalan ng project. Ito ang pangalan ng bawat file na sine-save o ine-export at nakalimbag sa title strip ng PDF.
- **Mga unit**: {{ui:US feet}} o {{ui:Metro}}. Sinasabi nito ang ibig sabihin ng mga numero. Hindi nito kinokonberte ang coordinates kapag binago; tingnan ang [Units, station at format ng numero](topic:units-and-stations).

### Mga punto

Kapag walang laman, sinasabi nito kung paano magbukas ng point file. Kapag may mga punto, ipinapakita nito ang pangalan ng file, ang bilang ng mga punto at kung ilan ang may elevation, saka isang table ng **point group**: isang hilera bawat unang salita ng deskripsyon (GRD, FL, TBS …), na may bilang at pagpipiliang **Surface**:

- {{ui:Mga punto}}: papasok ang mga punto sa surface (ang default para sa bawat grupo).
- {{ui:Breakline}}: ang mga punto ng grupo ay pinagdurugtong, ayon sa numero ng punto, sa iisang breakline.
- {{ui:Hindi isinama}}: hindi hahawakan ng grupo ang surface.

### Surface

Mga fact tungkol sa umiiral na ground: mga punto, triangle, pinakamababa at pinakamataas na elevation, average na elevation, 2D at 3D na lawak, mga breakline, at kung may boundary. Sa ilalim ng mga fact, may kahon na naglilista ng anumang kailangang ayusin o hindi magawa ng surface builder. Pagkatapos:

- **Pinakamahabang panlabas na gilid**: ang 0 ay nagpapanatili ng bawat panlabas na triangle; ang numero ay nagtatanggal ng mahaba at manipis na triangle sa labas.
- Mga link na lumilitaw kapag may naaangkop: {{ui:Alisin ang boundary}}, {{ui:Alisin ang iginuhit na breakline}}, at, para sa surface na binasa mula sa LandXML, {{ui:Buuin muli ang surface mula sa mga punto}}.

### Display

- **Surface**: {{ui:Existing ground}} o {{ui:Proposed (graded)}}. Available ang pangalawa kapag na-grade ng pad o corridor nang walang problema.
- **Contour bawat**, **Major bawat** at **Bands** (ang bilang ng color band).
- Mga checkbox: {{ui:Contours}}, {{ui:Contour labels}}, {{ui:Triangles}}, {{ui:Elevation bands}}, {{ui:Slope arrows}}, {{ui:Mga punto}}, {{ui:Point labels}}, {{ui:Breaklines}}, {{ui:Surface edge}}, {{ui:Pipes}}.
- Lumilitaw ang legend ng elevation ng band kapag naka-on ang mga band.

Naka-save sa project ang mga setting ng display pero hindi sila undo step: hindi kailanman ibinabalik ng {{key:Mod+Z}} ang checkbox.

## Plan

Ipinapakita ng plan ang mga punto, ang surface, at lahat ng dinisenyo mo, sa plan view na nakaharap ang north pataas. I-scroll ang wheel para mag-zoom sa pointer, i-drag ang bakanteng espasyo para mag-pan. Kumpleto ang listahan sa [Mga key at mouse](topic:keyboard).

- Sa walang lamang project, ang kahon na may pamagat na **Magsimula sa survey points** ay naglilista ng mga unang hakbang at nag-aalok ng {{ui:Buksan ang sample site}}.
- Habang aktibo ang tool sa pagguhit, may hint sa itaas ng plan na nagsasabi kung ano ang i-click at paano tapusin.
- Kapag nag-drag ka ng file sa ibabaw ng plan, lumalabas ang "I-drop ang point file, LandXML o project".
- Naka-highlight ang mga napiling bagay. Ang napiling alignment o pad ay nagpapakita ng parisukat na grip sa mga PI o sulok nito; ang napiling structure ay nagpapakita ng isang grip. I-drag ang grip para ilipat ito.
- May singsing ang mga napiling survey point. Ang {{key:Shift}} at isang click ay nagdaragdag o nag-aalis ng punto; ang {{key:Shift}} at isang drag ay gumuguhit ng kahon (o, kung i-drag paikot sa kanila, lasso) na nagdaragdag ng mga punto sa loob nito. Tingnan ang [Piliin, kopyahin at i-paste ang survey points](topic:copy-paste-points).

## Profile view

Pindutin ang {{key:R}} o i-click ang {{ui:Profile}} para buksan ito sa ilalim ng plan. May ganito ang bar nito:

- listahan ng alignment (aktibo kapag may dalawa o higit pang alignment)
- {{ui:Magdagdag ng PVI}}: habang nakapindot ito, ang isang click sa profile ay nagdaragdag ng PVI ({{key:I}} ang nagpapalipat dito)
- readout ng station, ground, design elevation, grade at cut o fill sa ilalim ng pointer
- button na pang-isara

Ipinapakita ng profile ang umiiral na ground, ang design profile, mga grade sa bawat tangent, ang station at elevation ng bawat PVI, ang L at K ng bawat vertical curve kasama ang BVC at EVC nito, mataas at mababang punto, at ang vertical exaggeration. Laging kasya nito ang buong alignment: hindi ito nag-zoom o nag-pan. Kapag inilipat mo ang pointer dito, naglalagay ito ng tuldok sa alignment sa plan.

## Kanang panel: Properties

Ipinapakita ng heading nito kung ano ang ipinapakita nito.

- **Project** (walang napili): ang mga alignment at pad bilang link, ang block na **Earthwork**, at ang block na **Network ng tubo** kasama ang mga patakaran at problema nito.
- **Alignment**: pangalan, start station, haba, ang PI table, ang mga curve, ang PVI table at mga fact ng design profile, at ang mga setting ng **Corridor**.
- **Pad**: pangalan, elevation, cut at fill slope, lawak, mga fact ng daylight at earthwork.
- **Structure** o **Tubo**: mga laki, rim, invert, slope, cover at anumang problema.
- **Point** at ang numero nito: ang coordinates, elevation, deskripsyon at grupo ng punto (read only).

Nagkakabisa ang mga field kapag pinindot mo ang {{key:Enter}} o umalis sa field. Kapag hindi tinanggap ang halaga, mamarkahan itong invalid at walang magbabago.

## Status bar

- **E** at **N**: easting at northing sa ilalim ng pointer.
- **Ground** elevation doon (at **Graded** kung saan binago ng pad o corridor), o "Off the surface".
- Ang pinakamalapit na alignment (o ang napili) kasama ang **Sta** at offset (**L** o **R**) sa ilalim ng pointer.
- Sa kanan, mga mensahe: kung ano ang nangyari, o kung bakit tinanggihan ang isang bagay. Awtomatikong nawawala ang mensahe pagkaraan ng ilang segundo.

## Mga dialog

- **I-import ang mga punto**: bumubukas kasama ang bawat point file. Tingnan ang [I-import ang survey points](topic:import-points).
- **I-plot ang plan sa PDF**: tingnan ang [I-plot ang plan sa PDF](topic:plot-pdf).
- **Hindi pa na-save na pagbabago**: nagtatanong bago itapon ng {{ui:Bago}} o ng pagbubukas ng project o LandXML file ang hindi pa na-save na gawa. Dina-download muna ng {{ui:I-save ang kopya}} ang project.

## Maliliit na screen

Hanggang 760 pixels ang lapad, gaya sa telepono, pinananatili ng plan ang screen: ang toolbar ay iisang hilera na nag-s-scroll sa gilid, at ang mga panel ay bumubukas bilang sheet mula sa bar sa ilalim. Itinatago ng {{ui:Mga tool}} ang toolbar at inilalagay ito ng {{ui:Ilipat}} sa ilalim.
