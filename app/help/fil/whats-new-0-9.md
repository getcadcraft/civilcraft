---
title: Ano ang bago sa 0.9
summary: Mga corridor at terrain template, snap at Pick button habang nagdo-drafting, GIS analysis na may attribute table, shade, solar yield, comfort at wind study para sa isang site, isang 3D Render view, at ang Point clouds at WaterCraft na add-on.
keywords: whats new, 0.9, release notes, corridor templates, terrain templates, template editor, typical section, several corridors, snap, snaps, pick, move, copy, rotate, tangent, render, 3d render, gis analysis, buffer, overlay, spatial join, attribute table, style by attribute, shade study, solar yield, utci, outdoor comfort, wind study, openfoam, point clouds, las, laz, watercraft, fire flow, hydrant, water age, chlorine, demand, tooltips, layout, what's new, release notes, changelog, mga pagbabago, 0.8, 0.8.1, version, mga bagong feature, rain, storm, ponding, overtopping, earthwork, balance, cut and fill, haul, best route, least cost, alignment, detention pond, outlet, drawdown, freeboard, progress, survey, drone, stockpile, address to site, parcel, soil, flood, slope stability, bishop, settlement, junction, striping, signs, sight distance, adjustment, least squares, traverse, open pit, block model, radio link, fresnel, turnout, crossover, languages, problems, live, dwg
from: d7ac5b14
---

Ito ang mga pagbabago sa CivilCraft 0.9, kumpara sa 0.8.1. Bahagi ang CivilCraft 0.9 ng CadCraft Studio 0.9 at ng walong app nito. Ang malalaking bahagi ay ang corridor at terrain template, snap habang gumuguhit, GIS analysis, pag-aaral ng sikat ng araw, solar yield, comfort at hangin ng isang site, at dalawang add-on: Point clouds at WaterCraft.

## Bago

### Mga corridor at terrain template

- **Mga corridor template.** Buksan ang {{ui:Surface}} › {{ui:Higit pa}} › {{ui:Mga corridor template…}} (o i-type ang {{cmd:TEMPLATES}}). Ang template ay maliit na cross-section na may mga component, offset, slope, materyal at point code. Itago ang mga ito sa project, sa {{ui:My library}} o bilang file na `.cctemplates.json`. Nagpapakita ang template editor ng drawing sa tunay na sukat at naglilista ng mga problema habang nagta-type ka.
- **Buuin mula sa mga template ayon sa station.** Piliin ang isang alignment at i-on ang {{ui:Itayo mula sa mga template ayon sa station}} sa Properties nito. Bawat gilid ng bawat region ay may sarili nitong listahan ng pavement at sariling end condition. Inilalagay ng {{ui:Magdagdag ng corridor}} sa ilalim ng {{ui:Mga corridor sa alignment na ito}} ang maraming corridor sa iisang alignment.
- **Mga terrain template.** {{ui:Surface}} › {{ui:Higit pa}} › {{ui:Mga terrain template…}} (o i-type ang {{cmd:TERRAINTEMPLATES}}) ay naglalagay ng mga layered na materyal, gaya ng topsoil o pavement at base, sa ibabaw ng terrain, na may lawak at volume bawat layer. Tingnan ang [Mga corridor template at terrain template](topic:corridor-templates).

### Pagdo-drafting

