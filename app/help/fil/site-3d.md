---
title: Tingnan ang site sa 3D
summary: Buksan ang 3D view, umikot, mag-pan at mag-zoom, itakda ang vertical exaggeration at kulay, piliin kung ano ang ipapakita, at i-click ang mga alignment, pad, feature line, breakline, pipe, structure at point para piliin ang mga ito.
keywords: labels, 3d labels, billboard, labels facing the camera, station labels, contour labels, point labels, drape, aerial, map layers on the surface, 3d, three d, 3d view, view cube, compass, orbit, perspective, parallel, isometric, iso, vertical exaggeration, terrain, model, site model, fly around, visualize, render, pipes in 3d, structures, manholes, corridor 3d, road in 3d, road surface, lanes, curbs, sidewalks, plants in 3d, trees in 3d, shrubs, hedges, landscape 3d, ramps in 3d, steps, walls, paving, hardscape 3d
from: a16bafe1
---

Ipinapakita ng 3D view ang site bilang iisang model: ang kasalukuyang lupa at ang naka-grade na surface, ang contour na naka-drape sa mga ito, mga breakline at ang gilid ng surface, bawat alignment sa design profile nito kasama ang station tick, ang mga feature line ng corridor at ang mismong kalsada (mga lane, shoulder, gutter, curb, strip at sidewalk, bawat isa sa sariling kulay), mga pad kasama ang kanilang daylight line, ang network ng pipe na may pipe at structure sa tunay nilang elevation, at mula sa Landscape workspace, ang mga halaman, paving, path, pader, kerb, ramp at hagdan. Binabasa nito ang parehong proyektong binabasa ng plan, kaya lumilitaw sa pareho ang bawat pagbabago.

## Buksan ang 3D view

1. Buksan ang survey point (o isang LandXML o project file) para may surface. Sapat na rin ang mga halaman, paving o ramp lamang para mabuksan ito.
2. Pindutin ang {{key:D}}, o i-click ang {{ui:3D}} sa grupong {{ui:View}} ng toolbar.
   Magbubukas ang 3D view sa ibabaw ng plan, nakatingin sa buong site mula sa timog-silangan. Sa unang pagkakataon, may kaunting oras bago ito mag-load.
3. Pindutin muli ang {{key:D}}, o i-click muli ang {{ui:3D}}, para bumalik sa plan. Ang pagpili ng drawing tool tulad ng {{ui:Alignment}} o {{ui:Pad}} ay bumabalik din sa plan, dahil doon nangyayari ang pagguhit.

## Gumalaw sa paligid

| Para | Gawin ito |
|---|---|
| Umikot | I-drag gamit ang kaliwa o gitnang button |
| Mag-pan | I-drag gamit ang kanang button, o {{key:Shift}} at i-drag |
| Mag-zoom | Ikutin ang wheel; nag-zo-zoom ito patungo sa pointer |
| Umikot sa trackpad | Mag-swipe gamit ang dalawang daliri ({{key:Shift}} at swipe ay nag-pan) |
| Mag-zoom sa trackpad | Pinch |
| Touch | Umiikot ang isang daliri; nag-zo-zoom ang dalawang daliri sa pinch at nagpe-pan sa paggalaw |
| Mga key (nakatutok ang view) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} para umikot, at kapag may {{key:Shift}} ay nag-pan; {{key:Plus}} at {{key:Minus}} para mag-zoom |

Ang bar sa ibabaw ng view ay may natitira pa:

- Ang listahan ng view: **Iso**, **Top**, **Bottom**, **Front** (nakatingin sa hilaga), **Back**, **Left**, **Right**.
- {{ui:Perspective}}: kapag nakapindot, perspective view ito; i-click para sa parallel projection (walang foreshortening).
- {{ui:Extents}}: ipinapakita muli ang lahat. Ang {{key:F}} ay gumagawa ng pareho habang bukas ang 3D view.

## Ang view cube

