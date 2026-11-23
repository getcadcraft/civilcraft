---
title: Ano ang bago sa 0.9 (mas maaga)
summary: Corridor at terrain template, snap at Pick button habang nagdo-draft, GIS analysis na may attribute table, shade, solar yield, comfort at wind study para sa isang site, 3D Render view, at ang mga add-on na Point clouds at WaterCraft.
keywords: whats new 0.9, earlier release, ano ang bago, 0.9, release notes, corridor templates, terrain templates, template editor, typical section, several corridors, snap, snaps, pick, move, copy, rotate, tangent, render, 3d render, gis analysis, buffer, overlay, spatial join, attribute table, style by attribute, shade study, solar yield, utci, outdoor comfort, wind study, openfoam, point clouds, las, laz, watercraft, fire flow, hydrant, water age, chlorine, demands, tooltips, layout, mga pagbabago, changelog, 0.8, 0.8.1, version, bagong feature, rain, storm, ponding, overtopping, earthwork, balance, cut and fill, haul, best route, least cost, alignment, detention pond, outlet, drawdown, freeboard, progress, survey, drone, stockpile, address to site, parcel, soil, flood, slope stability, bishop, settlement, junction, striping, signs, sight distance, adjustment, least squares, traverse, open pit, block model, radio link, fresnel, turnout, crossover, languages, problems, live, dwg
from: 4664522c
---

Ito ang mga pagbabago sa CivilCraft 0.9, kumpara sa 0.8.1. Bahagi ang CivilCraft 0.9 ng CadCraft Studio 0.9 at ng walong app nito. Ang mga pangunahing bahagi ay corridor at terrain template, snap habang gumuguhit, GIS analysis, pag-aaral ng araw, solar yield, comfort at hangin ng isang site, at dalawang add-on: Point clouds at WaterCraft.

## Bago

### Corridor at terrain template

- **Corridor templates.** Buksan ang {{ui:Surface}} › {{ui:More}} › {{ui:Mga corridor template…}} (o i-type ang {{cmd:TEMPLATES}}). Ang template ay maliit na cross-section na may mga bahagi, offset, slope, materyal at point code. Itago ang mga ito sa proyekto, sa {{ui:My library}} o bilang `.cctemplates.json` na file. Ipinapakita ng template editor ang drawing sa tunay na sukat at inililista ang mga problema habang nagta-type ka.
- **Build from templates by station.** Piliin ang alignment at i-on ang {{ui:Build from templates by station}} sa Properties nito. Bawat gilid ng bawat rehiyon ay may sariling listahan ng pavement at sariling end condition. Inilalagay ng {{ui:Magdagdag ng corridor}} sa ilalim ng {{ui:Mga corridor sa alignment na ito}} ang ilang corridor sa iisang alignment.
- **Terrain templates.** {{ui:Surface}} › {{ui:More}} › {{ui:Mga terrain template…}} (o i-type ang {{cmd:TERRAINTEMPLATES}}) ay naglalagay ng mga patong na materyal gaya ng topsoil o pavement at base sa isang terrain, may area at volume bawat layer. Tingnan ang [Corridor templates and terrain templates](topic:corridor-templates).

### Pagdo-draft

- **Snaps.** Dumidikit ang mga tool na Alignment, Pad, Parcel, Mass, Feature line, Measure, Boundary at Catchment sa mga survey point, PI, sulok, vertex at structure, na may label sa tabi ng marker. Pindutin at hawakan ang {{key:Alt}} para sa malayang punto.
- **Pick button, tangent at move, copy, rotate.** May kahon ng typed na Easting at Northing at crosshair na Pick button ang mga sulok ng pad, parcel at feature line. May {{ui:Tangent from two points}} din ang Properties para sa mga alignment, at {{ui:Move, copy and rotate}} para sa mga alignment, pad, parcel at feature line. Tingnan ang [Draft with snaps, picked corners and move, copy, rotate](topic:draft-with-snaps).
- **Render view sa 3D.** Gumuguhit ang {{ui:I-render}} button sa 3D bar ng lupa na may natural na kulay, langit, haze at malalambot na anino. Hindi nito binabago ang model. Ang {{ui:Sun}} menu ay may {{ui:Ilapat}} at {{ui:Isara}} na button na. Tingnan ang [View the site in 3D](topic:site-3d).
- **Isang seksyon lang ang bumubukas sa bawat panel.** Isang seksyon ang binubuksan ng left panel at ng Properties panel at isinasara ang iba, at ang mga tile ng Landscape ribbon na may ilang tool ay split button.

### GIS analysis

