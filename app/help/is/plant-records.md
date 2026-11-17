---
title: Plöntufærslur, yrki og afhentar stærðir
summary: Plöntulisti verkefnisins þíns sem tafla: yrki, afhentar stærðir (ílát, rótarhnaus, stofnummál, hreinn stofn), þéttleiki, forskriftarathugasemdir, CSV inn og út; hver sett planta tilgreinir stærð; plöntutákn eftir mælikvarða og þín eigin tákn og 3D-líkön.
keywords: plöntutafla, plöntugagnagrunnur, yrki, afbrigði, afhent stærð, ílát, rótarhnaus, rótarklumpur, beræturnar, stofnummál, hreinn stofn, þéttleiki, plöntur á fermetra, forskrift, forskriftarathugasemdir, plöntutákn, blokk, eigið tákn, 3D-planta, ítarleikastig, mælikvarði
from: 12251beb
---

Opnaðu {{ui:Plöntutafla}} úr valmyndinni {{ui:Meira}} í Landslags-hópnum, eða úr hlutanum **Plöntur**. Hver röð er plöntufærsla á þessum lista verkefnisins (færsla af plöntulistanum er afrituð inn þegar þú bætir henni við). Sérhver breyting er athuguð eins og innflutt skrá og er eitt afturköllunarskref.

## Dálkarnir

- **Grasafræðiheiti**, **Algengt heiti**, **Gerð**, **Hæð** og **Útbreiðsla** við fullan vöxt (metrar).
- **Bil** (frá miðju til miðju) eða **Þéttleiki** (plöntur á m²). Beð af færslu með þéttleika og engu bili er fyllt með þeim þéttleika, í sínu eigin mynstri (þríhyrningslaga eða ferkantað).
- **Afhentar stærðir**: ein færsla fyrir hverja stærð, aðskildar með `;`. Hver færsla er auðkenni, tegund (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) og svo eitthvað af: rúmmál `10L`, hæð `h0.6`, útbreiðsla `s0.4`, stofnummál `g14-16` (cm), hreinn stofn `st1.8`. Dæmi: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Yrki**: heiti aðskilin með `;`. Yrki heldur sínum eigin stærðum og athugasemdum þegar skráin sem þú fluttir inn hafði þær.
- **Forskriftarathugasemdir**.

{{ui:Tvöfalda}} afritar röð undir nýjum lykli; {{ui:Vista sem CSV}} og {{ui:Vista sem plöntuskrá}} skrifa listann út (CSV-raðir fyrir yrki standa undir sinni tegund, með `cultivar_of`). Innflutningur á CSV- eða plöntuskrá sameinar hana við listann.

## Þinn eigin plöntulisti úr Safni

Skráðu þig inn á CadCraft-aðganginn þinn (Stillingar, Viðbæturnar þínar, Skrá inn) og plöntutaflan getur notað listann sem þú geymir í Safninu:

- {{ui:Af listanum mínum í Safni}} sækir þínar eigin plöntur í Safnið (líka þær sem bíða enn eftir yfirferð). Planta sem þú átt nú þegar hér er uppfærð úr Safninu; yrki, afhentar stærðir, þéttleiki og forskrift sem þú bættir við hér haldast.
- {{ui:Vista sem plöntulista}} vistar hverja röð sem þitt eigið plöntuatriði í Safninu, eitt atriði fyrir hverja tegund: ný planta er nýtt atriði, breytt planta er ný útgáfa, óbreytt planta er látin í friði. Hakaðu í reitinn fyrst: vistun gefur plönturnar almenningi undir CC0. Fyrsta opinbera upphleðsla frá einstaklingi sem er ekki enn treyst er yfirfarin af manneskju áður en hún birtist, eins og hver upphleðsla er.

Safnið geymir grunnfærsluna. Yrki, afhentar stærðir, þéttleiki og forskriftarathugasemdir eru áfram í verkefninu og í plöntuskránni ({{ui:Vista sem plöntuskrá}}); glugginn segir hversu margar raðir það varðar í hvert skipti sem þú vistar.

## Sett planta tilgreinir stærð

Veldu plöntu, limgerði eða blöndunarröð í beði eða gróðursvæði: þegar færslan hefur yrki eða afhentar stærðir velur {{ui:Yrki og stærð}} eina þeirra. Plöntulistinn telur þá eftir tegund, yrki og stærð, og merking getur sýnt þau: `{botanical} '{cultivar}' {size}` eða `{full}`.

## Plöntutákn eftir mælikvarða

{{ui:Myndmerki gróðurs}} (Landslag › Meira) stillir hvernig plöntur eru teiknaðar í grunnmynd: **sjálfvirkt** (grófara en 1:500 hringur á útbreiðslu, á milli 1:200 og 1:500 útlína með miðju, fínna ítarlegt tákn; báða mælikvarða má breyta) eða eitt stig fyrir alla mælikvarða. Blaðaglugginn hefur sína eigin **Ítarleiki gróðurs í grunnmynd** fyrir það sett.

Á færslu í hlutanum **Plöntur** les {{ui:Eigið tákn…}} SVG-skrá, eða blokk úr DXF/DWG-teikningu, og teiknar hana í útbreiðslu plöntunnar á ítarlegu stigi. {{ui:Eigið 3D-líkan…}} les OBJ, STL eða GLB; í Myndmerki gróðurs veldu **Eigið líkan hverrar færslu** til að sjá það í 3D. Skrár eru takmarkaðar (512 KB af SVG, 2000 form, 50 000 þríhyrningar) og vistaðar í verkefninu. SVG-umbreytingar eru ekki notaðar (þér er sagt þegar skrá hefur þær). Sjá [Myndmerki gróðurs, þín eigin tákn og 3D-plöntur](topic:plant-graphics) fyrir stigin, takmörkin og hvað GLB má innihalda.
