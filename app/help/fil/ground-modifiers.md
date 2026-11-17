---
title: Ground modifiers at live na level
summary: Lahat ng humuhubog sa proposed ground sa iisang may-ayos na listahan (ang mas huli ang nananaig kapag nagsasapaw), cut and fill bawat modifier, junction check sa Problems panel, at mga spot level at gradient arrow na live na bumabasa ng ground.
keywords: ground modifiers, stack, pagkakasunod, proposed ground, existing ground, pagsasapaw, cut and fill, junction, retaining wall, paving edge, bed level, step landing, spot level, spot height, gradient arrow, slope label, falls
from: 3998a5b0
---

Proposed ground = existing ground + mga modifier, ayon sa pagkakasunod. Hindi kailanman binabago ang existing ground.

## Ang listahan

{{ui:Levels}} › {{ui:Ground modifiers…}} ay naglilista ng bawat object na humuhubog sa ground: platforms, berms, swales, grading areas, paving at paths, planted areas na may finished level, at steps at ramps na naka-tick ang **Humuhubog sa ground** (kasama ang kanilang bottom at top level). Kapag nagsasapaw ang dalawa, ang **mas huli** ang nananaig. I-drag ang isang row, o gamitin ang mga arrow, para baguhin ang pagkakasunod; agad na muling binubuo ang ground. Ipinapakita ng bawat row ang cut and fill nito (ang hinuhubog nito pagkatapos ng mga nasa itaas), at may kabuuan sa ilalim ng listahan.

## Mga junction check

Ipinapakita ng Problems panel, kasama ang **Pumunta sa**:

- pader na ang high side ay nasa itaas ng top nito (lupa sa ibabaw ng pader), o na ang low side ay nagpapakita ng footing nito;
- planted area na ang finished level ay nasa itaas ng paving edge na pinagtatagpuan nito, o higit sa karaniwang 150 mm sa ibaba nito;
- steps na ang bottom o top ay hindi nagtatagpo sa paving na pinaglalapagan nila;
- dalawang modifier na nagsasapaw (ang mas huli ang nananaig doon).

Maaaring sundan ng top ng retaining wall ang high side ng ground: muling kinakalkula ang taas nito tuwing magbabago ang ground.

## Retaining wall na humuhubog sa ground

Piliin ang retaining wall at lagyan ng tick ang **Humuhubog sa ground**. Ang strip sa ilalim ng pader (kasing-lapad ng kapal ng pader) ay sumasali sa listahan bilang modifier:

- ang gilid sa **high side** ay hawak sa ground doon, station by station, kaya sumusunod ang top ng pader sa high side (kasama ang coping sa itaas). I-type ang level sa **Top** at hahawakan nito ang high side sa level na iyon na minus ang coping;
- ang gilid sa **low side** ay hawak sa level na **Ground na hawak sa low side** na itine-type mo, o, kung blangko, sa ground doon;
- ang high side ay ang panig na mas mataas ang ground sa buong pader, kaya hindi ito nagpapalit sa kahabaan ng pader;
- hindi binabago ang ground na lampas sa strip, at hindi kailanman ang existing ground.

Tulad ng anumang modifier, nasa listahan ito, at ang modifier na nakalista pagkatapos nito ang nananaig kung nagsasapaw sila. Ang pader na ang hawak na level sa isang dulo ay higit sa karaniwang 150 mm mula sa existing ground doon ay may babala sa Problems panel (kasama ang **Pumunta sa**). Hindi humuhubog ng ground ang freestanding na pader. Naka-off ang box sa mga file mula sa naunang build, kaya bukas ang mga ito gaya ng dati.

## Spot level at gradient arrow

{{ui:Spot level}} (isang click) at {{ui:Gradient arrow}} (dalawang click) ay bumabasa ng ground sa bawat pagguhit ng mga ito: kapag inilipat o muling in-level ang isang object, sumusunod ang mga label. Sa Properties, piliin kung ang label ay bumabasa sa proposed o sa existing ground; ipinapakita ang mga label ng existing ground sa loob ng bracket. Tumuturo ang mga arrow pababa ng slope at nagsasabing `1:20 (5.0 %)`.
