---
title: Corridor templates at terrain templates
summary: Gumawa ng maliliit at magagamit muling template (curb at gutter, sidewalk, wall, ditch), buuin ang corridor mula sa mga ito ayon sa station na may hiwalay na kaliwa at kanan, hatiin ang alignment sa maraming corridor, at ilatag ang layered materials sa terrain.
keywords: template, templates, template library, paggawa ng template, typical section, assembly, subassembly, components, point codes, end condition, daylight, ditch, retaining wall, curb, gutter, sidewalk, regions, station range, maraming corridor, several corridors, multiple corridors, kaliwa at kanan, terrain template, topsoil, pavement, base, drape, materials, quantities
from: ce70e58b
---

Ang **template** ay maliit na cross-section na iginuguhit mo nang isang beses at ginagamit muli: mga punto na may offsets, slopes at point codes, at components na may materials. Maaaring buuin ang corridor mula sa mga template ayon sa station, bawat gilid ay may sariling pavement templates at sariling end condition, at maaaring ilatag ang parehong template sa terrain.

:::warning
Ang mga halimbawang template ay mga panimulang placeholder. Hindi galing sa anumang pamantayan o ahensya ang mga numero nila. Dapat suriin ng isang engineer ang bawat template, at bawat value na ibibigay mo rito, bago gamitin sa disenyo.
:::

## Buksan ang templates