- **Snap.** Ang mga tool na Alignment, Pad, Parcel, Mass, Feature line, Measure, Boundary at Catchment ay nag-i-snap sa mga survey point, PI, sulok, vertex at istruktura, na may label sa tabi ng marker. Pindutin nang matagal ang {{key:Alt}} para sa malayang punto.
- **Mga Pick button, tangent at move, copy, rotate.** Ang mga sulok ng pad, parcel at feature line ay may mga kahon ng Easting at Northing na tina-type at may crosshair na Pick button. Mayroon ding {{ui:Tangent mula sa dalawang punto}} ang Properties para sa mga alignment, at {{ui:Ilipat, kopyahin at i-rotate}} para sa mga alignment, pad, parcel at feature line. Tingnan ang [Mag-draft gamit ang snap, mga napiling sulok at move, copy, rotate](topic:draft-with-snaps).
- **Render view sa 3D.** Gumuguhit ang button na {{ui:I-render}} sa 3D bar ng lupa na may natural na kulay, langit, haze at malambot na anino. Hindi nito binabago ang modelo. May mga button na {{ui:Ilapat}} at {{ui:Isara}} na ang menu na {{ui:Sun}}. Tingnan ang [Tingnan ang site sa 3D](topic:site-3d).
- **Isang seksyon ng panel sa bawat pagkakataon.** Ang kaliwang panel at ang panel ng Properties ay nagbubukas ng isang seksyon at nagsasara ng iba, at ang mga tile ng Landscape ribbon na may maraming tool ay split button.

### GIS analysis

- **Analyze.** {{ui:Surface}} › {{ui:Higit pa}} › {{ui:Analyze}} ay nag-aalok ng buffer, overlay, spatial join, pagpili ayon sa attribute o hugis, at measure. Bawat tool ay gumagawa ng bagong layer sa isang undo step.
- **Attribute table.** Ang three-dots menu ng isang layer ay may {{ui:Attribute table…}} at {{ui:Style ayon sa attribute…}}. Tingnan ang [Pag-analisa ng mga GIS layer](topic:gis-analysis) at [Pagtatrabaho sa attribute table ng isang layer](topic:gis-table).

### Ang site: sikat ng araw, solar, comfort at hangin

- **Seksyong Environment.** Pumili ng mass: nasa ilalim ng {{ui:Sun hours}} sa Properties nito ang seksyong {{ui:Kapaligiran}}. Mayroon itong shade study (mapa, table, animation, CSV), solar yield mula sa typical-year weather file (.epw) at outdoor comfort (UTCI).
- **Hangin, pang-screening lamang.** Kinukulayan ng {{ui:Patakbuhin ang wind study}} ang lupa mula sa nakaupo hanggang sa hindi komportable para sa bawat direksyon ng hangin sa weather file. Hindi pa ito napapatunayan at sinasabi ito ng panel.
- **Pedestrian wind (OpenFOAM) add-on.** Naka-off hanggang i-on mo ito sa {{ui:Mga setting}} › {{ui:Mga Add-on}}. Ang OpenFOAM ay software na ikaw mismo ang mag-i-install. Tingnan ang [Shade, solar yield at outdoor comfort](topic:environment).

### Point clouds (add-on)

- I-on ang {{ui:Point clouds}} sa {{ui:Mga setting}} › {{ui:Mga Add-on}}; lalabas ang tab na Point clouds sa kanang panel. Magbukas ng LAS o LAZ na file, linisin ito, ayusin sa ground, vegetation at mga gusali, buuin ang lupa, contour at volume, at i-export bilang LAS o LAZ. Tingnan ang [Point clouds mula sa drone o scanner](topic:point-clouds).

### WaterCraft (add-on)

- I-on ang {{ui:WaterCraft (distribusyon ng tubig)}} sa {{ui:Mga setting}} › {{ui:Mga Add-on}}; lalabas ang tab na WaterCraft. Mayroon itong demand mula sa mga customer, fire flow sa bawat hydrant, kung aling pagkawala ng main ang pinakamahalaga, at water age at chlorine, na bawat isa ay naka-save bilang CSV. Tingnan ang [WaterCraft: mga demand, fire flow, outage at water age](topic:watercraft).

### Sama-samang pagtatrabaho

- Sa isang Live session, nakikita ninyo ang cursor at pangalan ng isa't isa sa plano. Mga halaman sa library: nagsisimula ang CivilCraft Landscape sa default nitong Library collection, {{ui:CivilCraft landscape}}.

## Sa bawat app

