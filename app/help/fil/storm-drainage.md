---
title: Kalkulahin ang storm flows, sukat ng tubo at hydraulic grade line
summary: Iguhit ang mga catchment na dumadaloy sa bawat structure, pagsamahin ang mga flow sa buong network gamit ang rational method, sukatin ang mga tubo gamit ang equation ni Manning, at tingnan kung saan napupuno ang hydraulic grade line o umaabot sa ibabaw.
keywords: storm drainage, catchment, drainage area, rational method, runoff coefficient, time of concentration, rainfall intensity, idf, manning, pagsukat ng tubo, hydraulic grade line, hgl, energy grade line, egl, surcharge, pagbaha, tailwater
from: e44872ec
---

Gumagana ang storm drainage sa [pipe network](topic:pipe-network): iguhit muna ang network, saka ang mga lugar na dumadaloy dito. Lumalabas ang lahat sa ilalim ng **Storm drainage** sa kanang panel kapag walang napiling bagay.

## Gumuhit ng catchment

1. I-click ang **Gumuhit ng catchment** sa ilalim ng **Storm drainage**.
2. I-click ang mga sulok ng lugar na dumadaloy sa isang structure. {{key:Enter}} o double-click ang tatapos; {{key:Backspace}} ang magbabalik sa huling sulok; {{key:Esc}} ang hihinto.
3. Dadaloy ang catchment sa structure na nasa loob nito, o sa pinakamalapit. Bubukas ang **Properties** nito: itakda ang pangalan, ang **Runoff coefficient C** (ang bahagi ng ulan na dumadaloy, 0 hanggang 1), ang **Time of concentration** sa minuto, at aling structure ang **Dumadaloy sa**.

**Gumuhit ng isa pang catchment** sa Properties nito ay sisimulan ang susunod. I-click sa loob ng catchment sa plan para mapili ito; inaalis ito ng {{key:Delete}}. Bawat pagbabago ay isang step: binabawi ito ng {{key:Mod+Z}}.

## Itakda ang design storm

Ang rainfall intensity ay i = a ÷ (tc + b), na itinaas sa lakas na c, sa inches per hour para sa feet na project at millimeters per hour para sa meter na project. I-fit ang **Intensity a**, **b** at **c** sa sarili mong intensity-duration-frequency curve para sa return period na dinidisenyo mo.

:::warning
Placeholder lang ang panimulang intensity curve, Manning n (0.013) at junction loss (0.5), hindi pamantayan. Itakda ang mga ito batay sa sarili mong rainfall data at design criteria.
:::

- **Shortest time of concentration**: walang tubong kinakalkula sa mas maikling oras kaysa dito (10 minuto sa simula).
- **Manning n**: ang roughness ng mga tubo.
- **Junction loss**: ang head na nawawala sa bawat structure, bilang bahagi ng velocity head V²/2g ng tubong lumalabas dito.
- **Water level at the outlet**: ang tailwater, kung saan nauubos ang huling tubo. Iwanang walang laman kapag malaya ang outlet.

## Paano nagdaragdag ang mga flow

Dinadala ng bawat tubo ang bawat catchment sa itaas nito. Q = C × i × A, kung saan ang C × A ay sinusuma pababa sa network at ang i ay ang intensity sa pinakamahabang time of concentration ng tubig na dumarating: ang sariling oras ng catchment, o ang oras mula sa upstream na catchment kasama ang travel time sa mga tubo (haba ÷ velocity kapag puno ang tubo). Ang Q ay nasa cubic feet per second (A sa acres) o cubic meters per second (A sa hectares).

## Sukatin ang mga tubo

Ipinapakita ng table sa ilalim ng **Mga flow at grade line** para sa bawat tubo ang flow, ang kayang dalhin nito kapag puno sa sarili nitong slope, ang velocity, ang hydraulic grade sa itaas at paanan nito, at kung gaano kalalim ang daloy.

**Sukatin ang mga tubo para sa mga flow na ito** ay nagbibigay sa bawat tubo ng pinakamaliit na standard size na kayang magdala ng flow nito sa sarili nitong slope (12 hanggang 72 in, o 300 hanggang 1800 mm). Isang step ito. Mananatili sa lugar ang inverts: kung nagbago ang mga sukat, gamitin ang {{ui:Itakda ang lahat ng invert ayon sa mga patakaran}} para mapanatili ang cover, saka i-check muli ang table.

## Basahin ang grade lines

Kinakalkula ang hydraulic grade line (HGL) mula sa outlet paakyat:

- Ang tubong bahagyang puno ang daloy ay may HGL nito sa water surface: ang invert plus ang normal depth.
- Kapag mas mataas ang tubig sa ibaba kaysa crown nito, o nagdadala ito ng higit sa kaya nitong dalhin kapag puno, napupuno ito (surcharged) at tumataas ang HGL nito ayon sa friction slope sa haba nito.
- Sa bawat structure, ang HGL ay ang top HGL ng tubong lumalabas plus ang junction loss.
- Ang energy grade line (EGL) ay ang HGL plus ang velocity head.

Nakalista ang tubong punô ang daloy, gayundin ang anumang structure kung saan lampas sa rim ang HGL: umaabot doon ang tubig sa ibabaw, at may pulang bilog ang structure sa plan. Piliin ang tubo o structure para makita ang flow, lalim, velocity at parehong grade line nito sa Properties nito.

## Mag-route ng storm

Ang rational method ay nagbibigay ng isang peak para sa bawat tubo. Ang {{ui:I-route ang storm}} (sa ilalim ng results, sa Properties ng network) ay kinakalkula ang buong storm: ang runoff ng bawat catchment sa paglipas ng panahon, dinadala pababa sa mga tubo kasama ang travel time at storage nito, at idinadagdag kung saan sila nagsasalubong.

1. Iwanang walang laman ang {{ui:Tatagal ang ulan}} at {{ui:Intensity ng ulan}} para gamitin ang pinakamahabang time of concentration at ang rainfall curve sa itaas, o i-type ang sarili mong halaga.
2. Pindutin ang {{ui:I-route ang storm}}. Ipinapakita ng table para sa bawat tubo ang pinakamataas na flow papasok at palabas, kung gaano kababa ang outgoing peak, kung gaano kalaki ang nagagamit sa buong kapasidad ng tubo, at ang minutong umaabot ito sa peak.
3. Bawat outlet ay may maliit na chart ng flow sa paglipas ng oras at {{ui:I-download ang hydrograph (CSV)}}.

Ang catchment ay nagpapadala ng ulan na average sa time of concentration nito, kaya ang storm na mas maikli kaysa rito ay mas mababa ang peak kaysa C × i × A. Bawat tubo ay dinadaanan ng Muskingum–Cunge method, gamit ang flow-depth na nahanap na ng rational method. Hindi sabay umaabot sa peak ang dalawang sanga na magkaiba ang time of concentration, kaya mas mababa ang sum nila kaysa sa sum ng kanilang mga peak.

Hindi nito minomodelo ang surcharge, backwater, storage sa mga structure, o pagbaha. Ang tubong lampas ang routed peak sa buong kapasidad nito ay nakalista, at ipinapasa ang tubig nito na parang kasya. Gamitin ito para makita ang timing at attenuation, hindi para sukatin ang tubo. Pantulong ito sa pagkalkula: dapat itong i-check ng isang engineer.

## Naka-save sa project

Naka-save sa project file ang mga catchment at storm settings. Wala pa ang mga ito sa PDF plot, DWG o DXF, o LandXML: tingnan ang [Hindi pa ginagawa](topic:not-built-yet).
