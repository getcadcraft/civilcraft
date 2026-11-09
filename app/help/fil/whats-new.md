---
title: Ano ang bago sa 0.8 at 0.8.1
summary: Nagdaragdag ang CivilCraft 0.8 ng Paulanin (isang storm run sa iyong grading), isang earthwork balancer, isang best-route finder, detention pond, progress mula sa survey, isang address-to-site importer na pinananatili ang site sa project, at mga window para sa lupa at slope, junction at striping, survey adjustment, open pit, radio link at rail turnout. Inaayos ng 0.8.1 kung paano binabasa ang mga DWG file.
keywords: ano ang bago, what's new, release notes, changelog, mga pagbabago, 0.8, 0.8.1, bersyon, bagong feature, rain, storm, ponding, overtopping, earthwork, balance, cut and fill, haul, best route, least cost, alignment, detention pond, outlet, drawdown, freeboard, progress, survey, drone, stockpile, address papunta sa site, parcel, lupa, flood, slope stability, bishop, settlement, junction, striping, signs, sight distance, adjustment, least squares, traverse, open pit, block model, radio link, fresnel, turnout, crossover, mga wika, problema, live, dwg
from: b0932cf0
---

Ito ang mga binago sa CivilCraft 0.8 (2026-11-01) at 0.8.1 (2026-11-02), kumpara sa 0.7. Ang malalaking bagong bahagi ay mga tool na sumusubok sa iyong grading at sa iyong site (ulan, earthwork, ruta, pond, progress) at anim na calculation window para sa lupa, kalsada, survey, mina, link at riles.

## Bago

### Subukan ang iyong grading

- **Paulanin.** {{ui:Make it rain…}} (sa ilalim ng {{ui:Surface}}) naglalagay ng bagyo sa graded na lupa. Makikita mo ang tubig na dumadaloy mula sa mga pad, nag-iipon sa mga mababang sulok at umaapaw sa mga pond na masyadong maliit. Animated ang takbo at nagbibigay ng mga volume, ang peak outflow at isang CSV ng bawat pond. Magaspang ang default na cell para mabilis ang unang tingin; mas mabagal ang mas pinong cell. Lumalabas din sa panel ng Problema ang mga pond na umaapaw.
- **Earthwork balancer.** {{ui:Earthwork balancer…}} itinataas o ibinababa ang isang pad hanggang maging katumbas ang cut at fill, at ipinapakita ang haul table sa pagitan ng mga ito.
- **Best route.** {{ui:Best route…}}: pumili ng simula at dulo, at hahanapin ng CivilCraft ang pinakamurang daan sa ibabaw ng terrain na sumusunod sa iyong grade at curve limit, saka gagawa ng alignment mula dito.
- **Detention ponds.** {{ui:Detention ponds…}} kinukuwenta ang stage at storage mula sa iyong lupa, tumatanggap ng outlet device (orifice, weir, V-notch, spillway), dinadaanan ng storm ang pond at sinusuri ang peak na napigil, ang drawdown time at ang freeboard.
- **Progress from surveys.** {{ui:Progress from surveys…}} inihahambing ang drone o scan surface mula sa iba't ibang petsa sa lupa noong nakaraan at sa design: porsyento ng natapos ayon sa volume, mga lugar na sobrang hukay at sobrang punô, mga stockpile, at kung kailan matatapos ang trabaho sa ganitong bilis (minarkahan bilang estimate).

### Kilalanin ang site

- **Address to site.** {{ui:Address to site…}} pinagsasama-sama ang bukas na datos ng parcel, gusali, zoning, lupa, baha at terrain sa iisang site. Maaari mong panatilihin ang site sa project file: ang na-type na address, bawat pinagmulan kasama ang araw na kinuha mo ito at ang lisensya nito, at ang ibinalik. Kapag binuksan muli o ibinahagi ang project, nandoon pa rin ang site, nang walang muling pagkuha ng anuman. Maaari mo rin itong i-save bilang site file o ipadala sa BimCraft. Tingnan ang [Address papunta sa site](topic:address-to-site).

### Lupa, kalsada, survey, mina, link at riles