- Lumalabas ang mga hint bilang Bootstrap tooltip, at maaaring isara ang start tip.
- Nagsa-scroll ang tab strip ng panel na hindi kasya sa halip na mapuputol.
- Ang mga pamagat ng browser tab ay nagbabasa ng `<document> - CivilCraft | CadCraft`.
- Mayroong seksyong Layout ang {{ui:Mga setting}} kung saan ang mga layout ay drop-down ng dalawang-linyang pagpipilian.
- Nasa {{ui:Mga setting}} › {{ui:Global}} › {{ui:Mga unit}} ang mga unit ng timbang at temperatura.
- Ipinapakita ng listahan ng wika ang mga wikang mayroong file ang build. Ang mga wikang iba sa English ay mga machine draft.

## Naayos

- Hindi mabuksan ang mga add-on ng address lookup at EnergyPlus check; ngayon ay mabubuksan na ang mga ito.
- Sinasabi na ngayon ng help na isinusulat ng add-on na Point clouds ang nilinis na cloud bilang LAS 1.4 o LAZ.
- Ang pag-click sa sariling grip ng napiling object ay hindi na nagsisimula ng grip drag na humihinto sa naghihintay na Pick.

## Mga limit na dapat tandaan

- Ang mga halimbawang corridor template ay mga placeholder na walang pinagbatayang pamantayan; dapat suriin ng isang engineer ang mga ito. Hindi nagdadagdag ng surface ang mga terrain template at hindi ito iginuguhit sa 3D o sa section view. Wala sa IFC export ang pangalawang corridor sa isang alignment. Walang taper sa pagitan ng dalawang template ayon sa station.
- Nasubukan ang Point clouds sa mga gawang-gawang file, hindi sa totoong survey gamit ang drone. Dalawang format lamang ang binabasa: LAS at LAZ.
- Nasubukan ang GIS analysis sa mga gawang-gawang layer.
- Tinatayang pagpaplano ang sikat ng araw, solar at comfort; ang hangin ay hindi pa napapatunayang screening. Wala sa mga ito ang halagang pang-disenyo.
- Ang WaterCraft ay pantulong sa pagkuwenta na nasuri sa mga gawang-gawang network. Ang water engineer ang magpapasya kung ano ang halaga ng mga numero.
- Ang mga wikang higit sa English ay mga machine draft hanggang mabasa ng katutubong nagsasalita.
- Hindi naka-code-sign ang mga Windows installer, at hindi notarized ang macOS disk image.

## Mas maaga: 0.8 at 0.8.1

Ito ang mga pagbabago sa CivilCraft 0.8 (2026-11-01) at 0.8.1 (2026-11-02), kumpara sa 0.7. Ang malalaking bagong bahagi ay ang mga tool na sumusubok sa iyong grading at site (ulan, earthwork, ruta, pond, progress) at anim na window ng kuwenta para sa lupa, kalsada, survey, minahan, link at riles.

### Bago

**Subukan ang iyong grading**

- **Paulanin.** Ang {{ui:Paulanin…}} (sa ilalim ng {{ui:Surface}}) ay nagpapabagsak ng bagyo sa graded na lupa. Pinapanood mo ang tubig na dumadaloy mula sa mga pad, namumuo sa mga mababang sulok at umaapaw sa mga pond na masyadong maliit. Animated ang takbo at nagbibigay ng volume, pinakamataas na outflow at CSV ng bawat pond. Magaspang ang default na cell para mabilis ang unang tingin; mas mabagal ang mas pinong cell. Lumalabas din sa panel ng Problems ang mga pond na umaapaw.
- **Earthwork balancer.** Itinataas o ibinababa ng {{ui:Earthwork balancer…}} ang isang pad hanggang pantay ang cut at fill, at ipinapakita ang haul table sa pagitan ng mga ito.
- **Pinakamahusay na ruta.** {{ui:Pinakamahusay na ruta…}}: pumili ng simula at dulo, at hahanapin ng CivilCraft ang pinakamurang daan sa terrain na sumusunod sa iyong grade at curve limit, saka gagawa ng alignment mula rito.
- **Detention pond.** {{ui:Detention pond…}} ay kinukuwenta ang stage at storage mula sa iyong lupa, tumatanggap ng mga outlet device (orifice, weir, V-notch, spillway), dumadaan ang bagyo sa pond at sinusuri ang peak na napigilan, ang oras ng drawdown at ang freeboard.
- **Progress mula sa survey.** {{ui:Progress mula sa survey…}} ay inihahambing ang mga surface ng drone o scan mula sa iba't ibang petsa sa lupang dati at sa disenyo: porsiyentong tapos ayon sa volume, mga lugar na sobrang hukay at sobrang punô, mga stockpile, at kung kailan matatapos ang trabaho sa ganitong bilis (minarkahang tantya).

