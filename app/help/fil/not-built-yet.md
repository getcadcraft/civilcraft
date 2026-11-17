---
title: Hindi pa ginagawa
summary: Ano ang hindi pa ginagawa ng build na ito ng CivilCraft, at ano ang gagawin ngayon sa halip.
keywords: nawawala, limitasyon, roadmap, hindi available, spirals, widening, dwg, dxf, inlets, detention, cross sections, darating pa, limits
from: a2d970ef
---

Maaga pa ang CivilCraft. Inililista ng pahinang ito ang hindi pa ginagawa ng kasalukuyang build, para hindi mo ito hanapin. Walang petsang ipinangako para sa alinman dito.

## Mga punto

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Pagdadagdag ng pangalawang point file sa una | I-join muna ang mga file sa text editor o spreadsheet |
| Pag-export ng point text file | I-export ang LandXML (lalabas ang mga punto bilang CgPoints), gamitin ang GIS {{ui:I-export}} (mga punto na may P, N, E, Z at D field), o {{ui:Kopyahin}} ang mga punto sa spreadsheet |
| Mga style ng point label, symbol bawat description key, curve (arko) mula sa line code, file ng description key na ibabahagi sa pagitan ng mga project | Ipinapakita ng mga label ang numero, elevation at description, o mas kaunti pa ([Mga setting ng CivilCraft](topic:settings)); naka-save ang mga key sa project file |
| Pag-convert ng unit | I-convert ang file bago i-import; **Units** lang ang nagre-relabel |