- **Soils and slopes.** {{ui:Soils and slopes…}} iginuguhit ang soil profile sa pagitan ng mga boring na ita-type mo. Hinahanap ng paraang Bishop ang kritikal na bilog sa iyong lupa, may water table, surcharge at earthquake coefficient; ang settlement ng footing ay may kasamang consolidation, immediate settlement at time.
- **Junctions and striping.** {{ui:Junctions and striping…}} pinagdudugtong ang mga leg gamit ang curb return (isang radius bawat leg, o three-centre return), ang sight distance para sa design speed, pagsuri ng mga sight triangle, crosswalk, stop bar, marking at sign na may sign schedule. Iginuguhit ang mga ito sa plano at sine-save bilang .dxf na may pinangalanang layer.
- **Survey adjustment.** {{ui:Survey adjustment…}} nagpapatakbo ng least-squares adjustment ng traverse o network: inayos na coordinate, error ellipse, chi-squared test at flag sa sukat na hindi akma. Kasama ang free network, pagsasara ng traverse sa compass rule at RW5, GSI, JobXML o CSV field file, at ang inayos na punto ay sine-save bilang CSV.
- **Open pits.** {{ui:Open pits…}} ginagawang block model ang drill sample at ang ultimate pit sa loob ng iyong slope angle, may strip ratio, table kada bench, at kurba ng grade at tonnage. Kasama rin ang nested pit ayon sa revenue factor at production schedule na may discounted cash flow.
- **Radio links.** {{ui:Radio links…}} sinusuri ang line of sight sa ibabaw ng iyong lupa na may earth's bulge, ang first Fresnel zone, link budget, fade margin at multipath outage, at ibinibigay ang taas ng mast na magpapalinaw sa daan. Mayroon din itong fibre loss budget, route quantity at hangin sa tore.
- **Rail turnouts.** {{ui:Rail turnouts…}} gumagawa ng turnout mula sa frog number nito, crossover sa pagitan ng magkakahanay na riles, at structure gauge na ikiniling ng cant at pinalapad sa kurba. Maaaring nasa station ng alignment ang turnout.

Tingnan ang [Lupa at slope, junction, survey adjustment, open pit, radio link at rail turnout](topic:soils-roads-survey-mines-links).

## Sa bawat app

- **Languages.** 54 na wika, sampu sa mga ito ay bago. Ang mga wikang hindi English ay machine draft hangga't hindi ito binabasa ng katutubong tagapagsalita. Karamihan ng help topic ay English pa rin.
- **Toolbar rows.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Wrap (gaya ng dati), 2 row o 1 row. Ipinapakita ng Ribbon ng CivilCraft ang pinakaginagamit na tool nang malaki, ang susunod ay maliit, at ang iba ay nasa likod ng palaso ng pangalan ng group.
- **Input devices.** Maaaring magpatakbo sa mga app ang trackpad, pen, 3D mouse, controller at MIDI.
- **Problems.** Isang panel ng Problema na nagbababala sa bawat app, na may mga check na nagbabasa ng regulation pack.
- **Live.** Isang view kung sino ang nasaan sa isang Live session.
- **Add-ons.** Isang listahan ng add-on, kasama ang lighting add-on.
- **Connect your AI.** Anumang assistant na ikokonekta mo ay maaaring magpatakbo sa mga tool ng CivilCraft. Kasama nito ang tala na hindi pa handa ang one-click connecting sa loob ng CadCraft Studio at ang hosted connector. Tingnan ang [Hayaang gumana ang AI assistant sa iyong site](topic:assistants).

## Naayos sa 0.8.1

- **DWG classes section.** Mali ang pagkabasa nito bilang maling uri (GitHub cadcraft#5). Naayos sa CivilCraft kasama ang CadCraft, BimCraft, ModelCraft at TakeoffCraft.
- **Switching language while running.** Maaaring magpalit ng wika ang CadCraft Studio at ang mga packed edition habang tumatakbo. English lang ang mga ito dati. Hindi pa nasusubok sa bawat platform: sabihin sa amin kung hindi nagbago ang wika.

## Wala pa sa bersyong ito

- **These are calculation aids.** Kailangan ng bawat resulta sa mga bagong window ang pagsusuri ng engineer. Nagsisimula ang lakas ng lupa sa tipikal na halaga para sa soil group, at sinasabi ito ng window.
- **Make it rain.** Maaaring tumagal nang mahigit dalawang minuto sa browser ang takbo sa sample site sa pinong cell. Sinuri ito laban sa mga kasong kinuwenta sa kamay at sa isang V-shaped catchment, hindi pa sa totoong graded na site.
- **Address to site.** Binabasa nito ang open data file na dinadala mo, at sinubukan lang sa sarili naming file. Hindi source ang mga puno. Ang pagkuha ng source para sa iyo ay naghihintay sa privacy wording.
- **Progress from surveys.** Sinubukan lang sa gawa-gawang survey. Hindi pa nagagawa ang progress sa sheet at markup (MarkupCraft) at ang scan laban sa model (BimCraft).
- **Soils and slopes.** Circular surface lang: walang wedge o block search at walang tension crack.
- **Junctions.** Isang radius bawat leg, walang truck swept path, at hindi pa napupunta sa corridor.
- **Field files.** Isinulat ang mga reader mula sa pampublikong paglalarawan ng format at sinubukan sa mga file na ginawa namin. Kailangan ang totoong instrument file.
- **Links and rail.** Radio link: free-space loss at multipath lang (walang rain fade o antenna pattern), at walang railway standard: placeholder ang bawat limit ng riles, na may draft na numero na hindi pa nasusuri ng railway engineer.
- **Windows and macOS.** Hindi code-signed ang 0.8. Maaaring magbabala ang Windows, at hinihingi ng macOS ang right-click at pagkatapos ay Open.

Ang lahat ng iba pa ay nasa [Hindi pa nabuo](topic:not-built-yet). Para sa naunang release, tingnan ang [Ano ang bago sa 0.7](topic:whats-new-0-7).