**Alamin ang site**

- **Address sa site.** Ang {{ui:Address papunta sa site…}} ay pinagsasama-sama sa iisang site ang bukas na datos ng parcel, gusali, zoning, lupa, baha at terrain. Maaari mong itago ang site sa project file: ang tina-type na address, bawat source kasama ang araw na kinuha mo ito at ang lisensya nito, at ang nakuha. Kapag binuksan o ibinahagi muli ang project, nandoon pa rin ang site, nang hindi kinukuha muli ang anuman. Maaari mo rin itong i-save bilang site file o ipadala sa BimCraft. Tingnan ang [Address papunta sa site](topic:address-to-site).

**Lupa, kalsada, survey, minahan, link at riles**

- **Lupa at slope.** Ang {{ui:Lupa at slope…}} ay gumuguhit ng soil profile sa pagitan ng mga boring na tina-type mo. Pagkatapos, hahanapin ng paraan ni Bishop ang kritikal na bilog sa iyong lupa, may water table, surcharge at earthquake coefficient; nakakakuha ang settlement ng footing ng consolidation, agarang settlement at oras.
- **Junction at striping.** Ang {{ui:Junction at striping…}} ay nagsasama-sama ng mga leg na may curb return (isang radius bawat leg, o three-centre return), sight distance para sa design speed, pagsusuri ng sight triangle, crosswalk, stop bar, marking at signs na may sign schedule. Iginuguhit ang mga ito sa plano at naka-save bilang .dxf na may pinangalanang layer.
- **Survey adjustment.** Ang {{ui:Survey adjustment…}} ay nagpapatakbo ng least-squares adjustment ng traverse o network: mga adjusted coordinate, error ellipse, chi-squared test at marka sa sukat na hindi tugma. Kasama ang free network, pagsasara ng traverse sa compass rule at RW5, mga field file na GSI, JobXML o CSV, at naka-save bilang CSV ang mga adjusted point.
- **Open pit.** Ang {{ui:Open pit…}} ay ginagawang block model ang drill sample at ang ultimate pit sa loob ng iyong slope angle, may strip ratio, table kada bench, at kurbang grade at tonnage. Kasama rin ang nested pit ayon sa revenue factor at production schedule na may discounted cash flow.
- **Radio link.** Ang {{ui:Radio link…}} ay sinusuri ang line of sight sa iyong lupa na may bulge ng mundo, unang Fresnel zone, link budget, fade margin at multipath outage, at nagbibigay ng taas ng mast na magpapalinaw sa daan. Gumagawa rin ito ng fibre loss budget, dami ng ruta at hangin sa tore.
- **Rail turnout.** Ang {{ui:Rail turnout…}} ay gumagawa ng turnout mula sa frog number nito, crossover sa pagitan ng magkatabing riles, at structure gauge na nakatagilid ayon sa cant at pinalaki sa kurba. Maaaring nasa isang station ng alignment ang isang turnout.

Tingnan ang [Lupa, junction, survey adjustment, pit, radio link at turnout](topic:soils-roads-survey-mines-links).

### Sa bawat app

