---
title: I-sweep ang road corridor
summary: I-on ang corridor para sa isang alignment, itakda ang lane, shoulder at side slope values, at basahin ang sections, daylight lines at earthwork na nalilikha nito.
keywords: superelevation, super, banking, runoff, runout, talaan ng rate, cross slope, rotation, corridor, assembly, subassembly, typical section, road, kalsada, lane, shoulder, cross slope, side slope, daylight, cut, fill, sections, target, targets, width target, elevation target, offset target, pagpapalapad, gilid ng pavement, sumunod sa ibang corridor
from: 91303189
---

Ang corridor ay nagsa-sweep ng isang simpleng typical section (isang assembly) sa kahabaan ng alignment at design profile nito, ginagrade ito sa existing ground, at idinadagdag ang resulta sa proposed surface. Maaaring magdala ang isang alignment ng maraming corridor sa magkakaibang station range, at maaaring buuin ang corridor mula sa magagamit muling templates ayon sa station ([Mga corridor template](topic:corridor-templates)). Pareho sa magkabilang gilid ang simpleng assembly sa ibaba; para bigyan ang bawat gilid ng sariling bahagi, tingnan ang [Buuin ang bawat gilid mula sa mga bahagi](topic:corridor#build-each-side-from-parts).

## Ang assembly

Mula sa centerline palabas, sa bawat gilid:

1. isang **lane** na may given na lapad, na bumababa mula sa crown sa **lane slope**
2. isang **shoulder** na may given na lapad sa **shoulder slope**
3. isang **side slope** mula sa gilid ng shoulder hanggang sa pagtatagpo nito sa ground: ang **cut slope** kung nasa itaas ng ground ang lupa, ang **fill slope** kung nasa ibaba

Ang mga panimulang value ay placeholders, hindi design standard:

| Halaga | US feet | Metres |
|---|---|---|
| Lapad ng lane | 12 ft | 3.6 m |
| Lane slope | 2% | 2% |
| Lapad ng shoulder | 4 ft | 1.2 m |
| Shoulder slope | 4% | 4% |
| Cut slope | 2 : 1 | 2 : 1 |
| Fill slope | 3 : 1 | 3 : 1 |
| Section kada | 10 ft | 5 m |

Ang slopes para sa side slopes ay horizontal sa vertical (H:V): ang 3 : 1 ay nangangahulugang 3 pahalang para sa 1 pababa.

## Buuin ang corridor

Kailangan mo ng alignment na walang error at design profile na may hindi bababa sa dalawang PVI at walang error.

1. Piliin ang alignment.
2. Sa kanang panel, sa ilalim ng **Corridor**, lagyan ng tsek ang **Sweep an assembly along the design profile**.
   Lumalabas ang mga field at agad nabubuo ang corridor. Ipinapakita ng plano ang mga gilid ng lane at shoulder at ang daylight lines; kapag napili ang {{ui:Proposed (graded)}} sa ilalim ng **Display**, ipinapakita ng contours ang bagong ground.
3. Baguhin ang anumang value: **Lane width**, **Lane slope**, **Shoulder width**, **Shoulder slope**, **Cut slope**, **Fill slope**, **Section every**. Pindutin ang {{key:Enter}} pagkatapos ng bawat isa. Dapat higit sa 0 ang cut, fill at section spacing.
4. Basahin ang linyang nasa ilalim ng mga field, halimbawa "39 sections from 0+00.00 to 3+86.36; cut 240.2 cu yd, fill 556.0 cu yd."

Ginugupit ang sections sa bawat hakbang ng **Section every**, sa mga dulo, at sa simula at dulo ng bawat horizontal at vertical curve. Bawat section at ang mga linyang dumadaan sa kanila (centerline, gilid ng lane at shoulder, daylight) ay nagiging breaklines ng proposed surface.

Para i-off ang corridor, alisin ang tsek sa kahon. Nananatili ang mga value nito para sa susunod.

## Kapag hindi ito nabubuo

Ipinapaliwanag ng pulang kahon sa ilalim ng mga field kung bakit:

| Mensahe | Ano ang gagawin |
|---|---|
| "Kailangan ng corridor ng design profile na walang error." | Magdagdag ng PVIs, o ayusin ang nagsasapawang vertical curves (tingnan ang [Magdisenyo ng vertical profile](topic:profile)). |
| "Hindi nagsasapawan ang design profile at ang alignment." | Ilipat ang mga PVI sa station range ng alignment. |
| "Kailangan ng corridor ng hindi bababa sa dalawang section sa surface." | Karamihan ng corridor ay nasa labas ng existing ground. |
| "4 na side slope ang lumalampas sa surface bago sumalubong sa ground." | Malapit sa gilid ng surface, hindi maabot ng slope ang ground. Ilayo ang kalsada sa gilid, o ibaba ang taas ng fill o cut doon. |
| "Nagsasalubong ang daylight lines ng corridor (nagsasapawan ang sections, halimbawa sa loob ng masikip na curve). Gumamit ng mas malaking radius o mas makitid na assembly." | Nagsasapawan ang sections sa loob ng matalas na curve. Palakihin ang radius o paliitin ang assembly. |

Ang corridor na may problema ay hindi ginagrade at hindi binibilang sa earthwork.

## Corridors at pads nang magkasama

Binubuo ang proposed surface nang sunod-sunod: bawat corridor muna, saka bawat pad. Kapag nagsasapawan ang grading ng pad at corridor, nananalo ang pad. Kinukuwenta ang volumes sa loob ng lahat ng daylight lines nang sabay; tingnan ang [Earthwork volumes](topic:volumes).

## Superelevation

Sa kahabaan ng curve, maaaring tumagilid ang kalsada papunta sa loob, para mas kaunti ang itulak ng trapiko palabas. Lagyan ng tsek ang **Superelevate the curves** sa ilalim ng **Superelevation** sa **Properties** ng alignment:

- Ang bawat circular curve ay kumukuha ng rate na **e** mula sa rate table: ang unang row na inaabot ng radius ng curve (ang row na walang rate ay pinananatili ang normal crown). Ang table at ang **Max relative gradient** (0.5 % para magsimula) ay placeholders, hindi pamantayan: itakda ang mga ito ayon sa sarili mong design criteria. Magdagdag o magtanggal ng row ayon sa kailangan.
- Umiikot ang mga lane sa paligid ng centerline. Bago ang curve, pinapatag ng outside lane ang sarili sa **runout** (normal crown ÷ e × runoff), saka sa **runoff** (lapad ng lane × e ÷ gradient) patuloy na umiikot ang outside lane hanggang ang buong kalsada ay dumadausdos sa e papunta sa loob; dalawang-katlo ng runoff ay nasa unahan ng curve at isang-katlo ay nasa curve. Pagkatapos ng curve, nangyayari ang kabaligtaran.
- Ang shoulder sa mababang gilid ay hindi kailanman mas patag sa lane nito; sa mataas na gilid, pinapanatili nito ang sarili nitong slope (gumugulong ito).
- Ang table sa ilalim nito ay naglilista ng radius, rate, runoff at runout ng bawat curve, at kung saan nagsisimula at nagtatapos ang buong superelevation. Iginuguhit ng **superelevation diagram** ang cross slopes ng parehong lane sa kahabaan ng stations (solid ang kaliwang lane, dashed ang kanan).
- Ang curve na masyadong maikli para maabot ang buong superelevation, o dalawang curve na nagsasapawan ang transition, ay sinasabi sa kahon sa itaas ng table.

Ipinapakita ng sections, volumes, 3D view at sheets ang nakatagilid na kalsada. Bawat pagbabago ay isang hakbang: iuundo ito ng {{key:Mod+Z}}.

## Targets

Inililipat ng target ang isang punto ng isang gilid ng kalsada papunta sa isang linya: ang **Edge of pavement** o ang **Shoulder edge**, sa **Left** o **Right**. Tumatama ang bawat section sa linya nang tuwid sa centerline, palabas lamang sa gilid na iyon, kaya hindi kailanman inililipat ng target sa kanan ang kaliwang gilid.

| Nagtatakda | Ang nangyayari kung saan tumatama ang section sa linya |
|---|---|
| **Width** | Nakapatong ang punto sa linya: lumalapad o lumiliit ang lane (o ang shoulder) hanggang doon, pinapanatili ang cross slope nito. |
| **Elevation** | Kinukuha ng punto ang elevation ng linya roon, sa sarili nitong offset: sumusunod ang cross slope ng lane (o shoulder). |

Maaaring feature line ang linya (anuman ang **Use** nito) o linya ng ibang corridor: ang centerline nito, edges of pavement, shoulder edges o daylight lines. Sumusunod ang linya ng corridor sa corridor na iyon: baguhin ang kabilang kalsada at susunod ang isang ito. Inuuna ng CivilCraft ang ibang corridor; ang dalawang corridor na magta-target sa isa't isa sa loop ay tinatanggihan sa isang gilid, at sinasabi ng table kung alin.

1. Piliin ang alignment at i-on ang corridor nito.
2. Sa ilalim ng **Targets**, i-click ang {{ui:Add a target}}.
3. Piliin ang **Side**, ang **Point**, kung ano ang **Sets** at ang **To the line**. Bawat pagbabago ay isang undo step.

**Result** ay nagsasabi sa ilang section naabot ang linya. Ang mga section na hindi umabot (lampas sa mga dulo nito, o nasa likod ng centerline) ay pinananatili ang mga value ng assembly. Kapag nabura ang linya, bumabalik ang corridor sa dati bago ang target, at sinasabi ito ng table. Maaaring magkaroon ng isang width target at isang elevation target ang isang gilid para sa bawat punto.

## Buuin ang bawat gilid mula sa mga bahagi

I-on ang **Build each side from parts** sa ilalim ng settings ng corridor. May sariling listahan na ang bawat gilid, mula centerline palabas: lanes, shoulder, gutter, curb, planting strip, sidewalk at, huli, ang side slope papunta sa ground (may sariling cut at fill ratios). Magsimula sa {{ui:Rural road}} o {{ui:Urban street}}, magdagdag at magtanggal ng mga bahagi, ilipat ang mga ito gamit ang arrows, at {{ui:Copy}} ang isang gilid papunta sa kabila. Bawat pagbabago ay isang undo step.

Ang cross slope ay ang pagbaba palayo sa kalsada, kaya negatibo ang sidewalk na umaagos papunta sa kalsada. Ang curb ay isang mukha na may taas na ibibigay mo, isang tuktok na may lapad na ibibigay mo, at opsyonal na drop sa likod. Iniikot ng superelevation ang bawat lane sa unang row; ang gutter, curb, strip at sidewalk ay nakabitin mula sa gilid ng mga lane gaya ng pagkakabuo nila. Ginagalaw pa rin ng targets ang dulo ng mga lane at ang huling bahagi. Minamarkahan ng cross sections ang gutter flowline, tuktok at likod ng curb, at ang iba pa. Sa curve na may spirals, ang runoff ay ang spiral: level crown sa TS, buong superelevation sa SC.

## Pavement courses

Maaaring magdala ang lane, shoulder, gutter, planting strip o sidewalk ng sarili nitong build-up: sa ilalim ng bahagi, nagdaragdag ang {{ui:Add a course}} ng course na may pangalan, material, kapal at uri nito (surface, binder, base, subbase, capping o iba pa), mula itaas pababa. Hindi ginagalaw ng courses ang surface ng kalsada (ang itaas nito ay ang design surface); bawat isa ay nasa ilalim ng bahagi nito, sinusukat ang lalim nito nang tuwid pababa. Iginuguhit ng cross sections ang ilalim ng bawat course bilang dashed na linya, at inililista ng {{ui:Pavement courses: quantities}} ang plan area at volume ng bawat course (area sa kahabaan ng corridor mula sa sections nito, volume = area × kapal). Isinusulat ng IFC export ang bawat course bilang sariling element na may kapal at material nito (tingnan ang [IFC export at import](topic:ifc)). Ang kapal na itinype mo ay sa iyo: hindi nagsusukat ng pavements ang CivilCraft.

## Ano ang hindi pa nabubuo

Hindi pa available ang targets para sa daylight slope. Para sa corridor na nagbabago sa kahabaan ng kalsada, na may kaliwa at kanan na hiwalay, gamitin ang [Corridor templates](topic:corridor-templates). Tingnan ang [Hindi pa nabubuo](topic:not-built-yet).