## Mga surface

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Higit sa isang surface na ginawa mula sa mga punto | Isang project bawat surface |
| Itago ang (panloob na) boundary | Gamitin ang **Longest outside edge** o isang panlabas na boundary |
| Pagpili o pag-edit ng isang iginuhit na breakline | {{key:Mod+Z}}, o {{ui:Alisin ang iginuhit na breakline}} at iguhit muli |
| Pag-edit ng surface na binasa mula sa LandXML (breakline, boundary) | {{ui:Buuin muli ang surface mula sa mga punto}} |
| Pag-edit ng surface na ginawa mula sa elevation grid | I-import muli ang grid na may ibang pagpipilian |
| Pag-convert ng surface na binasa mula sa LandXML kapag nagbago ang coordinate system | {{ui:Buuin muli ang surface mula sa mga punto}} muna |
| Mga naka-label na spot elevation at halaga ng slope | Basahin ang mga ito sa status bar, o kulayan ang surface ayon sa slope gamit ang **Slope analysis** sa Landscape workspace ([Grading for landscape](topic:landscape-grading#grading-checks)) |

## Mga alignment at profile

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Spiral na hindi clothoid; spiral sa pagitan ng dalawang curve (compound transitions) | Available ang clothoid spirals sa mga dulo ng curve; ang iba ay pinangalanan at nilalaktawan sa LandXML import |
| Pagsisingit ng PI sa pagitan ng dalawa pa | Iguhit muli ang alignment, o i-type muli ang mga coordinate ng PI |
| Mga alignment mula sa mga object, offset, widening | Iguhit sa pamamagitan ng mga PI |
| Pag-type ng K para sa vertical curve | I-type ang L (ipinapakita ang K) |
| Pabilog at hindi simetrikong vertical curve | Symmetric parabolic curves lang |
| Higit sa isang design profile bawat alignment | Isang alignment bawat variant |
| Pag-zoom sa profile view, mga profile band sa ilalim ng profile | Kasya sa profile view ang buong alignment; i-plot ito sa [plan and profile sheets](topic:plan-profile-sheets) |
| Mga section sa DWG o LandXML | Section sheet bilang PDF; {{ui:CSV}} ng mga lawak at volume |
| Sample line na may anggulo, o may magkakaibang lapad sa kahabaan ng kalsada | Isang lapad bawat gilid para sa buong alignment |

## Mga corridor

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Median, barrier at superelevation na umiikot sa mga template | Iguhit ang mga ito bilang template ([Corridor templates](topic:corridor-templates)); hindi pa kinukuha ng mga template ayon sa station ang superelevation |
| Unti-unting pagbabago sa pagitan ng template ng dalawang rehiyon (transitions, tapers) | Baguhin ang template sa isang station, o bigyan ang isang punto ng width target sa linyang iginuhit bilang taper |
| Pag-ikot sa paligid ng gilid, superelevation sa LandXML | Umiikot ang superelevation sa centerline sa mga pabilog na curve; palawakin ang lane gamit ang width target sa feature line |
| Mga target para sa side slope (daylight hanggang sa linya o surface), sariling corridor surface | Gumagalaw ang mga target sa gilid ng pavement at shoulder ([Corridors](topic:corridor)); ginagrado ang corridor sa proposed surface |
| Corridor na ine-export bilang LandXML roadway; pangalawang corridor sa isang alignment sa IFC export | Ang proposed surface ang ine-export |
| Terrain template na nagbabago sa proposed surface, sa 3D o sa mga section | Nagbibigay ang mga ito ng lawak at volume ng bawat layer ([Terrain templates](topic:corridor-templates#terrain-templates)) |
| Swept path na may bilis, tyre slip, steering time, steering trailer o body clearance; library ng standard design vehicle; swept path na iginuhit sa pamamagitan ng pag-drag ng sasakyan | Low-speed swept path sa kahabaan ng feature line o alignment, gamit ang sarili mong laki ng sasakyan ([Vehicle swept paths](topic:swept-paths)) |

## Grading at mga volume

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Bench, bukas na feature line na ginrado sa design, grading papunta sa feature line mula sa ibang lugar | Isara ang feature line ([Feature lines](topic:feature-lines)), o gamitin ito bilang breakline ng umiiral na lupa |
| Pagsisingit o pag-alis ng vertex ng feature line | Iguhit muli ang linya, o gumawa ng stepped offset nito |
| Arko sa mga iginuhit na breakline (dumadaan sa survey point), spiral sa feature line | Iguhit ang feature line na may arko at gamitin ito bilang breakline ng umiiral na lupa |
| Grading papunta sa distansya, elevation o ibang surface | Daylight sa umiiral na lupa lang |
| Pagdadagdag o pag-alis ng corner ng pad | Burahin ang pad at iguhit muli |
| Volume ng TIN-to-TIN (prism), pagpili ng laki ng grid cell | Grid method, laki ng cell na pinili para sa iyo |
| Swell at shrink, topsoil, lalim ng pavement | Ilapat ang mga factor sa iniulat na mga bilang nang ikaw mismo |
| Free-haul at overhaul na gastos, haul sa pagitan ng magkakaibang alignment, borrow pit at waste site na inilagay sa plan | Ang mass-haul diagram na may balance point, mga volume na nailipat at average na haul distance |

## Mga pipe network

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Higit sa isang network bawat project | Hiwalay na project para sa storm at sanitary |
| Water mains: kalidad at edad ng tubig, rule-based controls, iba pang uri ng valve (flow control, throttle, sustaining), mga pump na binigyan ng power, demand na nakadepende sa pressure, opsyong Darcy–Weisbach, catalogue ng pipe na may kapal ng pader at pressure class. Ang natitira sa pressure network ay nasa lab: [Water mains](topic:water-mains) | Suriin ang mga iyon sa water distribution software; nasa [Sanitary design flows](topic:sanitary-design) ang sanitary design flow |
| Daloy ng sewer sa paglipas ng panahon (hydrograph, dynamic routing, storage, pump, overflow) | Ang [Sanitary design flows](topic:sanitary-design) ang nagbibigay ng steady peak flow na ginagamit ng design sheet |
| Kapasidad ng inlet, gutter spread, detention routing, hydrograph, pagkawala ng enerhiya maliban sa isang junction coefficient | Suriin sa ibang software; ang mga daloy, laki at grade line ay nasa [Storm drainage](topic:storm-drainage) |
| Catchment sa PDF plot, DWG, DXF o LandXML; catchment mula sa surface (watershed) | Iguhit ang catchment nang manu-mano; naka-save ang mga ito sa project file |
| Catalogue ng pipe, hindi bilog na pipe, structure na hindi tuwid na kahon o silindro (cone, step, benching), kategorya ng drainage sa library | Mga uri ng structure mula sa parameter ([Pipe network](topic:pipe-network)); mga pipe na may diameter |
| Mga pipe sa profile view, mga kurbadong pipe | Basahin ang inverts at cover sa kanang panel |

## Mga parcel

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Paglalatag ng lot ayon sa lawak o frontage, parcel mula sa mga linyang nakapalibot, right-of-way | Iguhit ang bawat parcel sa pamamagitan ng mga sulok nito, o ilagay ang mga call nito |
| Curve table at line table sa plan; mga label na inilipat nang manu-mano | Bawat course ay may label kasama ang sarili nito |
| Parcel sa LandXML | Naka-save ang mga parcel sa project file at napupunta sa PDF, DWG at DXF |

## Mga traverse

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Least-squares adjustment, transit rule, pag-weight ng mga anggulo laban sa mga distansya | Ang compass rule |
| Deflection angle, zenith angle at slope distance, elevation sa pamamagitan ng trigonometric leveling | I-reduce nang tama sa horizontal distance at anggulo, o sa bearing |
| Side shot, raw data file mula sa data collector | I-import ang mga punto bilang point file |

## Staking

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Offset stake (reference point na nakalagay pabalik mula sa stake), slope stake sa catch point | Mag-stake sa mga offset na kailangan mo, kasama ang lampas sa shoulder |
| Direktang pagpapadala ng stake sa sariling format ng data collector | Nabubukas ang CSV sa office software ng karamihan sa data collector |
| Pag-stake ng pipe, pad at parcel | Gumamit ng survey point malapit sa alignment, o ang mga course ng parcel |

## Mga file at output

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Teksto, hatch at dimension mula sa DWG o DXF; paper space; naka-link na drawing (xref); binary DXF | Nabubukas ang linework mula sa model space ([Open a DWG or DXF as linework](topic:open-dwg-dxf)); buksan nang hiwalay ang mga naka-link na drawing |
| Pag-galaw ng ilang punto nang sabay sa pamamagitan ng pag-drag | I-cut at i-paste ang mga ito, o i-edit nang isa-isa |
| Portrait sheet, sariling title block, viewport na inaayos mo, plan at profile sheet sa DWG | Isang landscape plan sheet bawat PDF, o plan at profile sheet sa kahabaan ng alignment (PDF) |
| Pag-plot ng elevation band at profile | Screen lang ang mga band; kumuha ng screenshot kung kailangan mo ang mga ito |
| Pagpalit ng pangalan ng layer, kulay o label style | Palitan ang mga ito sa CAD program pagkatapos ng DXF export |
| Cloud saving at version history | I-save ang mga `.civilcraft.json` file at panatilihing may backup; para magtrabaho nang sabay sa isang project, gumamit ng live session sa CadCraft Studio ([Design one site together, live](topic:work-live)) |
| CadCraft Studio para sa iPad at iPhone, at mula sa Google Play | Gamitin ang CivilCraft sa browser sa device; sa Android, nag-i-install ang CadCraft Studio mula sa APK nito sa getcadcraft.com/download |
| Pagbubukas ng ilang point o project file nang sabay | Isang file bawat bukas (ang mga GIS file na magkakaugnay, gaya ng mga bahagi ng shapefile, ay sabay na nagbubukas) |

## Landscape

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Mga head at nozzle ng manufacturer | Generic na head, o magdagdag ng sarili mong head mula sa file; ang datos ng mga maker ay idinadagdag habang pinapayagan nila ito |
| Pinakamataas na lateral length para sa drip line, daloy sa paglipas ng panahon, pump, looped pipe network | Panatilihin ang drip run sa nailathalang haba ng maker; ang check ay nangangailangan ng branching network |
| Eksaktong outline ng concave freeform object; ang volume nito sa ilalim ng lupa na sinukat nang eksakto | Ang convex hull ay ginrado at ang volume sa ilalim ng lupa ay estimate (sinasabi sa Properties) |
| Mga halaman sa sariling Place from library ng BimCraft at ModelCraft | I-export ang landscape IFC at buksan sa BimCraft katabi ng gusali |
| Detalyadong plant model (dahon, sanga, panahon) sa 3D view; freeform object at irrigation sa 3D view | Lumalabas sa 3D ang mga halaman bilang simpleng anyo na sukat ayon sa plant list ([View the site in 3D](topic:site-3d)); ginagawa ng scatter ng ModelCraft ang mga larawan ng pagtatanim |
| Hardscape wall na nagpapanatili ng ginradong antas sa likod nila sa surface | Bigyan ang platform o pad ng patayong gilid: ang mga iyon ay retaining wall sa surface ([Grading](topic:grading)) |
| SVG transform sa sarili mong symbol; texture at kulay ng sarili mong GLB plant model; compressed GLB geometry | I-flatten muna ang mga transform sa drawing program mo; ginuguhit ang mga model sa kulay ng halaman; i-export ang GLB nang walang compression ([Plant graphics](topic:plant-graphics)) |
| Sariling plant list na nakatago sa iyong Library account (ine-edit sa app) | I-edit ang sariling listahan ng project sa Plant table at i-save ito bilang plants file |
| Mga landscape tool para sa assistant na walang window (ang file server at command line) | Gumagana ang mga ito habang bukas ang CivilCraft window ([Let an AI assistant work with your site](topic:assistants)) |

## Mga power line

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Standard ng isang bansa na naka-built in (load case, clearance, factor) | Itakda ang halaga ng iyong standard sa {{ui:Load case at limits…}} at i-save ang mga ito, kasama ng iyong library, bilang pack na magagamit at maibabahagi muli ([Packs](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Pahalang na distansya mula sa conductor hanggang sa korona ng puno o pader sa tabi ng linya | Ang clearance nang tuwid pataas sa ibabaw ng mga halaman at pader na tinatawid ng linya ([Power-line checks](topic:power-line-checks#clearances)) |
| Conductor creep at pag-unat ng bagong conductor | Isaalang-alang ang mga iyon sa pamamagitan ng mga temperatura sa stringing table |
| Thermal rating ng nakabaon na cable (current rating mula sa paraan ng pagkakalatag) | Ilagay ang current rating ng supplier mo sa cable item |
| Short-circuit, protection at earthing study | Gumamit ng hiwalay na electrical program; ibinibigay ng CivilCraft ang haba ng network at mga cable |
| Lattice tower na dinisenyo member por member, at stay anchor sa lupa | Sinusuri ang mga support ayon sa nominal load nila; ang mga stay ayon sa rated load nila |
| Ang `.DON` study file na sinusuri sa program na nagbabasa nito | Suriin ang file doon; magpadala ng sample sa amin para masubukan namin laban sa totoong file |
| Mga power line sa 3D view at sa IFC | Ang plan, ang line profile, ang mga sheet at GIS layer |
| Mga power-line tool para sa assistant na walang window | Gumagana ang mga ito habang bukas ang CivilCraft window ([Let an AI assistant work with your site](topic:assistants)) |

## Mga building mass

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Library ng zoning code o alituntunin ng anumang lungsod | I-type ang mga limitasyon mula sa sarili mong ordinansa ([Zoning limits](topic:zoning-limits)) |
| Liwanag ng langit sa mga pader (facade daylight), hangin | Ang [Sun hours](topic:sun-hours) ay nagbibilang lamang ng direktang sikat ng araw |
| Lilim mula sa puno, halaman o anumang hindi iginuhit bilang mass | Iguhit ang mga kalapit na gusali bilang mass |
| Hugis ng bubong sa mass | Mga mass na patag ang tuktok |
| Mga opening, bubong at uri ng pader kapag binuo ang mass sa BimCraft | Gumagawa ang BimCraft ng simpleng panlabas na pader sa bawat level at isang sahig; idagdag doon ang iba pa |

## GIS at mga coordinate system

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| File Geodatabase; KML style, icon, ground overlay at network link | I-convert muna sa GeoPackage, shapefile o GeoJSON; binabasa ang KML placemark nang walang style nito |
| Pag-edit ng GIS feature o mga attribute nito | I-edit ang mga ito sa GIS program at i-import muli. Gumagawa ang Analyze panel ng bagong layer (buffer, overlay, join, selection) at nagdadagdag ng area at length field, pero hindi nito ine-edit ang feature sa lugar |
| Network at raster analysis, buffer na may patag o parisukat na dulo at one-sided buffer, pagdadagdag o pagbura ng row at pagpalit ng uri ng field sa attribute table, manu-manong kulay ng class, style legend sa mga plot | Gamitin ang Piliin para pumili ng feature at gumawa ng layer mula sa mga iyon; hindi inaalok ang patag na dulo. Ang pagkukulay ayon sa attribute at ang attribute table ay nagawa na: tingnan ang [Style a layer by an attribute](topic:gis-symbology) at [Work with a layer's attribute table](topic:gis-table) |
| Label style (laki, pagkakalagay) at mga label na umiiwas sa isa't isa | Iisa ang laki ng mga label at maaaring magpatong kapag siksik ang mga feature |
| Vertical datum at geoid model | Ginagamit ang mga elevation ayon sa ibinigay ng file; suriin ang vertical datum nang ikaw mismo |
| Grid shift maliban sa NAD27 papuntang NAD83 na iminumungkahi ayon sa lugar (gumagana ang OSTN15, at NTv2 para sa ibang datum kapag idinagdag mo ang file), ilang grid nang sabay, vertical grid | Idagdag ang grid file para sa datum mo nang ikaw mismo; isang grid bawat project |
| Map layer sa DXF o sa 3D export | Napupunta ang map layer sa PDF plot, at sa tabi ng DWG bilang larawan |
| Map server na nangangailangan ng sign-in, key o token | Gumamit ng pampublikong serbisyo, o georeferenced na image file |
| Pagsusulat ng LAS o LAZ file mula sa surface, ground model o mga elevation-grid at LiDAR tool | I-export ang surface bilang GeoTIFF elevation grid. Ang add-on na [Point clouds](topic:point-clouds) ay sumusulat ng nalinis na cloud bilang LAS 1.4 o LAZ |
| LiDAR intensity, kulay at return; elevation grid na may ilang band; grid o LiDAR file na lampas 200 MB | Sinasala ang LiDAR ayon lang sa class, ang grid ay gumagamit ng una nitong band; hatiin muna ang malalaking file sa tile |

## Input

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Box selection sa pamamagitan ng touch (kailangan nito ng {{key:Shift}}) | Pindutin nang matagal ang bawat survey point para idagdag ito |
| Mga na-type na coordinate o distansya habang gumuguhit | Iguhit nang tantiya, saka i-type ang eksaktong coordinate ng PI sa PI table ng alignment |
| Pag-type ng coordinate para sa mga sulok ng pad at structure | I-drag ang kanilang grip; mag-zoom in para sa katumpakan at tingnan ang E at N sa status bar |
| Pag-snap sa mga object (maliban sa survey point para sa breakline) | Mag-zoom in at tingnan ang status bar |

## 3D view

| Hindi pa ginagawa | Sa halip, ngayon |
|---|---|
| Pagguhit o pag-edit sa 3D view | Iguhit at i-edit sa plan; sinusundan ng 3D view ang bawat edit |
| Pagpili ng corridor feature line o GIS feature sa pamamagitan ng click sa 3D | I-click ang mga ito sa plan |
| Pag-export ng pinalaking view o sa feet | Ang mga export ay true scale sa metro; tingnan ang [Export the site in 3D](topic:export-3d) |
| Mga label sa GLB o OBJ export, laki at style ng label sa 3D | Ipinapakita ang mga label sa 3D view lang, iisang laki; tingnan ang [View the site in 3D](topic:site-3d) |
| Texture mula sa larawan, pag-record ng drive bilang video, anino mula sa labas ng site, sun hours na ipinapakita sa 3D view | Mga map layer na nakalatag sa mga surface; drive at posisyon ng araw sa isang oras; [sun hours](topic:sun-hours) para sa isang araw o panahon sa plan |