- **Mga wika.** 54 na wika, sampu ang bago. Ang mga wikang iba sa English ay mga machine draft hanggang mabasa ng katutubong nagsasalita. Karamihan sa mga help topic ay nasa English pa rin.
- **Mga row ng toolbar.** {{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:Mga row ng toolbar}}: Wrap (gaya ng dati), 2 row o 1 row. Ipinapakita ng Ribbon ng CivilCraft ang pinakaginagamit na tool nang malaki, ang susunod ay maliit, at ang iba ay nasa likod ng arrow ng pangalan ng grupo.
- **Mga input device.** Maaaring gamitin ang trackpad, pen, 3D mouse, controller at MIDI sa mga app.
- **Problems.** Isang panel ng Problems na nagbababala sa bawat app, na may mga check na bumabasa ng regulation pack.
- **Live.** Isang view ng kung sino ang nasaan sa isang Live session.
- **Add-on.** Isang listahan ng add-on, kasama ang mga lighting add-on.
- **Ikonekta ang iyong AI.** Anumang assistant na ikokonekta mo ay maaaring kontrolin ang mga tool ng CivilCraft. May kasamang tala na hindi pa handa ang one-click connecting sa loob ng CadCraft Studio at ang hosted connector. Tingnan ang [Hayaang magtrabaho ang AI assistant sa iyong site](topic:assistants).

### Naayos sa 0.8.1

- **Seksyon ng DWG classes.** Mali ang pagbasa nito bilang maling uri (GitHub cadcraft#5). Naayos sa CivilCraft kasama ang CadCraft, BimCraft, ModelCraft at TakeoffCraft.
- **Pagpapalit ng wika habang tumatakbo.** Maaaring magpalit ng wika ang CadCraft Studio at ang mga naka-pack na edisyon habang tumatakbo. Dati, English lamang sila. Hindi pa nasusubukan sa bawat platform: sabihin sa amin kung hindi nagbabago ang wika.

### Wala pa sa bersyong ito

- **Mga pantulong sa pagkuwenta ang mga ito.** Kailangan ng bawat resulta sa mga bagong window ang pagsusuri ng isang engineer. Nagsisimula ang lakas ng lupa sa tipikal na halaga para sa grupo ng lupa, at sinasabi ito ng window.
- **Paulanin.** Maaaring tumagal nang mahigit dalawang minuto sa browser ang isang takbo sa sample site sa pinong cell. Nasuri ito laban sa mga kasong kinuwenta nang manu-mano at isang V-shaped catchment, hindi pa sa totoong graded na site.
- **Address sa site.** Bumabasa ito ng mga bukas na data file na dadalhin mo, at sa mga file namin lamang nasubukan. Hindi source ang mga puno. Naghihintay ang pagkuha ng mga source para sa iyo sa wording ng privacy.
- **Progress mula sa survey.** Sa mga gawang-gawang survey lamang nasubukan. Hindi pa naitatayo ang progress sa mga sheet at markup (MarkupCraft) at ang scan laban sa model (BimCraft).
- **Lupa at slope.** Mga pabilog na surface lamang: walang paghahanap ng wedge o block, at walang tension crack.
- **Junction.** Isang radius bawat leg, walang truck swept path, at hindi pa napupunta sa corridor.
- **Mga field file.** Isinulat ang mga reader mula sa mga pampublikong paglalarawan ng format at sinubukan sa mga file na ginawa namin. Kailangan ang mga totoong instrument file.
- **Link at riles.** Radio link: free-space loss at multipath lamang (walang rain fade o antenna pattern), at walang pamantayan para sa riles: bawat limit ng riles ay placeholder, na may mga draft na numerong hindi pa nasusuri ng railway engineer.
- **Windows at macOS.** Hindi naka-code-sign ang 0.8. Maaaring magbabala ang Windows, at humihingi ang macOS ng right-click pagkatapos ay Open.

Ang iba pa ay nasa [Hindi pa naitatayo](topic:not-built-yet). Para sa mas naunang release, tingnan ang [Ano ang bago sa 0.7](topic:whats-new-0-7).
