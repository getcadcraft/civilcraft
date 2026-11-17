---
title: Sample lines at cross section
summary: Hiwain ang mga section nang patayo sa isang alignment, tingnan ang lupa, ang disenyo at ang cut at fill sa bawat station, at kunin ang volume ayon sa average end area.
keywords: mass haul, mass diagram, balance point, shrink, swell, haul distance, borrow, waste, section sheets, cross section sheets, sections pdf, sections, cross sections, sample lines, section view, cut, fill, areas, average end area, end area volumes, earthwork, station, offset, csv
from: 5060173c
---

Ang cross section ay nagpapakita ng kalsada sa paraang itatayo ito: patawid sa alignment sa isang station, ang kasalukuyang lupa, ang disenyo (ang corridor o pad na ginrade) at ang cut at fill sa pagitan ng mga ito.

## Idagdag ang sample lines

1. Pumili ng alignment. Sa **Properties**, sa ilalim ng **Sample lines**, i-click ang {{ui:Add sample lines}}.
2. Itakda ang **Every** (ang spacing: 50 ft o 20 m bilang panimula), **Left width** at **Right width** (gaano kalayo aabot ang bawat section mula sa centerline).
3. Para mag-cut ng section sa isang partikular na station, i-type ito sa **Add a station** (halimbawa `2+35`) at pindutin ang {{key:Enter}}.

Ginagawa ang mga section sa bawat buong multiple ng spacing, sa parehong dulo ng alignment, sa simula at dulo ng bawat curve (PC at PT), at sa mga station na idinagdag ninyo. Ipinapakita ang sample lines sa plan bilang kulay-abong linya sa kabila ng alignment; kasama rin ang mga ito sa DXF, DWG at PDF sa layer C-ROAD-SCTN. Bawat pagbabago ay isang hakbang: binabawi ito ng {{key:Mod+Z}}.

## Ang section view

Buksan ito sa pamamagitan ng {{ui:Section view}} sa **Properties** ng alignment, ng {{ui:Sections}} sa ilalim ng **Surface** › {{ui:More}}, o ng {{key:X}}. Pumapalit ito sa profile view sa ilalim ng plan.

- Hakbangin ang mga section gamit ang mga arrow sa bar nito, ang listahan ng station, o ang {{key:Left}} at {{key:Right}} kapag nakatutok ang section view ({{key:Home}} at {{key:End}} para sa una at huli).
- Ang kulay-abong linya ay ang kasalukuyang lupa, ang pulang linya ang disenyo. Naka-shade na kahel ang cut, berde ang fill. Namamarkahan ang mga corridor point: CL (centerline), EOP (edge of pavement), SH (shoulder) at DL (daylight).
- Ipinapakita ng header ang station, ang cut at fill area ng section na ito at ang vertical exaggeration. Pinupuno ng **Fit** ang panel; pumili ng 1× para makita ang section sa tunay na sukat.
- Ang makapal na linya sa plan ay nagpapakita kung aling section ang nasa screen.

## Section sheets

Inilalagay ng {{ui:Section sheets (PDF)}} sa ilalim ng **Sample lines** ang bawat section sa mga pahina ng PDF, sa mga hanay mula kaliwa pakanan at mula itaas pababa ayon sa pagkakasunod ng station. Piliin ang **Paper**, ang **Plan scale** (ang pahalang na sukat ng mga section) at ang **Profile exaggeration** (1×, 2×, 5× o 10×); sinasabi ng dialog kung ilang section ang kasya sa isang pahina at ilang pahina ang kabuuan nito.

Bawat section ay nagpapakita ng grid na may offset at elevation, ang lupa (may gitling), ang disenyo, ang cut at fill na naka-shade (kahel at berde), ang corridor point, at sa ilalim nito ang station at ang cut at fill area nito. Pare-pareho ang laki ng bawat section sa mga sheet, sapat ang taas para sa pinakamalaki; kapag hindi ito kasya sa pahina sa inyong exaggeration, ginagamit ng CivilCraft ang pinakamalaking kasya at sinasabi ito. Pinangangalanan ng title strip ang alignment, ang mga station sa pahinang iyon, ang mga sukat at ang "Sheet 1 of 3".

## Volume ayon sa average end area

Sa pagitan ng dalawang magkatabing section, ang volume ay ang average ng dalawa nilang area na i-multiply sa distansya ng kanilang mga station. Ipinapakita ng bar ang kabuuan para sa alignment, at ang {{ui:CSV}} ay nagda-download ng area at volume ng bawat section kasama ang running total (cubic yards para sa feet na proyekto, cubic meters para sa metric).

Ipinapakita ng **Properties** ang parehong kabuuan sa tabi ng grid-method volume mula sa [Earthwork volumes](topic:volumes). Magkaiba ang dalawa bilang approximation: nagpapalapit sa isa't isa ang mas malapit na section, at sa tuwid na kalsada sa patag na lupa ay pareho sila.

:::note
Binibilang lamang ang cut at fill sa loob ng mga naka-grade na lugar (ang daylight line ng corridor o pad), gaya ng grid method. Kapag walang corridor o pad, ang disenyo ay ang lupa mismo, kaya walang ipinapakitang cut o fill ang section.
:::

## Mass haul

Iginuguhit ng **Mass haul** sa ilalim ng **Sample lines** ang mass-haul diagram mula sa parehong end-area volume: sa kahabaan ng mga station, ang running total ng cut minus fill.

- **Shrink (−) or swell (+) of the cut** ay nagsasabi kung ano ang nagiging isang cubic yard ng cut kapag inilatag bilang fill: −10 % (ang panimulang value, placeholder) ay nangangahulugang lumiliit sa 0.9; ang batong lumalaki ay maaaring +5 %. Gamitin ang bilang mula sa inyong geotechnical report.
- Kung saan tumataas ang linya, nasa cut ang kalsada; kung saan bumababa, nasa fill. Sa itaas ng zero (naka-shade na kahel) ang lupang gumagalaw paakyat ng station; sa ibaba ng zero (berde), pababa ng station.
- Ang **balance point** ay kung saan tumatawid ang linya sa zero: sa pagitan ng dalawa sa mga ito, nagbabalanse ang cut at fill. Inililista ng table ang bawat balanseng bahagi, ang volume na inilipat (ang pinakamataas o pinakamababang punto nito) at ang average na haul distance (ang naka-shade na area na hinati sa volume na iyon).
- Kung saan nagtatapos ang linya na wala sa zero, ang natitira ay **waste** (nasa itaas) o **borrow** (nasa ibaba). Sa huling bahaging iyon, tanging ang lupang lampas sa lebel kung saan ito nagtatapos ang binibilang na inilipat.

Sine-save ng **CSV** ang mass ordinate sa bawat section, ang mga bahagi at ang factor.
