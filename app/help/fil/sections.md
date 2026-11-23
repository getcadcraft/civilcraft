---
title: Sample lines at cross section
summary: Gupitin ang mga section nang patayo sa alignment, tingnan ang ground, ang design at ang cut at fill sa bawat station, at kumuha ng volume sa pamamagitan ng average end area.
keywords: mass haul, mass diagram, balance point, shrink, swell, haul distance, borrow, waste, section sheets, cross section sheets, sections pdf, sections, cross sections, sample lines, section view, cut, fill, areas, average end area, end area volumes, earthwork, station, offset, csv
from: 09639ce2
---

Ipinapakita ng cross section ang kalsada sa paraan ng pagkakagawa nito: nakahalang sa alignment sa isang station, ang umiiral na ground, ang design (ang corridor o pad na ginrade) at ang cut at fill sa pagitan nila.

## Magdagdag ng sample line

1. Piliin ang alignment. Sa **Properties**, sa ilalim ng **Sample lines**, i-click ang {{ui:Idagdag ang sample lines}}.
2. Itakda ang **Every** (ang espasyo: 50 ft o 20 m sa umpisa), **Left width** at **Right width** (gaano kalayo ang abot ng bawat section mula sa centerline).
3. Para gupitin ang section sa partikular na station, i-type ito sa **Add a station** (halimbawa `2+35`) at pindutin ang {{key:Enter}}.

Ginugupit ang mga section sa bawat buong multiple ng espasyo, sa magkabilang dulo ng alignment, sa simula at dulo ng bawat curve (PC at PT), at sa mga station na idinagdag mo. Lumalabas ang mga sample line sa plano bilang kulay abong linya sa kabila ng alignment; napupunta rin ang mga ito sa DXF, DWG at PDF sa layer na C-ROAD-SCTN. Isang hakbang ang bawat pagbabago: binabawi ito ng {{key:Mod+Z}}.

## Ang section view

Buksan ito gamit ang {{ui:Section view}} sa **Properties** ng alignment, ang {{ui:Sections}} sa ilalim ng **Surface** › {{ui:More}}, o ang {{key:X}}. Ito ang pumapalit sa profile view sa ilalim ng plano.

- Hakbangin ang mga section gamit ang mga arrow sa bar nito, ang listahan ng station, o ang {{key:Left}} at {{key:Right}} kapag nakatutok ang section view ({{key:Home}} at {{key:End}} para sa una at huli).
- Ang kulay abong linya ay ang umiiral na ground, ang pulang linya ang design. Kulay orange ang cut, berde ang fill. Namarkahan ang mga corridor point: CL (centerline), EOP (edge of pavement), SH (shoulder) at DL (daylight).
- Ibinibigay ng header ang station, ang cut at fill area ng section na ito at ang vertical exaggeration. Pinupuno ng **Fit** ang panel; piliin ang 1× para makita ang section sa tunay na sukat.
- Ipinapakita ng makapal na linya sa plano kung aling section ang nasa screen.
- **Zoom at pan:** nagza-zoom ang wheel sa paligid ng pointer, at ginagalaw ng pag-drag ang view. Ibinabalik sa buong section ang {{ui:Fit}} (o {{key:F}}, o double click).

## Sukatin sa section

1. I-click ang {{ui:Sukatin}} sa section bar, o pindutin ang {{key:M}}. Sinasabi ng hint na "I-click ang unang punto, saka ang pangalawa."
2. I-click ang dalawang punto. Bawat isa ay dumidikit sa dulo ng linya o sa corridor point (CL, EOP, SH, DL); pindutin at hawakan ang {{key:Alt}} para sa malayang punto.
3. Ibinibigay ng readout ang horizontal distance (ΔH), vertical distance (ΔV), ang slope sa porsyento kasama ang ratio nito, at ang tuwid na haba, sa mga unit ng proyekto.

I-click muli para magsimula ng bagong sukat. Binubura ito ng {{key:Esc}}, at pinapatay ng {{key:M}} ang Sukatin.

## Section sheets

