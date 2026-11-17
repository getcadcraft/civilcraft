---
title: Mga object mula sa linework, nananatiling naka-link
summary: Gumawa ng paving, lugar na may halaman, kama, bakod, path, pader, kerb, hagdan, ramp, platform, swale o feature line mula sa isang linya; sumusunod ito kapag gumalaw ang linya, hanggang i-break mo ang link.
keywords: mula sa linya, linework, DWG, DXF, link, naka-link, sumunod, i-regenerate, break link, feature line, feature line mula sa linework, na-import na layer, outline, supercad studio, linya ng drawing
from: eb67a0c6
---

{{ui:Mula sa linya}} (Landscape › {{ui:Higit pa}}): i-click ang feature line, o ang linya o outline ng isang na-import na DWG/DXF layer. Ang saradong linya ay maaaring gumawa ng paving, lawn, planted bed, meadow, groundcover, bed o platform; ang bukas na linya ay gumagawa ng path, pader, kerb, hagdan (ang una at huling punto nito), ramp, bakod o swale. Maaaring gumawa ng **feature line** ang alinmang uri, maliban sa feature line mismo.

## Feature line mula sa linya

Kinukuha ng feature line na ginawa mula sa linya ang mga punto nito, sarado kung sarado ang linya. Inilalatag ang mga level nito sa umiiral na lupa (0 kung wala pang lupa), at ang gamit nito ay **Off**: wala itong hinuhubog na lupa hanggang pumili ka ng gamit at itakda ang mga level nito sa Properties nito. Kapag gumalaw ang linya, pinananatili ng feature line na may parehong bilang ng punto ang bawat level na itinakda mo; kapag nadagdagan o nabawasan ng punto ang linya, muling inilalatag sa lupa ang mga level. Tingnan ang [Feature lines](topic:feature-lines).

Pinananatili ng bagong object ang isang **link** sa linya nito. Kapag gumalaw ang linya (i-drag mo ang mga punto nito, o ginalaw o muling binasa ang drawing), kinukuha ng object ang bagong hugis sa parehong undo step, at sa pamamagitan ng ground modifiers ay sumusunod ang proposed ground. Sinasabi ng Properties kung ano ang naka-link dito; ginagawa ng {{ui:Putulin ang link}} itong malaya.

Sinusuri muna ang mga linya: kailangan ng linya ng hindi bababa sa 2 punto (3 para sa outline), hanggang 5000, tunay na numero, dapat sarado ang outline at hindi dapat tumawid sa sarili nito. Ang linyang hindi pumasa ay hindi ginagamit: nananatili ang object gaya ng dati at sinasabi ng Problems panel kung bakit. Kung mabura ang linya, mananatili ang object at tatandaan ito ng Problems panel.

## Sa SuperCad Studio

Buksan ang site at ang 2D drawing sa parehong project. Pumili ng isang linya o polyline sa 2D drawing, pindutin ang Ctrl+K at patakbuhin ang {{ui:Landscape object mula sa napiling linya ng drawing}}: itinatanong ng CivilCraft kung ano ang gagawin, gaya ng nasa itaas, at mananatiling naka-link ang object sa linyang iyon ng drawing. Pagkatapos mong baguhin ang mga linya sa drawing, ginagawa ng Ctrl+K ang {{ui:I-update ang landscape mula sa drawing}} na sumunod ang mga object, isang undo step bawat linya. Itinatala ng link file ng project kung aling object ang sumusunod sa aling linya. May sariling help ang SuperCad Studio na may Landscape topic.