- **Analyze.** Nag-aalok ang {{ui:Surface}} › {{ui:More}} › {{ui:Analyze}} ng buffer, overlay, spatial join, pagpili ayon sa attribute o hugis, at pagsukat. Bawat tool ay gumagawa ng bagong layer sa isang undo step.
- **Attribute table.** Ang three-dots menu ng layer ay may {{ui:Attribute table…}} at {{ui:Style by attribute…}}. Tingnan ang [Analyze GIS layers](topic:gis-analysis) at [Work with a layer's attribute table](topic:gis-table).

### Ang site: araw, solar, comfort at hangin

- **Environment section.** Pumili ng mass: nasa ilalim ng {{ui:Sun hours}} sa Properties nito ang seksyong {{ui:Environment}}. May shade study (mapa, table, animation, CSV) ito, solar yield mula sa typical-year na weather file (.epw) at outdoor comfort (UTCI).
- **Wind, screening lamang.** Kinukulayan ng {{ui:Run wind study}} ang ground mula sa nakaupo hanggang sa hindi komportable para sa bawat direksyon ng hangin sa weather file. Hindi pa ito na-validate at sinasabi ito ng panel.
- **Pedestrian wind (OpenFOAM) add-on.** Naka-off ito hanggang i-on mo sa {{ui:Mga setting}} › {{ui:Mga Add-on}}. Software ang OpenFOAM na ikaw mismo ang mag-i-install. Tingnan ang [Shade, solar yield and outdoor comfort](topic:environment).

### Point clouds (add-on)

- I-on ang {{ui:Point clouds}} sa {{ui:Mga setting}} › {{ui:Mga Add-on}}; lalabas ang tab na Point clouds sa right-hand panel. Magbukas ng LAS o LAZ na file, linisin ito, ayusin sa ground, vegetation at mga gusali, buuin ang ground, mga contour at volume, at i-export ang LAS o LAZ. Tingnan ang [Point clouds from a drone or scanner](topic:point-clouds).

### WaterCraft (add-on)

- I-on ang {{ui:WaterCraft (water distribution)}} sa {{ui:Mga setting}} › {{ui:Mga Add-on}}; lalabas ang tab na WaterCraft. May demand mula sa mga customer, fire flow sa bawat hydrant, aling outage ng main ang pinakamahalaga, at water age at chlorine, na bawat isa ay naka-save bilang CSV. Tingnan ang [WaterCraft: demand, fire flow, outage at edad ng tubig](topic:watercraft).

### Sabay-sabay na paggawa

- Sa Live session, makikita ninyo ang cursor at pangalan ng isa't isa sa plano. Library plants: nagsisimula ang CivilCraft Landscape sa default nitong Library collection, {{ui:CivilCraft landscape}}.

## Sa bawat app

- Lumalabas ang mga hint bilang Bootstrap tooltip, at maisasara ang start tip.
- Nag-i-scroll ang tab strip ng panel na hindi kasya sa halip na maputol.
- Ganito ang basa ng mga pamagat ng browser tab: `<document> - CivilCraft | CadCraft`.
- May Layout section ang {{ui:Mga setting}} kung saan ang mga layout ay drop-down ng mga pagpipiliang may dalawang linya.
- Nasa {{ui:Mga setting}} › {{ui:Global}} › {{ui:Mga unit}} ang mga unit ng timbang at temperatura.
- Ipinapakita ng listahan ng wika ang mga wikang may file ang build. Ang mga wikang hindi Ingles ay machine draft.

## Naayos

- Hindi ma-on ang address lookup at EnergyPlus check add-on; ngayon ay maaari na.
- Sinasabi na ngayon ng help na isinusulat ng Point clouds add-on ang nalinis na cloud bilang LAS 1.4 o LAZ.
- Hindi na nagsisimula ang grip drag kapag ini-click ang sariling grip ng napiling object, na dati ay humihinto sa naghihintay na Pick.

## Mga tapat na limitasyon

- Ang mga halimbawang corridor template ay placeholder na walang pinagbatayang standard; dapat itong suriin ng isang engineer. Hindi nagdaragdag ng surface ang terrain template at hindi ito iginuguhit sa 3D o sa section view. Wala sa IFC export ang pangalawang corridor sa isang alignment. Walang taper sa pagitan ng dalawang template ayon sa station.
- Sinubukan ang Point clouds sa mga gawa-gawang file, hindi sa totoong drone survey. LAS at LAZ lang ang nababasa.
- Sinubukan ang GIS analysis sa mga gawa-gawang layer.
- Ang shade, solar at comfort ay tantya sa pagpaplano; ang wind ay hindi pa na-validate na screening. Wala sa mga ito ang design value.
- Pantulong sa pagkukuwenta ang WaterCraft na sinuri sa mga gawa-gawang network. Ang isang water engineer ang magpapasya kung gaano kahalaga ang mga numero.
- Ang mga wikang higit pa sa Ingles ay machine draft.
- Hindi naka-code-sign ang mga Windows installer, at hindi notarized ang macOS disk image.

## Mas maaga: 0.8 at 0.8.1

Ito ang mga pagbabago sa CivilCraft 0.8 (2026-11-01) at 0.8.1 (2026-11-02), kumpara sa 0.7. Ang mga pangunahing bagong bahagi ay mga tool na sumusubok sa iyong grading at site (ulan, earthwork, ruta, pond, progress) at anim na calculation window para sa ground, kalsada, survey, mina, link at rail.

### Bago

### Subukan ang iyong grading

- **Make it rain.** Ang {{ui:Make it rain…}} (sa ilalim ng {{ui:Surface}}) ay nagpapabagsak ng bagyo sa graded na ground. Makikita mo ang tubig na dumadaloy mula sa mga pad, nag-iipon sa mga mababang sulok at umaapaw sa mga pond na masyadong maliit. Animated ang takbo at nagbibigay ng volume, peak outflow at CSV ng bawat pond. Magaspang ang default na cell para mabilis ang unang tingin; mas mabagal ang mas pinong cell. Lumalabas din sa Problems panel ang mga pond na umaapaw.
- **Earthwork balancer.** Itinataas o ibinababa ng {{ui:Earthwork balancer…}} ang isang pad hanggang maging katumbas ng fill ang cut, at ipinapakita ang haul table sa pagitan nila.
- **Best route.** {{ui:Pinakamahusay na ruta…}}: pumili ng simula at dulo, at hahanapin ng CivilCraft ang pinakamurang daan sa terrain na sumusunod sa iyong grade at curve limit, saka gagawa ng alignment mula rito.
- **Detention ponds.** Kinukuwenta ng {{ui:Detention ponds…}} ang stage at storage mula sa iyong ground, tumatanggap ng outlet device (orifice, weir, V-notch, spillway), dinadaanan ng bagyo ang pond at sinusuri ang peak na napigilan, ang oras ng drawdown at ang freeboard.
- **Progress from surveys.** Inihahambing ng {{ui:Progress from surveys…}} ang mga surface ng drone o scan mula sa magkakaibang petsa sa ground gaya ng dati nito at sa design: porsyentong tapos ayon sa volume, mga lugar na sobrang hukay at sobrang punô, stockpile, at kung kailan matatapos ang trabaho sa ganitong bilis (minarkahan bilang tantya).

### Alamin ang site

- **Address to site.** Pinagsasama ng {{ui:Address to site…}} ang bukas na datos ng parcel, gusali, zoning, lupa, baha at terrain sa iisang site. Maaari mong itago ang site sa project file: ang na-type na address, bawat source kasama ang araw na kinuha mo ito at ang lisensya nito, at ang ibinalik. Buksan muli o ibahagi ang proyekto at nandoon pa rin ang site, nang walang bagong kuha. Maaari mo rin itong i-save bilang site file o ipadala sa BimCraft. Tingnan ang [Address to site](topic:address-to-site).

### Ground, kalsada, survey, mina, link at rail

- **Soils and slopes.** Iginuguhit ng {{ui:Soils and slopes…}} ang soil profile sa pagitan ng mga boring na itine-type mo. Hahanapin pagkatapos ng Bishop's method ang critical circle sa iyong ground, kasama ang water table, surcharge at earthquake coefficient; ang settlement ng footing ay may consolidation, immediate settlement at oras.
- **Junctions and striping.** Pinagsasama ng {{ui:Junctions and striping…}} ang mga leg na may curb return (isang radius bawat leg, o three-centre na return), ang sight distance para sa design speed, pagsusuri ng sight triangle, crosswalk, stop bar, marking at sign na may sign schedule. Iginuguhit ang mga ito sa plano at sine-save bilang .dxf na may pinangalanang layer.
- **Survey adjustment.** Nagpapatakbo ang {{ui:Survey adjustment…}} ng least-squares adjustment ng traverse o network: na-adjust na coordinate, error ellipse, chi-squared test at flag sa sukat na hindi tumutugma. Kasama ang free network, pagsara ng traverse sa pamamagitan ng compass rule, at mga RW5, GSI, JobXML o CSV field file, at nase-save bilang CSV ang na-adjust na mga punto.
- **Open pits.** Ginagawang block model ng {{ui:Open pits…}} ang drill sample at ang huling pit sa loob ng iyong slope angle, kasama ang strip ratio, table kada bench at kurba ng grade at tonnage. Naroon din ang nested pit ayon sa revenue factor at production schedule na may discounted cash flow.
- **Radio links.** Sinusuri ng {{ui:Radio links…}} ang line of sight sa iyong ground na may umbok ng mundo, unang Fresnel zone, link budget, fade margin at multipath outage, at ibinibigay ang taas ng mast na makakalinis sa daan. Ginagawa rin nito ang fibre loss budget, dami ng ruta at hangin sa tore.
- **Rail turnouts.** Gumagawa ang {{ui:Rail turnouts…}} ng turnout mula sa frog number nito, crossover sa pagitan ng magkatabing track at structure gauge na tinagilid ng cant at pinalapad sa curve. Maaaring nasa isang station ng alignment ang turnout.

Tingnan ang [Soils, junctions, survey adjustment, pits, radio links and turnouts](topic:soils-roads-survey-mines-links).

### Sa bawat app

- **Languages.** 54 na wika, sampu ay bago. Machine draft ang mga wikang hindi Ingles hangga't hindi ito nababasa ng isang katutubong nagsasalita. Karamihan sa mga paksa ng help ay Ingles pa rin.
- **Toolbar rows.** {{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:Mga row ng toolbar}}: Wrap (gaya ng dati), 2 row o 1 row. Ipinapakita ng Ribbon ng CivilCraft ang pinakaginagamit na tool nang malaki, ang kasunod ay maliit, at ang iba ay nasa likod ng arrow ng pangalan ng grupo.
- **Input devices.** Maaaring kontrolin ng trackpad, pen, 3D mouse, controller at MIDI ang mga app.
- **Problems.** Isang Problems panel na nagbababala sa bawat app, na may mga pagsusuri na bumabasa ng regulation pack.
- **Live.** Isang view kung sino ang nasaan sa isang Live session.
- **Add-ons.** Listahan ng mga add-on, kasama ang lighting add-on.
- **Connect your AI.** Maaaring kontrolin ng anumang assistant na ikinonekta mo ang mga tool ng CivilCraft. May tala ito na hindi pa handa ang one-click na pagkonekta sa loob ng CadCraft Studio at ang hosted connector. Tingnan ang [Let an AI assistant work with your site](topic:assistants).

### Naayos sa 0.8.1

- **DWG classes section.** Mali ang uri ng pagkakabasa dito (GitHub cadcraft#5). Naayos sa CivilCraft kasama ng CadCraft, BimCraft, ModelCraft at TakeoffCraft.
- **Pagpalit ng wika habang tumatakbo.** Maaari nang magpalit ng wika ang CadCraft Studio at ang mga packed edition habang tumatakbo. Dati ay Ingles lamang ang mga ito. Hindi pa nasusubukan sa bawat platform: sabihan kami kung hindi nagbabago ang wika.

### Wala pa sa bersyong ito

- **Mga pantulong sa pagkukuwenta ang mga ito.** Kailangan ng check ng isang engineer ang bawat resulta sa mga bagong window. Nagsisimula ang lakas ng lupa sa karaniwang halaga para sa grupo ng lupa, at sinasabi ito ng window.
- **Make it rain.** Maaaring lumampas sa dalawang minuto sa browser ang pagtakbo sa sample site kapag pinong cell. Sinuri ito laban sa mga kasong kinuwenta nang mano-mano at isang V-shaped na catchment, hindi pa sa totoong graded na site.
- **Address to site.** Bumabasa ito ng bukas na data file na dala mo, at sinubukan lamang sa sarili naming file. Hindi source ang mga puno. Naghihintay ang pagkuha ng source para sa iyo sa privacy wording.
- **Progress from surveys.** Sinubukan lamang sa mga gawa-gawang survey. Hindi pa nagagawa ang progress sa mga sheet at markup (MarkupCraft) at ang scan laban sa model (BimCraft).
- **Soils and slopes.** Pabilog na surface lamang: walang wedge o block search at walang tension crack.
- **Junctions.** Isang radius bawat leg, walang truck swept path, at hindi pa ito napupunta sa corridor.
- **Field files.** Isinulat ang mga reader mula sa mga pampublikong paglalarawan ng format at sinubukan sa mga file na ginawa namin. Kailangan ang mga totoong instrument file.
- **Links and rail.** Radio links: free-space loss at multipath lamang (walang rain fade o antenna pattern), at walang railway standard: bawat rail limit ay placeholder, na may draft na numerong hindi pa sinusuri ng anumang railway engineer.
- **Windows at macOS.** Hindi naka-code-sign ang 0.8. Maaaring magbabala ang Windows, at humihingi ang macOS ng right-click at saka Open.

Nasa [Hindi pa nagagawa](topic:not-built-yet) ang iba pa. Para sa mas naunang release, tingnan ang [What's new in 0.7](topic:whats-new-0-7).