Ang view cube sa kanang itaas na sulok ay umiikot kasabay ng view. I-click ang isang gilid, edge o sulok para tingnan ang site mula roon (maayos na umiikot ang camera maliban kung humihiling ang inyong sistema ng nabawasang galaw). I-drag ang cube para umikot sa paligid. Ang compass ring sa ilalim nito ay nagpapakita ng north (grid north, +Y): i-drag ang ring para paikutin ang site sa vertical, o i-click ang N, E, S o W para tumingin mula sa gilid na iyon. Ang {{ui:Home}}, ang maliit na bahay sa kaliwang itaas nito, ay bumabalik sa iso view ng buong site. Gamit ang keyboard: {{key:Tab}} papunta sa cube, pinipili ng mga arrow ang gilid, edge o sulok, at {{key:Enter}} ay tumitingin mula roon.

Sa plan, ipinapakita ng parehong cube ang tuktok. I-click ang alinmang ibang gilid, edge o sulok (o i-drag ito) para buksan ang 3D view na nakatingin mula roon: ito ang pinakamabilis na paraan papunta sa 3D mula sa isang direksyon. Para palitan ang cube ng maliit na axis icon, o itago ito, tingnan ang **Corner indicator** sa [CivilCraft settings](topic:settings).

## I-exaggerate ang elevation

Kadalasang mas malapad ang mga site kaysa sa taas nila, kaya iniuunat ang elevation nang **2×** sa umpisa. Pumili ng **1×**, **2×**, **3×**, **5×** o **10×** sa listahan sa bar, o sa ilalim ng **3D vertical exaggeration** sa [CivilCraft settings](topic:settings) (iisang setting ang dalawa). Ang view lamang ang nagbabago: nananatili sa tunay na sukat ang mga volume, profile at export.

## Kulayan ang surface

- **Elevation bands**: ang parehong banda at kulay gaya ng elevation band ng plan (itinatakda ang bilang ng banda sa ilalim ng **Display** sa kaliwang panel). Pinuputol nang eksakto sa elevation nito ang bawat gilid ng banda.
- **One colour**: ang kasalukuyang lupa at ang naka-grade na surface, bawat isa sa payak na kulay.
- **Map layers**: ang mga map layer na nakikita sa ilalim ng plan (isang georeferenced na larawan, map tile o map service; tingnan ang [Map layers](topic:map-layers)) na ipinapatong sa mga surface na parang sheet, para lumitaw sa burol ang aerial photo. Ang mga larawang dumarating pa ay napupuno habang dumarating. Kapag walang map layer na nakikita, pinananatili ng mga surface ang kanilang elevation band at sinasabi ito ng view. Para sa screen ang larawan: hindi ito dala ng GLB at OBJ export.

Kapag pareho ang surface na nakikita, ang kasalukuyang lupa ay nakikita sa ibabaw ng naka-grade na surface, kaya makikita ninyo ang cut (lupang nasa itaas ng disenyo) at ang fill.

## Piliin kung ano ang ipapakita

I-click ang {{ui:Show}} sa bar at lagyan o alisin ang tsek ng:

