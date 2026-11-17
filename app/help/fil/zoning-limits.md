---
title: Suriin ang mga mass laban sa mga zoning limit na tina-type mo
summary: I-type ang mga setback ng isang lot linya-linya, isang height limit, isang sky-exposure plane, isang floor area ratio at isang coverage, tingnan ang buildable envelope sa plano, at basahin kung aling mga mass ang lumalabag sa aling limit.
keywords: zoning, setback, setbacks, harap, gilid, likod, envelope, buildable area, height limit, sky exposure plane, floor area ratio, FAR, coverage, lot, parcel, ordinansa, pagsusuri ng code
from: 3e267b31
---

**Walang zoning code ang CivilCraft.** Hindi nito alam ang anumang panuntunan ng lungsod at hindi ito nagdadala ng library ng mga ito. Bawat numero sa pahinang ito ay tina-type mo, mula sa sarili mong ordinansa, at sinasabi ng bawat resulta na sinusukat ito laban sa mga limit na tina-type mo. Paraan ito para makita kung paano hinuhubog ng mga limit ng lot ang isang gusali, hindi isang desisyon kung pinapayagan ang isang disenyo.

## I-type ang mga limit

Sa **Properties**, sa ilalim ng **Mga building mass**, pumili ng **Parcel** (o piliin ang isang mass: lumalabas sa ilalim nito ang mga limit ng parcel nito). Pagkatapos, punan ang mga angkop; iwanang walang laman ang kahon para sa "walang limit":

- **Linya sa kalsada**: ang linya ng lot sa kalsada. Ang **Front setback** ang nalalapat dito, ang **Rear setback** sa linyang pinakakabaligtaran nito, at ang **Side setback** sa natitira.
- **Limit sa taas**.
- **Sky plane**: nagsisimula ito sa isang taas sa linya ng lot at tumataas ng halagang tina-type mo sa bawat 1 ng run papasok, sinusukat mula sa linya ng kalsada o mula sa bawat linya ng lot (ang 2 ay nangangahulugang 2 papuntang 1). Ang taas na pinapayagan sa isang punto ay ang pinakamababa sa plane at sa height limit.
- **Floor area ratio** (gross floor area ng mga mass sa lot na hinati sa lawak ng lot) at **Coverage** (footprint ng mga ito na hinati sa lawak ng lot, tina-type sa porsiyento).

## Ang envelope

Lagyan ng tsek ang **Ipakita ang envelope sa plano** para iguhit ito sa layer na `A-MASS-ENVL`. Ang envelope ay ang lot na pinaliit mula sa bawat linya ng lot ayon sa sariling setback ng linyang iyon, na nagtatagpo ang mga offset na linya sa mitred na sulok. Ang linya ng lot na binubuo ng kurba ay kinukuha bilang maikling chord na nasa loob ng 0.01 mula sa kurba. Gumagana ang parehong convex at concave na lot. Kung magtiklop ang mga setback sa sarili nila (malalim na setback sa makitid o napakalukong lot), walang envelope, at sinasabi ito ng Properties; subukan ang mas maliliit na distansya.

## Ang resulta

Sa ilalim ng mga kahon, may linya ang bawat mass at bawat limit, na may tsek o ekis:

- **setback**: ang lawak ng mass na nasa labas ng envelope;
- **taas**: ang taas ng mass laban sa pinakamarami na pinapayagan sa ibabaw ng footprint nito (ang prism na may iisang taas ay nililimitahan ng pinakamababang pinapayagang taas sa alinman sa mga sulok nito);
- **floor area ratio** at **coverage**: lahat ng mass sa parcel na pinagsama-sama.
