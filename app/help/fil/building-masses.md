---
title: Gumuhit ng building mass sa site
summary: Gumuhit ng building mass sa isang parcel, bigyan ito ng palapag at taas ng palapag, tingnan ang gross floor area nito, piliin kung paano ito nakapuwesto sa dalisdis na lupa, itulak at hilain ang taas nito sa 3D, at ipadala sa BimCraft o i-save bilang IFC file.
keywords: mass, massing, building mass, volume, footprint, palapag, taas ng palapag, gross floor area, GFA, slope, podium, cut at fill, push pull, 3D, pag-aaral ng site, maagang disenyo, IFC, develop, BimCraft, A-MASS
from: e5a67c16
---

Ang building mass ay isang footprint, bilang ng palapag at taas ng palapag: ang maagang tanong na "gaano karaming gusali ang kasya rito, at ano ang epekto nito sa lupa". Nakalagay ang mass sa plano kasama ang pangalan, bilang ng palapag at gross floor area nito, napupunta sa PDF plot at sa DWG at DXF export sa mga layer na `A-MASS` at `A-MASS-TEXT`, at sine-save sa project file.

## Gumuhit ng mass

1. Sa **Mga katangian**, sa ilalim ng **Mga building mass**, i-click ang **Gumuhit ng mass**. (Nasa menu na **Higit pa** ng toolbar din ito, katabi ng **Surface**.)
2. I-click ang mga sulok ng footprint. Ang click malapit sa sulok ng parcel o sa survey point ay kumukuha sa eksaktong pwesto ng puntong iyon.
3. I-click muli ang unang sulok, o pindutin ang {{key:Enter}}, para tapusin. Inaalis ng {{key:Backspace}} ang huling sulok; hihinto ang {{key:Esc}}.

Ang bagong mass ay may tatlong palapag at taas ng palapag na 12 ft (3.6 m), at kabilang sa parcel kung saan nahuhulog ang gitna nito.

## Palapag, taas at lawak

I-click ang isang mass para baguhin ang **Pangalan**, **Gamit**, **Palapag**, **Taas ng palapag** at **Parcel**. Ang **Height** ay palapag na pinarami sa taas ng palapag: mag-type ng taas at ang bilang ng palapag ay magiging pinakamalapit na buong bilang (hindi kailanman mas mababa sa isa). Ang **Footprint** at **Gross floor area** (footprint na pinarami sa palapag) ay kinakalkula para sa iyo.

## Sa dalisdis na lupa

Ang lupang nasa ilalim ng mass ay binabasa mula sa surface: umiiral na lupa, o ang graded na lupa kung saan mo pinili ang **Proposed ground (graded)**. Sinasabi ng **Sa dalisdis na lupa** kung saan ilalagay ang ground floor:

- **Stepped**: sa karaniwang lupa sa ilalim ng footprint. Pinupuno hanggang dito ang mababang bahagi at pinpuputol ang mataas na bahagi, at halos nagbabalanse ang dalawa.
- **Podium**: sa pinakamataas na lupa. Pinupuno ng solidong base ang mababang bahagi.
- **Cut**: sa pinakamababang lupa. Pinuputol palayo ang mataas na bahagi, papasok sa burol.

Ipinapakita ng Mga katangian ang saklaw ng lupa sa ilalim ng mass, ang **Ground floor level**, at ang volume ng fill at cut sa pagitan ng lupa at ng antas na iyon. Ang bahagi ng footprint na nasa labas ng surface ay hindi isinasama, at sinasabi ng Mga katangian kung ilan ang mga ito.

## Sa 3D view

Iginuguhit ang mass sa 3D site view, may linya sa paligid ng bawat palapag at ang mga pangalan nito sa ibabaw ng bubong. Ang **Show** ay may check box para sa **Mga building mass**. I-click ang isa para piliin ito. Kapag napili ang mass:

- i-drag ang bubong nito pataas o pababa para itulak o hilain ito isang palapag sa bawat pagkakataon, o pindutin ang {{key:PageUp}} at {{key:PageDown}};
- isang hakbang lang sa undo ang buong paggalaw.

Nakikita rin ng street view ng **Drive** ang mga mass, at inihahagis ng **Sun** ang kanilang anino sa lupa.

## Ipadala pa

- **Masses as IFC** ay nagse-save ng bawat mass bilang IFC4 file: isang site, isang gusali na may mga storey nito, at ang mass bilang building element na may mga numero nito sa property set na `CadCraft_SiteMass`. Kapag may coordinate system na nakatakda sa proyekto, nakalagay ang file sa mapa at dala ang latitude at longitude ng site; kung wala, walang sinasabi ang file tungkol sa lokasyon nito.
- **Develop in BimCraft** ay nagbubukas ng BimCraft sa bagong tab kasama ang mga mass. Doon, kapag pinili ang isang mass, lalabas ang mga numero nito at ang **Develop this mass**, na gumagawa ng mga pader sa bawat level at sahig sa ilalim ng gusali mula sa footprint, sa isang hakbang lang sa undo. Walang ina-upload: naipapasa ang file sa pagitan ng dalawang tab ng browser na ito.

Tingnan din ang **Zoning limits** at **Oras ng araw**.
