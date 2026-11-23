---
title: Hindi pa nagagawa
summary: Ang hindi pa nagagawa ng build na ito ng CivilCraft, at ang dapat gawin ngayon.
keywords: nawawala, limitasyon, roadmap, hindi available, spirals, widening, dwg, dxf, inlets, detention, cross sections, darating pa, limits
from: b91588d4
---

Maaga pa ang CivilCraft. Nakalista sa pahinang ito ang mga hindi ginagawa ng kasalukuyang build, para hindi mo na hanapin ang mga ito. Walang ipinangako dito na petsa.

## Points

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Pagdaragdag ng pangalawang point file sa una | Pagsamahin muna ang mga file sa text editor o spreadsheet |
| Pag-export ng point text file | I-export ang LandXML (lalabas ang mga punto bilang CgPoints), gamitin ang GIS {{ui:I-export}} (mga punto na may P, N, E, Z at D field), o {{ui:Kopyahin}} ang mga punto papunta sa spreadsheet |
| Mga style ng point label, simbolo ayon sa description key, curve (arko) mula sa line code, description key file na ibabahagi sa pagitan ng mga proyekto | Ipinapakita ng mga label ang numero, elevation at deskripsyon, o mas kaunti pa ([CivilCraft settings](topic:settings)); naka-save ang mga key sa project file |
| Pag-convert ng unit | I-convert ang file bago mag-import; **Units** ay nagla-label lamang muli |