| Item | Ano ito |
|---|---|
| Existing ground | Ang surface na binuo mula sa survey point (o binasa mula sa LandXML) |
| Graded surface | Ang kasalukuyang lupa kasama ang mga corridor at pad na naka-grade (lumilitaw lamang kapag may ilan) |
| Triangle edges | Bawat edge ng TIN, bilang linya |
| Contours | Minor at major contour ng bawat ipinapakitang surface, sa interval ng plan |
| Surface edge | Ang panlabas na gilid ng bawat ipinapakitang surface, sa mga elevation nito |
| Breaklines | Bawat breakline, sa mga elevation nito |
| Alignments and stations | Bawat alignment sa design profile nito (sa lupa kapag walang profile), kasama ang tick bawat 50 ft o 20 m |
| Corridor feature lines | Edge of pavement, shoulder at daylight sa magkabilang gilid |
| Road surfaces | Ang kalsadang itinatayo ng bawat corridor, mula sa assembly nito: mga lane, shoulder, gutter, curb, strip at sidewalk, bawat isa sa sariling kulay, sa naka-grade na surface |
| Plants | Bawat halaman, at ang mga halaman sa kama at bakod, bilang payak na hugis na nakabatay sa plant list: ang puno ay trunk at bilog na korona (cone para sa conifer, tuft sa matangkad na trunk para sa palm), ang shrub, hedge plant, perennial at groundcover ay dome, ang damo ay tuft, ang climber ay manipis na column. Nakatayo ang mga ito sa naka-grade na surface (o sa kasalukuyang lupa) sa sukat na ipinapakita ng plan: hinog, o sa pagtatanim |
| Hardscape | Paving at path kasama ang kanilang fall, pader, kerb, hagdan, at ramp na umaakyat sa mga takbo na may level landing sa pagitan |
| Pads and daylight | Ang outline ng bawat pad sa elevation nito at ang daylight line nito |
| Pipes and structures | Mga pipe bilang bilog na pipe sa pagitan ng invert nila, mga structure mula rim hanggang sump |
| Survey points | Isang tuldok sa bawat point na may elevation (naka-off sa umpisa) |
| GIS layers | Ang mga GIS layer na nakikita sa plan, sa kanilang kulay: mga linya at outline sa sarili nilang elevation sa mga elevation na iyon, ang iba ay nakalatag sa kasalukuyang lupa (sumusunod ito nang eksakto); ang point ay maliliit na krus. Hindi kasama ang mga hugis na walang elevation na nasa labas ng surface, at sinasabi ng view kung ilan ang mga ito |
| Labels | Mga pangalan at value na laging nakaharap sa inyo: ang pangalan ng bawat alignment sa simula nito at ang mga station nito bawat 100 ft (o 100 m), ang elevation ng bawat major contour, pad, feature line at structure ayon sa pangalan, at kapag naka-tsek ang **Survey points**, ang numero at elevation ng bawat point |

Nananatili ang laki ng mga label at nakatayo nang tuwid anuman ang pag-ikot o zoom ninyo, at ang burol sa harap ng label ay tinatakpan ito. Kapag magkakasikip sila, ang pinakamahalaga ang lumilitaw at ang iba ay naghihintay hanggang mag-zoom in kayo: unang ang alignment, sunod ang structure, pad, feature line, station, contour at point, at ang mas malapit ang nauuna. Nasa screen lamang sila; wala sila sa mga export at plot.

Naaalala sa browser na ito ang inyong mga pinili, ang exaggeration at ang kulay.

Itinatayo ang kalsada sa kasalukuyang lupa. Sa alignment at corridor pero walang survey point o surface pa, iginuguhit ang kalsada sa pansamantalang patag na lupa: sa karaniwang elevation ng design profile nito, o pantay sa elevation 0 kapag wala ring profile. May babala sa ibaba ng 3D view at sa properties ng corridor na nagsasabi nito. Larawan lamang ito: walang volume o section na galing dito. Buksan ang survey point o surface at lilipat ang kalsada sa totoong lupa nang kusa.

Iniuunat ng vertical exaggeration ang lupa, hindi ang mga halaman: nakatayo ang mga ito sa naka-exaggerate na lupa sa tunay nilang taas at lapad, kaya mukhang puno ang puno sa anumang setting. Payak na hugis ang mga halaman, hindi detalyadong model: nananatiling mabilis paikutin at i-zoom kahit libo-libo ang mga ito.

## Mga pipe at structure