Buksan ang {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (o i-type ang {{cmd:TEMPLATES}}). May tatlong listahan ang window:

- **In this project**: ang mga template na ginagamit ng corridors at terrain templates ng project na ito. Naka-save ang mga ito sa project file.
- **My library**: mga template na nakatago sa browser na ito at inaalok sa bawat project. Gamitin ang {{ui:Save to My library}} sa project template para itago ito.
- **Examples**: dalawang lane na may courses, curb at gutter, sidewalk, daylight, ditch, retaining wall, topsoil sa ilalim ng terrain, at pavement sa terrain. May markang "For checking by an engineer" ang bawat isa.

Kinokopya ng {{ui:Use in this project}} ang library o example template papunta sa project. Sine-save ng {{ui:Export this project's templates}} ang mga ito bilang `.cctemplates.json` file, at binabasa ng {{ui:Import a file}} ang isa papunta sa project at sa My library. Gamitin ang file para magbahagi ng templates o ilipat ang mga ito sa ibang computer.

## Gumawa ng template

Binubuksan ng {{ui:New template}} (o ng {{ui:Edit}} sa project template) ang template editor. Iguhit ang kanang bahagi, palabas mula sa 0,0 point ng template; ginagamit ng kaliwang bahagi ang parehong template palabas sa kaliwa.

1. Bigyan ito ng pangalan at uri: **Pavement** (ang susunod na template ay didikit sa dulo nito), **End condition** (sumasalubong ito sa ground) o **Terrain template**.
2. Magdagdag ng **values**: mga pinangalanang numero gaya ng lapad na `w` o slope na `s`. Ang number box saanman sa template ay tumatanggap ng numero o pangalan ng value; ang `-t` ay ang value na `t` na ginawang negatibo. Maaaring bigyan ng corridor ang bawat paggamit ng template ng sarili nitong values, kaya isang curb template ay nagsisilbi sa bawat taas ng curb.
3. Magdagdag ng **points** nang sunud-sunod. Bawat isa ay inilalagay mula sa naunang punto (o sa 0,0 point) ayon sa constraint nito:

| Constraint | Inilalagay ang punto |
|---|---|
| Offset at a slope | Isang offset palabas at isang slope (rise kada run; ang −0.02 ay bumababa ng 2%) |
| Offset and rise | Isang offset at isang rise |
| Straight up or down | Rise lamang |
| Side slope to the ground | Palabas mula sa punto nito hanggang sa ground, sa cut ratio kung nasa itaas ng ground ang lupa at sa fill ratio kung nasa ibaba |
| To the ground | Isang offset, saka tuwid pataas o pababa hanggang sa ground |
| Retaining wall | Isang pader na may kapal na ibibigay mo: sa cut, ang itaas nito ay sumasalubong sa ground sa mukha ng kalsada; sa fill, dumadaan ang kalsada sa ibabaw nito at bumababa ang panlabas na mukha nito hanggang sa ground |

   Lagyan ng tsek ang **Top** para sa mga punto na dinaraanan ng tapos na surface. Ang huling top point ay kung saan nagsisimula ang susunod na template sa gilid na iyon. Ang **Target** ay nagpapahintulot sa corridor na ilipat ang punto: ang offset o elevation nito ay nagmumula sa isang linya.
4. Magdagdag ng **components**: saradong hugis sa pamamagitan ng point codes (`0` ang 0,0 point), bawat isa ay may pangalan, material at uri. Ang mga area nila ang nagbibigay ng volumes.

Sinusundan ng drawing ang bawat pagbabago sa tunay na sukat, at sinasabi ng listahan sa ilalim nito kung ano ang mali (punto na sumasalubong sa ground bago ang dulo, value na wala sa template, component na walang area). Itinatago ito ng {{ui:Add to this project}} o {{ui:Save}}, bilang isang undo step.

## Buuin ang corridor mula sa templates

Pumili ng alignment na may corridor at, sa Properties nito, i-on ang {{ui:Build from templates by station}}. Nagsisimula ang corridor sa dalawang-lanes at daylight examples sa magkabilang gilid.

- **Regions.** Nagsisimula ang bawat region sa isang station at tumatakbo hanggang sa simula ng susunod na region. Nagdaragdag ng isa ang {{ui:Add a region}}; baguhin ang start station nito sa kahon nito.
- **Kaliwa at kanan, hiwalay.** May sariling listahan ng **Pavement** ang bawat gilid ng bawat region, mula centerline palabas, at sariling **End condition**: daylight, ditch, pader, o anumang template na sumasalubong sa ground. Kapag walang end condition, nagda-daylight ang gilid sa cut at fill slopes ng corridor. Kinokopya ng {{ui:Copy left to right}} ang isang gilid.
- **Values at targets.** Sa ilalim ng bawat template sa isang gilid, may kahon bawat value (walang laman = sariling value ng template) at, para sa punto na tumatanggap ng target, ang feature line o linya ng ibang corridor na gumagalaw dito.
- **From at To** ay naglilimita sa corridor sa bahagi ng alignment.

Sumusunod ang mga section, plan lines para sa bawat point code, ang proposed surface, staking at earthwork. Ipinapakita ng Properties ang volume ng bawat component kada gilid at region (average end areas sa kahabaan ng centerline). Hindi ginagamit ang superelevation at edge targets ng corridor habang binubuo ito mula sa templates.

## Maraming corridor sa isang alignment

Sa ilalim ng **Corridors on this alignment**, nagdaragdag ang {{ui:Add a corridor}} ng corridor sa natitirang bahagi ng alignment: ang unang corridor ay binibigyan ng end station sa gitna (o pinananatili ang sarili nito), at ang bago ay nagsisimula roon kasama ang huling region ng templates ng una. May sariling pangalan, station range, templates at earthwork ang bawat corridor. I-off ang isa sa pamamagitan ng kahon ng {{ui:On}} nito. Kung nagsasapawan ang mga range, ang mas huling corridor ang nagi-grade sa ibabaw ng naunang corridor.

## Terrain templates

Inilalatag ng terrain template ang mga layer ng template sa isang terrain mula sa 0,0 point nito: ang layer na nasa ibaba ng 0,0 point ay napupunta sa ground (topsoil na tatanggalin), ang layer na nasa itaas nito ay nakapatong sa ground (base at pavement sa parking lot). Hindi mahalaga ang lapad at slope; ang mahalaga lamang ay ang lalim ng bawat component sa itaas o ibaba ng 0,0 point.

Buksan ang {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (o i-type ang {{cmd:TERRAINTEMPLATES}}); nasa Properties din ng project ang block. Nagdaragdag ang {{ui:Add a terrain template}} ng isa na may topsoil example. Para sa bawat isa, pumili ng:

- ang **template** (maaaring baguhin ang values nito para sa isang ito),
- ang **terrain**: ang existing ground o ang proposed surface,
- ang **shape** na nagpuputol dito: ang buong terrain, isang parcel, pad, o saradong feature line. Maaaring gumamit ng magkakaibang shape sa parehong terrain ang ilang terrain template.

Inililista ng bawat layer ang kapal, plan area at volume nito. Ang volume ay plan area na pinarami ng kapal, sinusukat nang tuwid pababa ang kapal; sinusukat sa grid ang area, at ibinibigay rin ang draped (sloped) area. Iginuguhit sa plano ang mga shape sa layer C-TOPO-TMPL. Hindi binabago ng terrain templates ang proposed surface.

## Materials at quantities

Inililista ng Earthwork block ng project ang **Materials from templates**: bawat corridor component at terrain template layer kasama ang volume nito. Isinusulat ng {{ui:Send to TakeoffCraft}} ang mga ito sa quantities file pagkatapos ng cut at fill, isang item bawat isa, sa cubic yards (feet projects) o cubic metres.

## Files

Naka-save sa project file ang templates, regions, mga dagdag na corridor at ang terrain templates. Ang project na walang gamit sa mga ito ay naka-save nang eksaktong gaya ng dati, at nagbubukas ang mga mas lumang build ng CivilCraft ng project na may mga ito (binabalewala nila ang templates at binubuo ang sariling assembly ng corridor).