## Surfaces

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Higit sa isang surface na binuo mula sa mga punto | Isang proyekto bawat surface |
| Pagtatago ng (panloob na) boundary | Gamitin ang **Longest outside edge** o isang panlabas na boundary |
| Pagpili o pag-edit ng isang iginuhit na breakline | {{key:Mod+Z}}, o {{ui:Alisin ang iginuhit na breakline}} at iguhit muli |
| Pag-edit ng surface na binasa mula sa LandXML (breakline, boundary) | {{ui:Buuin muli ang surface mula sa mga punto}} |
| Pag-edit ng surface na gawa sa elevation grid | I-import muli ang grid na may ibang pagpipilian |
| Pag-convert ng surface na binasa mula sa LandXML kapag nagbago ang coordinate system | {{ui:Buuin muli ang surface mula sa mga punto}} muna |
| Naka-label na spot elevation at slope value | Basahin ang mga ito sa status bar, o kulayan ang surface ayon sa slope gamit ang **Slope analysis** sa Landscape workspace ([Grading for landscape](topic:landscape-grading#grading-checks)) |

## Mga alignment at profile

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Mga spiral maliban sa clothoid; spiral sa pagitan ng dalawang curve (compound transitions) | Available ang clothoid spiral sa mga dulo ng curve; ang iba ay pinangalanan at nilalaktawan sa LandXML import |
| Pagpasok ng PI sa pagitan ng dalawa pa | Iguhit muli ang alignment, o i-type muli ang mga coordinate ng PI |
| Alignment mula sa mga object, offset, widening | Iguhit gamit ang mga PI |
| Pag-type ng K para sa vertical curve | I-type ang L (ipinapakita ang K) |
| Pabilog at hindi simetrikong vertical curve | Symmetric parabolic curve lamang |
| Higit sa isang design profile bawat alignment | Isang alignment bawat variant |
| Pag-zoom sa profile view, mga profile band sa ilalim ng profile | Kasya sa profile view ang buong alignment; i-plot ito sa [plan and profile sheets](topic:plan-profile-sheets) |
| Section sa DWG o LandXML | Section sheet bilang PDF; {{ui:CSV}} ng mga area at volume |
| Sample line sa anggulo, o may iba't ibang lapad sa kahabaan ng kalsada | Isang lapad bawat gilid para sa buong alignment |

## Mga corridor

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Median, barrier at superelevation na umiikot sa mga template | Iguhit ang mga ito bilang template ([Corridor templates](topic:corridor-templates)); hindi pa tumatanggap ng superelevation ang mga template ayon sa station |
| Unti-unting pagbabago sa pagitan ng template ng dalawang rehiyon (transition, taper) | Palitan ang template sa isang station, o bigyan ang isang punto ng width target papunta sa linyang iginuhit bilang taper |
| Pag-ikot sa paligid ng gilid, superelevation sa LandXML | Umiikot ang superelevation sa paligid ng centerline sa pabilog na curve; palapadin ang lane gamit ang width target papunta sa feature line |
| Mga target para sa side slope (daylight papunta sa linya o surface), sariling corridor surface | Inililipat ng target ang edge of pavement at shoulder ([Corridors](topic:corridor)); ginagrade ang corridor sa proposed surface |
| Curb return, turning lane at island na ginrade sa junction; dulo ng side road na pinutol papunta sa gilid ng main road sa skew; path na pinagdurugtong sa kalsada sa plano, sa haba at area nito | Ang mga kalsadang nagtatagpo ay pinagdurugtong nang parisukat, binubuksan ang gilid ng main road at pinapatag ang side road dito ([Where roads meet](topic:corridor#where-roads-meet-roads-pads-and-paths)); humihinto ang path sa gilid ng kalsada sa proposed surface at sa 3D |
| Mga corridor na na-export bilang LandXML roadway; pangalawang corridor sa isang alignment sa IFC export | Ang proposed surface ang na-export |
| Mga terrain template na nagbabago sa proposed surface, sa 3D o sa mga section | Nagbibigay sila ng area at volume ng bawat layer ([Terrain templates](topic:corridor-templates#terrain-templates)) |
| Swept path na may bilis, tyre slip, steering time, steering trailer o body clearance; library ng karaniwang design vehicle; swept path na iginuhit sa pamamagitan ng pag-drag ng sasakyan | Mga low-speed swept path sa kahabaan ng feature line o alignment, gamit ang sarili mong laki ng sasakyan ([Vehicle swept paths](topic:swept-paths)) |

## Grading at mga volume

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Bench, bukas na feature line na ginrade sa disenyo, grading papunta sa feature line mula sa ibang lugar | Isara ang feature line ([Feature lines](topic:feature-lines)), o gamitin ito bilang breakline ng umiiral na ground |
| Pagpasok o pagtanggal ng vertex ng feature line | Iguhit muli ang linya, o gumawa ng stepped offset nito |
| Arko sa mga iginuhit na breakline (dumaraan sa mga survey point), spiral sa feature line | Iguhit ang feature line na may arko at gamitin ito bilang breakline ng umiiral na ground |
| Grading papunta sa distansya, elevation o ibang surface | Daylight papunta sa umiiral na ground lamang |
| Pagdaragdag o pagtanggal ng sulok ng pad | Burahin ang pad at iguhit muli |
| Volume na TIN-to-TIN (prism), pagpili ng laki ng grid cell | Grid method, laki ng cell na pinili para sa iyo |
| Swell at shrink, topsoil, lalim ng pavement | Ikaw mismo ang maglapat ng factor sa mga iniulat na numero |
| Free-haul at overhaul na gastos, haul sa pagitan ng magkakaibang alignment, borrow pit at waste site na inilagay sa plano | Ang mass-haul diagram na may balance point, mga volume na nailipat at average na haul distance |

## Mga pipe network

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Higit sa isang network bawat proyekto | Magkahiwalay na proyekto para sa storm at sanitary |
| Water mains: kalidad at edad ng tubig, rule-based na control, iba pang uri ng valve (flow control, throttle, sustaining), pump na ibinibigay ayon sa power, demand na nakadepende sa pressure, opsyong Darcy–Weisbach, pipe catalogue na may kapal ng pader at pressure class. Ang natitirang pressure network ay nasa lab: [Water mains](topic:water-mains) | Suriin ang mga iyon sa water distribution software; nasa [Sanitary design flows](topic:sanitary-design) ang sanitary design flow |
| Daloy ng sewer sa paglipas ng panahon (hydrograph, dynamic routing, storage, pump, overflow) | Ibinibigay ng [Sanitary design flows](topic:sanitary-design) ang tuloy-tuloy na peak flow na ginagamit ng design sheet |
| Kapasidad ng inlet, gutter spread, detention routing, hydrograph, energy loss maliban sa iisang junction coefficient | Suriin ang mga ito sa ibang software; nasa [Storm drainage](topic:storm-drainage) ang mga daloy, laki at grade line |
| Catchment sa PDF plot, DWG, DXF o LandXML; catchment mula sa surface (watershed) | Iguhit nang mano-mano ang mga catchment; naka-save ang mga ito sa project file |
| Pipe catalog, hindi bilog na pipe, structure na hindi tuwid na box o silindro (cone, step, benching), kategorya ng drainage sa library | Uri ng structure mula sa mga parameter ([Pipe network](topic:pipe-network)); pipe na may diameter |
| Pipe sa profile view, kurbadong pipe | Basahin ang invert at cover sa right panel |

## Mga parcel

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Pagla-layout ng lot ayon sa area o frontage, parcel mula sa mga linyang nakapaligid, right-of-way | Iguhit ang bawat parcel ayon sa mga sulok nito, o ilagay ang mga call nito |
| Curve table at line table sa plano; mga label na inilipat nang mano-mano | Naka-label sa kahabaan ng sarili nito ang bawat course |
| Parcel sa LandXML | Naka-save ang mga parcel sa project file at napupunta sa PDF, DWG at DXF |

## Traverse

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Least-squares adjustment, transit rule, pagtimbang ng anggulo laban sa distansya | Ang compass rule |
| Deflection angle, zenith angle at slope distance, elevation sa pamamagitan ng trigonometric leveling | Ibawas sa tamang horizontal distance at anggulo, o bearing |
| Side shot, raw data file mula sa data collector | I-import ang mga punto bilang point file |

## Staking

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Offset stake (reference point na nakaatras mula sa stake), slope stake sa catch point | Mag-stake sa mga offset na kailangan mo, kasama ang lampas sa shoulder |
| Pagpapadala ng stake nang diretso sa sariling format ng data collector | Bumubukas ang CSV sa office software ng karamihan sa mga data collector |
| Pag-stake ng pipe, pad at parcel | Gamitin ang mga survey point malapit sa alignment, o ang mga course ng parcel |

## Mga file at output

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Text, hatch at dimension mula sa DWG o DXF; paper space; naka-link na drawing (xref); binary DXF | Nabubuksan ang linework mula sa model space ([Open a DWG or DXF as linework](topic:open-dwg-dxf)); buksan nang hiwalay ang mga naka-link na drawing |
| Paglipat ng ilang punto nang sabay sa pamamagitan ng pag-drag | I-cut at i-paste ang mga ito, o i-edit nang isa-isa |
| Portrait sheet, sarili mong title block, viewport na ikaw ang nag-aayos, plan at profile sheet sa DWG | Isang landscape plan sheet bawat PDF, o plan at profile sheet sa kahabaan ng alignment (PDF) |
| Pag-plot ng elevation band at profile | Sa screen lamang ang band; kumuha ng screenshot kung kailangan mo ang mga ito |
| Pagpalit ng pangalan ng layer, kulay o style ng label | Palitan ang mga ito sa CAD program pagkatapos ng DXF export |
| Cloud saving at version history | I-save ang mga file na `.civilcraft.json` at panatilihing may backup; para sabay na gumawa sa isang proyekto, gamitin ang live session sa CadCraft Studio ([Design one site together, live](topic:work-live)) |
| CadCraft Studio para sa iPad at iPhone, at mula sa Google Play | Gamitin ang CivilCraft sa browser ng device; sa Android, nae-install ang CadCraft Studio mula sa APK nito sa getcadcraft.com/download |
| Pagbubukas ng ilang point o project file nang sabay | Isang file bawat bukas (ang mga GIS file na magkakaugnay, gaya ng mga bahagi ng shapefile, ay sabay na nabubukas) |

## Landscape

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Mga head at nozzle ng manufacturer | Generic na head, o magdagdag ng sarili mong head mula sa file; papasok ang datos ng gumawa habang pinapayagan nila |
| Pinakamataas na lateral length para sa drip line, daloy sa paglipas ng panahon, pump, looped pipe network | Panatilihin ang drip run sa haba na nakalathala ng gumawa; kailangan ng check ang branching network |
| Eksaktong balangkas ng concave freeform object; ang volume nito sa ilalim ng lupa na eksaktong sinukat | Ang convex hull ang ginagrade at ang volume sa ilalim ng lupa ay tantya (sinasabi sa Properties) |
| Mga halaman sa sariling Place from library ng BimCraft at ModelCraft | I-export ang landscape IFC at buksan ito sa BimCraft sa tabi ng gusali |
| Detalyadong plant model (dahon, sanga, panahon) sa 3D view; freeform object at irigasyon sa 3D view | Lumalabas ang mga halaman sa 3D bilang simpleng anyo na sukat ayon sa plant list ([View the site in 3D](topic:site-3d)); ang scatter ng ModelCraft ang gumagawa ng larawan ng pagtatanim |
| Hardscape na pader na nagpipigil ng graded na lebel sa likod nito sa surface | Bigyan ng patayong gilid ang platform o pad: ang mga ito ay retaining wall sa surface ([Grading](topic:grading)) |
| SVG transform sa sarili mong simbolo; texture at kulay ng sarili mong GLB plant model; compressed GLB geometry | I-flatten muna ang mga transform sa drawing program; iginuguhit ang mga model sa kulay ng halaman; i-export ang GLB nang walang compression ([Plant graphics](topic:plant-graphics)) |
| Sarili mong plant list na nakatago sa iyong Library account (ini-edit sa app) | I-edit ang sariling listahan ng proyekto sa Plant table at i-save ito bilang plants file |
| Ang landscape tools para sa assistant na walang window (file server at command line) | Gumagana ang mga ito kapag bukas ang CivilCraft window ([Let an AI assistant work with your site](topic:assistants)) |

## Power line

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Standard ng isang bansa na naka-built in (load case, clearance, factor) | Itakda ang mga halaga ng iyong standard sa {{ui:Load case at limits…}} at i-save ang mga ito, kasama ng iyong library, bilang pack na magagamit at maibabahagi ulit ([Packs](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Ang pahalang na distansya mula sa conductor patungo sa korona ng puno o pader sa tabi ng linya | Ang clearance nang tuwid pataas sa mga halaman at pader na tinatawid ng linya ([Power-line checks](topic:power-line-checks#clearances)) |
| Conductor creep at pag-unat ng bagong conductor | Isaalang-alang ang mga ito sa pamamagitan ng mga temperatura sa stringing table |
| Thermal rating ng nakabaong cable (current rating mula sa paraan ng pagkakalatag) | Ilagay ang current rating ng supplier mo sa cable item |
| Short-circuit, protection at earthing study | Gumamit ng nakalaang electrical program; ibinibigay ng CivilCraft ang haba at cable ng network |
| Lattice tower na dinidisenyo member kada member, at stay anchor sa lupa | Sinusuri ang mga support ayon sa nominal load nito; ang stay ayon sa rated load nito |
| Isang `.DON` study file na sinusuri sa program na nagbabasa nito | Suriin ang file doon; magpadala sa amin ng sample para masubukan namin laban sa totoong file |
| Power line sa 3D view at sa IFC | Ang plano, line profile, mga sheet at GIS layer |
| Ang power-line tools para sa assistant na walang window | Gumagana ang mga ito kapag bukas ang CivilCraft window ([Let an AI assistant work with your site](topic:assistants)) |

## Mga building mass

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Library ng zoning code o alinmang tuntunin ng lungsod | I-type ang mga limit mula sa sarili mong ordinansa ([Zoning limits](topic:zoning-limits)) |
| Liwanag ng langit sa mga pader (daylight sa facade), hangin | Direktang sikat ng araw lamang ang binibilang ng [Sun hours](topic:sun-hours) |
| Lilim mula sa puno, halaman o anumang hindi iginuhit bilang mass | Iguhit ang mga kalapit na gusali bilang mass |
| Hugis ng bubong sa mass | Mass na patag ang tuktok |
| Mga opening, bubong at uri ng pader kapag binuo ang mass sa BimCraft | Gumagawa ang BimCraft ng payak na panlabas na pader sa bawat level at sahig; idagdag doon ang natitira |

## GIS at coordinate system

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| File Geodatabase; KML style, icon, ground overlay at network link | I-convert muna sa GeoPackage, shapefile o GeoJSON; nababasa ang KML placemark nang walang style nito |
| Pag-edit ng GIS feature o mga attribute nito | I-edit ang mga ito sa GIS program at i-import muli. Gumagawa ang Analyze panel ng bagong layer (buffer, overlay, join, selection) at nagdaragdag ng area at length field, pero hindi nito ina-edit nang direkta ang isang feature |
| Network at raster analysis, buffer na may flat o square na dulo at one-sided buffer, pagdaragdag o pagtanggal ng row at pagpalit ng uri ng field sa attribute table, manual na kulay ng klase, style legend sa mga plot | Gamitin ang Select para pumili ng mga feature at gumawa ng layer mula sa mga ito; hindi inaalok ang flat na dulo. Nabuo na ang pagkukulay ayon sa attribute at ang attribute table: tingnan ang [Style a layer by an attribute](topic:gis-symbology) at [Work with a layer's attribute table](topic:gis-table) |
| Label style (laki, posisyon) at mga label na umiiwas sa isa't isa | Iisa ang laki ng mga label at maaaring magkapatong kung siksik ang mga feature |
| Vertical datum at geoid model | Ginagamit ang mga elevation ayon sa ibinibigay ng file; ikaw mismo ang mag-check ng vertical datum |
| Grid shift maliban sa NAD27 papuntang NAD83 na iminungkahi ayon sa area (OSTN15, NTv2 para sa ibang datum na gumagana kapag idinagdag mo ang file), ilang grid nang sabay, vertical grid | Idagdag mismo ang grid file para sa iyong datum; isang grid bawat proyekto |
| Map layer sa DXF o sa 3D export | Napupunta ang map layer sa PDF plot, at sa tabi ng DWG bilang larawan |
| Map server na nangangailangan ng sign-in, key o token | Gumamit ng pampublikong serbisyo, o georeferenced na image file |
| Pagsusulat ng LAS o LAZ file mula sa surface, ground model o mga tool ng elevation grid at LiDAR | I-export ang surface bilang GeoTIFF elevation grid. Nagsusulat ang add-on na [Point clouds](topic:point-clouds) ng nalinis na cloud bilang LAS 1.4 o LAZ |
| LiDAR intensity, kulay at return; elevation grid na may ilang band; grid o LiDAR file na lampas sa 200 MB | Ang LiDAR ay sinasala ayon sa klase lamang, ginagamit ng mga grid ang kanilang unang band; hatiin muna sa mga tile ang malalaking file |

## Input

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Box selection sa pamamagitan ng touch (kailangan nito ang {{key:Shift}}) | I-long-press ang bawat survey point para idagdag ito |
| Mga na-type na coordinate o distansya habang gumuguhit | Gumuhit nang tantiya, saka i-type ang eksaktong coordinate ng PI sa PI table ng alignment |
| Pag-type ng coordinate para sa sulok ng pad at structure | I-drag ang kanilang grip; mag-zoom in para sa katumpakan at tingnan ang E at N sa status bar |
| Pag-snap sa mga object (maliban sa survey point para sa breakline) | Mag-zoom in at tingnan ang status bar |

## 3D view

| Hindi pa nagagawa | Sa halip, sa ngayon |
|---|---|
| Pagguhit o pag-edit sa 3D view | Gumuhit at mag-edit sa plano; sinusundan ng 3D view ang bawat pag-edit |
| Pagpili ng corridor feature line o GIS feature sa pamamagitan ng pag-click sa 3D | I-click ang mga ito sa plano |
| Pag-export ng pinalaking view o sa feet | Tunay na sukat sa metro ang mga export; tingnan ang [Export the site in 3D](topic:export-3d) |
| Mga label sa GLB o OBJ export, laki at style ng label sa 3D | Sa 3D view lang lumalabas ang mga label, iisa ang laki; tingnan ang [View the site in 3D](topic:site-3d) |
| Mga texture mula sa litrato, pag-record ng biyahe bilang video, anino mula sa labas ng site, sun hours na ipinapakita sa 3D view | Mga map layer na nakatakip sa mga surface; biyahe at posisyon ng araw sa isang oras; [sun hours](topic:sun-hours) para sa isang araw o panahon sa plano |