- Iginuguhit ang pipe na ang ilalim nito ay nasa loob ng invert na itinakda ninyo, at ang itaas nito (ang crown) ay isang inside diameter na mas mataas. Nasa pulgada ang diameter sa feet na proyekto at sa millimeter sa metric na proyekto, gaya ng nasa kanang panel.
- Ang structure ay tumatakbo mula sa rim nito (ita-type, o mula sa surface) pababa sa sump nito (ang pinakamababang invert minus ang lalim ng sump). Kapag walang anumang invert, iginuguhit ito na 5 ft (1.5 m) ang lalim.
- Ang mga pipe at structure na may problema (tingnan ang network check sa kanang panel) ay iginuguhit sa pula.
- Hindi iginuguhit ang pipe na walang invert; sinasabi ng tala sa ilalim ng view kung ilan ang mga ito.

## Pumili mula sa 3D view

I-click ang alignment (o ang kalsada nito), isang pad, feature line, pipe, structure, survey point, halaman, ramp o iba pang hardscape. Napipili ito gaya ng kung na-click ninyo ito sa plan: bubukas ang mga properties nito sa kanang panel, kung saan maaari ninyo itong i-edit, at iginuguhit ito sa kulay ng pagpili sa ibabaw ng lahat sa 3D. Ang anumang piliin ninyo sa plan ay naka-highlight din sa 3D. May tip sa tabi ng pointer na nagpapangalan sa na-click ninyo kasama ang easting, northing at elevation nito. Maaaring i-click ang mga pipe at structure kahit nasa ilalim ng lupa ang mga ito; hindi maaaring i-click sa pamamagitan ng burol ang linyang nakatago sa likod nito.

I-click ang breakline para malaman kung alin ito: naka-highlight ito, at pinangangalanan ito ng status bar (walang sariling properties ang mga breakline).

I-click ang lupa para mabasa ang easting, northing at elevation doon sa tip.

## Magmaneho sa kahabaan ng alignment

I-click ang **Drive** sa 3D bar at pumili ng alignment. Lilipat ang view sa upuan ng driver: 3.5 ft (1.07 m) sa ibabaw ng kalsada, sa design profile nito (sa kasalukuyang lupa sa kahabaan ng centerline kapag wala pa itong profile), nakatingin pasulong sa kahabaan nito.

- Ang **Play** o {{key:Space}} ay nagmamaneho sa bilis na pipiliin ninyo (10 hanggang 65 mph, o 15 hanggang 100 km/h); ang {{key:Space}} muli ay humihinto. Humihinto ito sa dulo; ang **Play** ay nagsisimula muli mula sa umpisa.
- Ang slider ay tumatalon sa anumang station; ang {{key:Left}} at {{key:Right}} ay humahakbang ng 10 ft (5 m) pabalik at pasulong.
- Ang pag-drag sa view ay humihinto at nagpapahintulot na tumingin sa paligid.
- Ang **Stop** o {{key:Esc}} ay ibinabalik ang view sa dating lagay nito.

Nalalapat din ang vertical exaggeration habang nagmamaneho: itakda ito sa 1× para makita ang kalsada kung paano ito itatayo.

## Liwanag mula sa araw

Buksan ang **Sun** sa 3D bar at lagyan ng tsek ang **Light from the sun**. Ibigay ang petsa, oras sa orasan at ang time zone nito (ang offset mula sa UTC: sa tag-init, ang daylight saving na isa), at ang latitude at longitude ng site. Kapag may coordinate system ang proyekto, napupunan ang mga ito mula roon.

Naiilawan ang site mula sa kinaroroonan ng araw, na may **Shadows** sa ibabaw ng lupa, corridor at pad; sinasabi ng menu ang azimuth ng araw at kung gaano ito kataas, o kung nasa ilalim ito ng horizon. Galing sa solar equation ng NOAA ang mga posisyon. Tama ang direksyon ng anino sa anumang exaggeration, pero humihinto ang mga ito sa gilid ng site: ang mga burol at gusaling lampas dito ay walang inihahagis na anino.

## I-export ang 3D view

I-click ang {{ui:GLB}} o {{ui:OBJ}} sa bar. Ang ipinapakita ng view ay sine-save sa tunay na sukat (walang exaggeration), sa metro, na ang Y ay pataas. Mga detalye: [Export the site in 3D](topic:export-3d).