Inilalagay ng {{ui:Section sheets (PDF)}} sa ilalim ng **Sample lines** ang bawat section sa mga pahina ng PDF, sa mga hilera mula kaliwa pakanan at mula itaas pababa ayon sa pagkakasunod ng station. Piliin ang **Paper**, ang **Plan scale** (ang pahalang na sukat ng mga section) at ang **Profile exaggeration** (1×, 2×, 5× o 10×); sinasabi ng dialog kung ilang section ang kasya sa isang pahina at ilang pahina ang kalalabasan.

Bawat section ay nagpapakita ng grid na may offset at elevation, ang ground (dashed), ang design, ang cut at fill na may shading (orange at berde), ang mga corridor point, at sa ilalim nito ang station at ang cut at fill area nito. Iisa ang laki ng bawat section sa mga sheet, sapat na taas para sa pinakamalaki; kapag hindi ito kasya sa pahina sa iyong exaggeration, ginagamit ng CivilCraft ang pinakamalaking kasya at sinasabi ito. Pinangalanan ng title strip ang alignment, ang mga station sa pahinang iyon, ang mga sukat at ang "Sheet 1 of 3".

## Hanggang saan sinusukat ang cut at fill

Maaaring may mga layer ang corridor sa ilalim ng pavement: pavement course, bahagi ng template, track. Pinipili ng **Volumes measured to** sa section bar kung hanggang saan aabot ang cut at fill:

- **Bottom surface** (ang umpisa): hanggang sa ilalim ng mga bahaging iyon, kaya kasama sa cut ang lalim ng build-up ng pavement.
- **Top surface**: hanggang sa tuktok ng design lamang, gaya ng dati bago binilang ang mga bahagi.

Sumusunod sa pagpiling ito ang mga area sa header, ang mga volume sa ibaba, ang CSV at ang mass haul, at naka-save ito kasama ng proyekto.

## Volume sa pamamagitan ng average end area

Sa pagitan ng dalawang magkatabing section, ang volume ay ang average ng dalawang area nila na pinarami ng distansya ng kanilang station. Ipinapakita ng bar ang kabuuan para sa alignment, at dina-download ng {{ui:CSV}} ang area at volume ng bawat section kasama ang tumatakbong kabuuan (cubic yards para sa proyektong feet, cubic meters para sa metric).

Ipinapakita ng **Properties** ang parehong kabuuan sa tabi ng grid-method volume mula sa [Earthwork volumes](topic:volumes). Magkaiba ang dalawang tantya: nagkakalapit ang mga ito kapag mas malapit ang mga section, at magkapareho ang mga ito sa tuwid na kalsada sa patag na lupa.

:::note
Binibilang ang cut at fill sa loob lamang ng mga graded area (daylight line ng corridor o pad), gaya ng ginagawa ng grid method. Kapag walang corridor o pad, ang design ay ang ground, kaya walang cut o fill na ipinapakita ang section.
:::

## Mass haul

Iginuguhit ng **Mass haul** sa ilalim ng **Sample lines** ang mass-haul diagram mula sa parehong end-area volume: sa kahabaan ng mga station, ang tumatakbong kabuuan ng cut na minus fill.

- Sinasabi ng **Shrink (−) o swell (+) ng cut** kung ano ang nagiging isang cubic yard ng cut kapag nailagay na bilang fill: ang −10 % (ang panimulang halaga, placeholder) ay nangangahulugang lumiliit ito sa 0.9; ang batong lumalaki ay maaaring +5 %. Gamitin ang numero mula sa iyong geotechnical report.
- Kung saan tumataas ang linya, nasa cut ang kalsada; kung saan bumababa, nasa fill. Sa itaas ng zero (may orange na shading) ang lupang gumagalaw pataas ng station; sa ibaba ng zero (berde), pababa ng station.
- Ang **balance point** ay kung saan tumatawid sa zero ang linya: sa pagitan ng dalawa, balanse ang cut at fill. Inililista ng table ang bawat balanseng bahagi, ang volume na nailipat (ang pinakamataas o pinakamababang punto nito) at ang average na haul distance (ang shaded area na hinati sa volume na iyon).
- Kung saan nagtatapos ang linya na hindi nasa zero, ang natitira ay **waste** (sa itaas) o **borrow** (sa ibaba). Sa huling bahaging iyon, tanging ang lupang lampas sa lebel kung saan ito nagtatapos ang binibilang na nailipat.

Sine-save ng **CSV** ang mass ordinate sa bawat section, ang mga bahagi at ang factor.
