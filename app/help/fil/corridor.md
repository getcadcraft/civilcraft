---
title: I-sweep ang road corridor
summary: I-on ang corridor para sa isang alignment, itakda ang lane, shoulder at side slope na mga halaga, at basahin ang mga section, daylight line at earthwork na nagagawa nito.
keywords: junction, intersection, kalsadang nagtatagpo, side road, T junction, tawiran, antas ng pad, join, tie in, superelevation, super, banking, runoff, runout, rate table, cross slope, rotation, corridor, assembly, subassembly, typical section, road, lane, shoulder, cross slope, side slope, daylight, cut, fill, sections, target, targets, width target, elevation target, offset target, widening, edge of pavement, sumunod sa ibang corridor
from: 6dcb92b3
---

Ang corridor ay nagsa-sweep ng isang simpleng typical section (isang assembly) kasama ang alignment at design profile nito, ginagrade ito papunta sa umiiral na ground, at idinadagdag ang resulta sa proposed surface. Ang isang alignment ay maaaring magdala ng ilang corridor sa magkakaibang station range, at ang corridor ay maaaring buuin mula sa mga reusable na template ayon sa station ([Corridor templates](topic:corridor-templates)). Pareho ang simpleng assembly sa ibaba sa magkabilang gilid; para bigyan ang bawat gilid ng sariling mga part, tingnan ang [Build each side from parts](topic:corridor#build-each-side-from-parts).

## Ang assembly

Mula sa centerline palabas, sa bawat gilid:

1. isang **lane** na may itinakdang lapad, na bumababa mula sa crown sa **lane slope**
2. isang **shoulder** na may itinakdang lapad sa **shoulder slope**
3. isang **side slope** mula sa gilid ng shoulder hanggang sa pagtagpo nito sa ground: ang **cut slope** kung saan nasa itaas ang ground, ang **fill slope** kung saan nasa ibaba ito

Ang mga panimulang halaga ay placeholder lamang, hindi design standard:

| Halaga | US feet | Metro |
|---|---|---|
| Lane width | 12 ft | 3.6 m |
| Lane slope | 2% | 2% |
| Shoulder width | 4 ft | 1.2 m |
| Shoulder slope | 4% | 4% |
| Cut slope | 2 : 1 | 2 : 1 |
| Fill slope | 3 : 1 | 3 : 1 |
| Section every | 10 ft | 5 m |

Ang slope ng side slope ay horizontal sa vertical (H:V): ibig sabihin ng 3 : 1 ay 3 pahalang sa bawat 1 pababa.

## Buuin ang corridor

Kailangan mo ng alignment na walang error at design profile na may hindi bababa sa dalawang PVI at walang error.

1. Piliin ang alignment.
2. Sa right panel, sa ilalim ng **Corridor**, lagyan ng tsek ang **Sweep an assembly along the design profile**.
   Lumalabas ang mga field at agad na nabubuo ang corridor. Ipinapakita ng plano ang mga gilid ng lane at shoulder at ang mga daylight line; kapag napili ang {{ui:Proposed (graded)}} sa ilalim ng **Display**, ipinapakita ng mga contour ang bagong ground.
3. Baguhin ang alinmang halaga: **Lane width**, **Lane slope**, **Shoulder width**, **Shoulder slope**, **Cut slope**, **Fill slope**, **Section every**. Pindutin ang {{key:Enter}} pagkatapos ng bawat isa. Dapat higit sa 0 ang cut, fill at section spacing.
4. Basahin ang linyang nasa ilalim ng mga field, halimbawa "39 sections mula 0+00.00 hanggang 3+86.36; cut 240.2 cu yd, fill 556.0 cu yd."

Ginugupit ang mga section sa bawat hakbang ng **Section every**, sa mga dulo, at sa simula at dulo ng bawat horizontal at vertical curve. Ang bawat section at ang mga linyang dumadaan dito (centerline, mga gilid ng lane at shoulder, daylight) ay nagiging breakline ng proposed surface.

Para i-off ang corridor, alisin ang tsek sa kahon. Nananatili ang mga halaga nito para sa susunod.

## Kapag hindi ito nabuo

Ipinapaliwanag ng pulang kahon sa ilalim ng mga field kung bakit:

| Mensahe | Ano ang gagawin |
|---|---|
| "Kailangan ng corridor ng design profile na walang error." | Magdagdag ng PVI, o ayusin ang magkakapatong na vertical curve (tingnan ang [I-design ang vertical profile](topic:profile)). |
| "Hindi nagpo-overlap ang design profile sa alignment." | Ilipat ang mga PVI sa station range ng alignment. |
| "Kailangan ng corridor ng hindi bababa sa dalawang section sa surface." | Karamihan ng corridor ay nasa labas ng umiiral na ground. |
| "4 na side slope ang lumalampas sa surface bago tumama sa ground." | Malapit sa gilid ng surface, hindi maaabot ng slope ang ground. Ilayo ang kalsada sa gilid, o ibaba ang taas ng fill o cut doon. |
| "Nagsasalubong ang daylight line ng corridor (nagkakapatong ang mga section, halimbawa sa loob ng masikip na curve). Gumamit ng mas malaking radius o mas makitid na assembly." | Nagkakapatong ang mga section sa loob ng matalim na curve. Dagdagan ang radius o paliitin ang assembly. |

Ang corridor na may problema ay hindi ginagrade at hindi isinasama sa earthwork.

## Mga corridor at pad nang magkasama

Binubuo ang proposed surface ayon sa pagkakasunod: bawat corridor muna, saka bawat pad. Kung saan nagpo-overlap ang grading ng pad at ng corridor, mananaig ang pad. Kung saan nagpo-overlap ang susunod na item sa isang kalsada, ang bahagi lamang ng kalsada sa loob ng daylight line ng susunod na item ang papalitan; ang natitirang bahagi ng kalsada, at anumang ground breakline na tinatawid ng kalsada, ay nananatili ang hugis. Kinukuwenta ang mga volume sa loob ng lahat ng daylight line nang sabay; tingnan ang [Earthwork volumes](topic:volumes).

## Superelevation

Sa isang curve, maaaring tumagilid papunta sa loob ang kalsada, kaya hindi gaanong naitutulak ang trapiko palabas. Lagyan ng tsek ang **Superelevate the curves** sa ilalim ng **Superelevation** sa **Properties** ng alignment:

- Bawat pabilog na curve ay kumukuha ng rate na **e** mula sa rate table: ang unang row na inaabot ng radius ng curve (ang row na walang laman na rate ay pinananatili ang normal crown). Ang table at ang **Max relative gradient** (0.5 % sa umpisa) ay placeholder lamang, hindi standard: itakda ang mga ito ayon sa sarili mong design criteria. Magdagdag o magtanggal ng row ayon sa kailangan mo.
- Umiikot ang mga lane sa paligid ng centerline. Bago ang curve, pumapatag ang panlabas na lane sa ibabaw ng **runout** (normal crown ÷ e × runoff), saka sa ibabaw ng **runoff** (lane width × e ÷ gradient) patuloy na umiikot ang panlabas na lane hanggang sa ang buong kalsada ay tumagilid sa e papunta sa loob; dalawang-katlo ng runoff ay nasa bago ang curve at isang-katlo ay nasa curve mismo. Pagkatapos ng curve, nangyayari ang kabaligtaran.
- Ang shoulder sa mababang gilid ay hindi kailanman mas patag kaysa sa lane nito; sa mataas na gilid ay pinananatili nito ang sarili nitong slope (gumugulong ito).
- Inililista ng table sa ilalim nito ang radius, rate, runoff at runout ng bawat curve at kung saan nagsisimula at nagtatapos ang buong superelevation. Iginuguhit ng **superelevation diagram** ang cross slope ng dalawang lane sa kahabaan ng mga station (solid ang kaliwang lane, dashed ang kanan).
- Ang curve na masyadong maikli para maabot ang buong superelevation, o ang dalawang curve na nagpo-overlap ang transition, ay ipinapaalam sa kahon sa itaas ng table.

Ipinapakita ng mga section, volume, 3D view at mga sheet ang nakatagilid na kalsada. Isang hakbang ang bawat pagbabago: binabawi ito ng {{key:Mod+Z}}.

## Targets

Inililipat ng target ang isang punto ng isang gilid ng kalsada papunta sa isang linya: ang **Edge of pavement** o ang **Shoulder edge**, sa **Left** o sa **Right**. Nagtatagpo ang bawat section at ang linya nang patayo sa centerline, lumalabas lamang sa gilid na iyon, kaya hindi kailanman inililipat ng target sa kanan ang kaliwang gilid.

| Sets | Ano ang nangyayari kung saan nagtatagpo ang section at ang linya |
|---|---|
| **Width** | Nasa linya ang punto: lumalapad o lumiliit ang lane (o ang shoulder) hanggang dito, habang pinananatili ang cross slope nito. |
| **Elevation** | Kinukuha ng punto ang elevation ng linya doon, sa sarili nitong offset: sumusunod ang cross slope ng lane (o ng shoulder). |

Maaaring feature line ang linya (anuman ang **Use** nito) o linya ng ibang corridor: ang centerline, edge of pavement, shoulder edge o daylight line nito. Sinusunod ng linya ng corridor ang corridor na iyon: baguhin ang kabilang kalsada at susunod ang isang ito. Unang binubuo ng CivilCraft ang kabilang corridor; ang dalawang corridor na magta-target sa isa't isa sa loop ay tinatanggihan sa isang panig, at sinasabi ng table kung alin.

1. Piliin ang alignment at i-on ang corridor nito.
2. Sa ilalim ng **Targets**, i-click ang {{ui:Magdagdag ng target}}.
3. Piliin ang **Side**, ang **Point**, ang itinatakda nito (**Sets**) at ang **To the line**. Isang undo step ang bawat pagbabago.

Sinasabi ng **Result** kung sa ilang section naabot ang linya. Ang mga section na hindi ito naaabot (lampas sa mga dulo nito, o kung nasa likod ng centerline) ay pinananatili ang mga halaga ng assembly. Kapag natanggal ang linya, babalik ang corridor sa dati nitong kalagayan bago ang target, at sinasabi ito ng table. Maaaring may isang width at isang elevation target ang isang gilid para sa bawat punto.

## Build each side from parts

I-on ang **Build each side from parts** sa ilalim ng settings ng corridor. Kaya bawat gilid ay may sariling listahan, mula sa centerline palabas: mga lane, isang shoulder, isang gutter, isang curb, isang planting strip, isang sidewalk at, sa huli, ang side slope papunta sa ground (may sarili nitong cut at fill ratio). Magsimula sa {{ui:Rural road}} o {{ui:Urban street}}, magdagdag at magtanggal ng mga part, ilipat ang mga ito gamit ang mga arrow, at {{ui:Kopyahin}} ang isang gilid papunta sa kabila. Isang undo step ang bawat pagbabago.

Ang cross slope ay ang pagbaba palayo sa kalsada, kaya negatibo ang sidewalk na umaagos papunta sa kalsada. Ang curb ay isang mukha na may taas na ibinigay mo, isang tuktok na may lapad na ibinigay mo at opsyonal na drop sa likod. Ginagawang tagilid ng superelevation ang bawat lane sa unang row; ang gutter, curb, strip at sidewalk ay nakabitin mula sa gilid ng mga lane gaya ng pagkakagawa. Inililipat pa rin ng mga target ang dulo ng mga lane at ang huling part. Minamarkahan ng cross section ang gutter flowline, tuktok at likod ng curb, at ang iba pa. Sa curve na may spiral, ang runoff ay ang spiral: pantay na crown sa TS, buong superelevation sa SC.

## Mga pavement course

Maaaring magdala ng sarili nitong build-up ang isang lane, shoulder, gutter, planting strip o sidewalk: sa ilalim ng part, nagdaragdag ang {{ui:Magdagdag ng course}} ng course na may pangalan, materyal, kapal at uri nito (surface, binder, base, subbase, capping o other), mula sa itaas pababa. Hindi inililipat ng mga course ang surface ng kalsada (ang tuktok nito ang design surface); ang bawat isa ay nasa ilalim ng part nito, ang lalim nito ay sinusukat nang tuwid pababa. Iginuguhit ng cross section ang ilalim ng bawat course bilang dashed na linya, at inililista ng {{ui:Mga pavement course: dami}} ang plan area at volume ng bawat course (area sa kahabaan ng corridor mula sa mga section nito, volume = area × kapal). Isinusulat ng IFC export ang bawat course bilang sarili nitong element na may kapal at materyal nito (tingnan ang [IFC export and import](topic:ifc)). Ang kapal na itinype mo ay sa iyo: hindi tinatakdaan ng CivilCraft ang laki ng pavement.

## Where roads meet roads, pads and paths

Kapag naka-on ang {{ui:Ikonekta ang mga road at pad na nagtatagpo dito}} (naka-on ito para sa bawat corridor), ikinokonekta ng CivilCraft ang corridor sa mga nakakatagpo nito sa plano:

- **Kalsadang nagtatapos sa ibang kalsada** (ang dulo ng alignment nito ay nasa kabilang kalsada, o nasa loob ng humigit-kumulang kalahati ng sarili nitong lapad ng pavement mula sa gilid ng kalsadang iyon) ay ang side road ng isang junction. Binubuksan ng kalsadang nakakatagpo nito ang gilid nito para sa pavement ng side road: sa bunganga, ang shoulder, curb, strip at walk ay inilalatag sa cross slope ng lane at iginuguhit bilang pavement. Inilalatag ang side road sa surface ng main road kung saan nagpo-overlap ang dalawa, at pinapatag paakyat o pababa dito sa approach.
- **Dalawang kalsadang nagsasalubong** ay pinagdurugtong sa parehong paraan sa magkabilang panig. Ang kalsadang unang nakalista sa ilalim ng Alignments ang through road; ang isa ay sumusunod sa surface nito sa pagtawid.
- **Kalsadang nagtatapos sa pad** (nasa loob nito, o nasa loob ng humigit-kumulang kalahati ng lapad ng pavement mula sa gilid nito) ay umaabot sa lebel ng pad at pinapatag dito sa approach.
- **Path** (Landscape › Hardscape) ay humihinto sa panlabas na gilid ng kalsada, sa lebel ng walk o shoulder doon, sa halip na dumaan sa ibabaw ng kalsada. Nagiging dalawang piraso ang path na tumatawid sa kalsada. Ang dulong iginuhit na medyo kulang sa kalsada (sa loob ng dalawang beses ng lapad ng path) ay dinadala hanggang sa gilid nito.

Sinasabi ng Properties kung ano ang ikinonekta ng bawat corridor, gaano ito itinaas o ibinaba doon, at gaano kahaba ang saklaw. Ang haba na iyon ay ang mas malaki sa 10 m (30 ft) at dalawampung beses ng pagbabago, at hindi kailanman lalampas sa 45% ng corridor. **Hindi binabago ang design profile**: ipinapakita pa rin ng profile view ang grade line na iginuhit mo, at ipinapakita ng mga section, ng proposed surface, ng mga volume at ng 3D view ang kalsadang nakakonekta. Para maging eksakto ang pagkakakonekta sa disenyo, ilipat ang huling PVI sa lebel na iniulat ng Properties.

I-off ang switch sa isang corridor para iwan ito nang eksakto ayon sa sinasabi ng profile at assembly nito; hindi na ito makikibahagi sa anumang junction, bilang side road man o through road. Ang mga kalsadang nagtatagpo na halos nasa iisang linya (sa ilalim ng humigit-kumulang 20°) ay hindi ginagalaw, at gayundin ang mga track.

Ang mga hindi pa ginagawa ng junction: walang curb return (parisukat ang mga sulok), walang turning lane o island, ang dulo ng side road ay pinuputol nang parisukat sa sarili nitong alignment, at ang corridor na binuo mula sa mga template ay binubuksan ang gilid nito sa parehong payak na paraan (ang ditch o pader sa dulong kondisyon nito ay pinapantay sa buong bunganga, walang culvert). Para sa plan curb return, sight triangle at striping, tingnan ang [Soils, roads, survey, mines and links](topic:soils-roads-survey-mines-links).

## Hindi pa nagagawa

Hindi pa available ang mga target para sa daylight slope. Para sa corridor na nagbabago sa kahabaan ng kalsada, na magkahiwalay ang kaliwa at kanan, gamitin ang [Corridor templates](topic:corridor-templates). Tingnan ang [Hindi pa nagagawa](topic:not-built-yet).
