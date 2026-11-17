---
title: "Klima sa hinaharap: baha, init at wildfire noong 2050 at 2080"
summary: Sa Address papunta sa site, itaas ang flood level ng site para sa klima sa hinaharap, suriin ang exposure sa wildfire at baguhin ang weather file, ihambing sa future, mula sa climate data pack (SSP2-4.5 at SSP5-8.5, 2050 at 2080).
keywords: klima, climate change, future, 2050, 2080, ssp, cmip6, scenario, sea level, flood, base flood elevation, bfe, fema, init, weather file, epw, morph, wildfire, bushfire
from: b0d2ee38
---

Ang mga figure ng klima ay galing sa isang **data pack**, hindi sa app. I-on ang add-on na {{ui:Climate futures}} sa Mga setting › Add-on, o mag-load ng sarili mong pack file sa block na {{ui:Climate future}}.

:::warning
Ang pack na kasama ng add-on ay isang **sample**: tatlong lugar (Denver, Miami, Johannesburg), isang climate model, limang taon sa bawat 20-taong panahon. Nandiyan ito para subukan ang mga tool, **hindi para sa disenyo**. Ang buong pack ay ginagawa gamit ang `tools/climate/build-pack.mjs` mula sa NASA's NEX-GDDP-CMIP6 data.
:::

## Saan ito matatagpuan

Surface › Higit pa › Address papunta sa site. Itakda ang punto, idagdag ang mga layer (ang FEMA flood layer ay nagbibigay ng base flood elevation) at pindutin ang button na nagbabasa ng site. Sa ilalim ng mga hilera ng site ay ang block na {{ui:Climate future}}: pumili ng **Scenario** (SSP2-4.5 o SSP5-8.5) at **Year** (2050 = 2041-2060, 2080 = 2071-2090, parehong laban sa 1995-2014). Ang lugar sa pack na pinakamalapit sa punto ang ginagamit, o ang pinili mo; kapag malayo sa bawat lugar, ginagamit ang global average na pagbabago at sinasabi ito ng panel.

## Design flood level

Ang kasalukuyang level ay ang base flood elevation ng FEMA kapag mayroon ito ang flood layer (feet, NAVD 88), kung hindi, mag-type ng sarili mo. Piliin ang uri ng baha (coastal, river o heavy rain, o pareho), ang lalim ng baha sa site para sa bahagi ng ulan, at freeboard kung gusto mo. Ipinapakita ng {{ui:Itaas ang flood level}} ang kasalukuyan at hinaharap na level nang magkatabi, ang mga bahagi ng sea-level at ulan, at ang mga pagpapalagay: idinadagdag ang buong pagtaas ng sea level sa coastal na level; ang daloy ng ilog ay tumataas nang isa-sa-isa sa pinakabasang araw na ulan at ang lalim ay sumusunod sa daloy na nakataas sa lakas na 0.6 (Manning, malapad na channel); idinadagdag ang mga bahagi.

:::warning
Pag-screen lamang ito ng pagbabago, hindi isang flood study. Ang design flood level ay sa awtoridad o sa engineer mo.
:::

## Exposure sa wildfire (screening lamang)

Ang pinakamalapit na halaman, ang pataas na dalisdis mula rito at ang distansya ang nagbibigay ng banda mula very low hanggang extreme, ngayon at sa hinaharap (pinapaparami ng hinaharap ang pagbabago ng fire-weather index ng pack). **Screening lamang:** sarili naming relatibong sukat para malaman kung kailangan ng site ng tamang wildfire assessment; hindi ito code rating.

## Init: isang future weather file

Pumili ng kasalukuyang `.epw` file at {{ui:Gawin ang future weather file}}: binabago ito gamit ang nalathalang paraan ng shift at stretch (Belcher, Hacker at Powell 2005) at inihahambing ang init (average at pinakamainit na temperatura, design temperature, oras na higit sa 30 °C at 35 °C, degree-day). {{ui:I-save ang future weather file}} ay nagse-save nito para sa Environment panel, sa energy check ng BimCraft o sa sarili mong mga tool.

## Saan galing ang mga numero

NASA NEX-GDDP-CMIP6 (downscaled na CMIP6 model output, CC BY 4.0 bawat model) para sa temperatura, humidity, sikat ng araw, ulan at fire weather; ang global mean ng IPCC AR6 para sa pagtaas ng sea level maliban kung may lokal na figure ang pack. Ipinapakita ng panel ang source, lisensya at petsa ng pack.
