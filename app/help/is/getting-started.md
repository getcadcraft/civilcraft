---
title: Byrjað með CivilCraft
summary: Hvað CivilCraft gerir, hvernig það er opnað og fyrstu tíu mínúturnar með sýnishornssvæðinu, frá punktum yfir í hæðarlínur, veg og vistað verkefni.
keywords: byrjun, fyrsta keyrsla, sýnishornssvæði, kynning, flýtiræsing, kennsla, byrja, nýtt verkefni
from: c9b6dd8e
---

CivilCraft er forrit fyrir mannvirkja- og svæðishönnun úr CadCraft-fjölskyldunni. Það tekur mælipunkta og breytir þeim í yfirborð (TIN) með hæðarlínum, og leyfir þér síðan að leggja út veglínur með hönnunarlangsniðum, teikna einfalt vegarbelti, móta byggingarpalla niður að skurðlínu, athuga þyngdarpípunet út frá reglum þínum og sjá rúmmál skurðar og fyllingar. Það les og skrifar LandXML, flytur grunnmyndina út sem DXF og prentar hana í PDF.

Ef þú hefur notað Civil 3D eru hugmyndirnar kunnuglegar: punktar, punktahópar, brotlínur, veglínur eftir PI, langsnið eftir PVI, vegarbelti, mótun, pípunet. Vinnulagið er öðruvísi og mun minna: það er engin skipanalína, engir stílar og engin teikniskrá. Lestu [Frá öðrum mannvirkjahugbúnaði](topic:coming-from) einu sinni áður en þú tekur þitt fyrsta raunverulega verk.

## Það sem þú þarft

- Nýlegan skjáborðsvafra: Chrome, Edge, Firefox eða Safari. Sjá [Vafra](common:browsers).
- Mús eða snertiflöt og lyklaborð, eða snertiskjá: teikning hefur þá á skjánum hnappana {{ui:Ljúka}}, {{ui:Afturkalla punkt}} og {{ui:Hætta við}} (sjá [Mús, snertiflöt og snerting](topic:keyboard#mouse-trackpad-and-touch)).
- Grunnmyndin teiknast í 2D á striga vafrans. [Þrívíddarsýnin](topic:site-3d) notar WebGL-grafík vafrans; ef hún getur ekki ræst segir stöðustikan hvers vegna og grunnmyndin virkar samt.
- Enginn aðgangur og engin upphleðsla. Skrár opnast í tölvunni þinni og vistast sem niðurhöl. Sjá [Skrárnar þínar](common:your-files).

:::note
CivilCraft keyrir núna sem snemmbúin vafrasmíð sem enn er í vinnslu. Skjáborðsútgáfur eru ekki komnar enn og skýjavistun er ekki komin enn. Allt sem þú býrð til er áfram í tölvunni þinni þangað til þú vistar eða flytur það út.
:::

## Opna CivilCraft

1. Opnaðu CivilCraft í vafranum þínum.
2. Bíddu eftir að skjárinn fyllist: tækjastika yfir efstu brún, spjald vinstra megin, grunnmyndin í miðjunni og spjald með **Eiginleikum** hægra megin.
3. Á tómri grunnmynd sérðu reit með titlinum **Byrjaðu með mælipunktum**. Hann telur upp fyrstu skrefin og hefur tengil, {{ui:Opna sýnishornssvæði}}.

Til að nota CivilCraft án nettengingar síðar, smelltu á {{ui:Vista til notkunar án nettengingar}} í forritastikunni og bíddu eftir {{ui:Tilbúið án nettengingar}}. Það inniheldur þessa hjálp, sýnishornssvæðið og þrívíddar- og GIS-söfnin. Sjá [Án nettengingar](common:offline). Ýttu á {{key:F1}} eða smelltu á {{ui:Hjálp}} hvenær sem er til að opna þessa hjálp við hliðina á forritinu.

## Fyrstu tíu mínúturnar: sýnishornssvæðið

Sýnishornssvæðið er lítil mæling í US-fetum: 276 punktar í state plane-hnitum, hryggur, lækjarfarvegur með rennslislínu og tveir bakkatoppar. Það fylgir forritinu, þannig að þú getur fylgt með án skráar af þínum eigin.

1. Smelltu á {{ui:Opna sýnishornssvæði}} í reitnum á grunnmyndinni.
   Gluggi **Flytja inn punkta** opnast. Þar stendur „276 punktar lesnir sem PNEZD (úr hausröðinni), aðskildir með kommum.“ og sýnir fyrstu línurnar.
2. Smelltu á {{ui:Flytja inn}}.
   Grunnmyndin fyllist af punktum, hæðarlínum og jaðri yfirborðsins. Stöðustikan neðst segir að punktarnir hafi verið fluttir inn og hversu marga þríhyrninga yfirborðið hefur (546).
3. Skoðaðu vinstra spjaldið undir **Punktar**. Punktarnir eru flokkaðir eftir fyrsta orði lýsingar þeirra: CP, FL, GRD, RIDGE, TBN, TBS og TREE.
4. Í dálknum **Yfirborð** í þeirri töflu, stilltu **FL**, **RIDGE**, **TBN** og **TBS** á {{ui:Brotalína}}.
   Yfirborðið byggist upp aftur samstundis. Staðreyndir **Yfirborðs** segja nú „Brotlínur: 4“, og hæðarlínurnar beygjast snarpt eftir rennslislínunni og hryggnum í stað þess að skera þvert yfir þær.
5. Færðu bendilinn yfir grunnmyndina. Stöðustikan sýnir austur- og norðurhnit undir bendlinum og hæð landsins þar.
6. Undir **Birting** stilltu {{ui:Hæðarlínur á}} á 0.5 ft og kveiktu á {{ui:Hæðarbil}}. Litaskali birtist með skýringu undir gátreitunum. Slökktu aftur á böndunum þegar þú ert búin/n.

Nú ertu með núverandi landyfirborð. Næst kemur vegur.

## Leggðu út stuttan veg

1. Ýttu á {{key:A}} (eða smelltu á {{ui:Veglína}} í hópnum **Hönnun**).
2. Smelltu á þrjá punkta yfir svæðið, hvern á eftir öðrum. Rauð lína fylgir bendlinum og sýnir lengd og stefnu næsta snertils.
3. Ýttu á {{key:Enter}} til að ljúka.
   Veglínan birtist með stöðvasetningu. Hægra spjaldið sýnir **Veglína**: lengd hennar, PI-töfluna og boga við miðja PI-punktinn (100 ft radíus, eða minni ef 100 ft passar ekki).
4. Í hægra spjaldinu, undir **Hönnunarlangsnið**, smelltu á {{ui:Byrja á landinu}}.
   Langsniðssýnin opnast undir grunnmyndinni með núverandi landi og beinum hönnunarhalla frá enda til enda.
5. Ýttu á {{key:I}} til að kveikja á {{ui:Bæta við PVI}}, smelltu síðan einu sinni í langsniðssýninni nálægt miðjunni. PVI birtist.
6. Í PVI-töflunni hægra megin skaltu slá inn bogalengd (til dæmis 100) í reitinn **Bogi L** fyrir miðja PVI-ið og ýta á {{key:Enter}}. Langsniðið hefur nú lóðréttan boga, með merktu K-gildi hans.
7. Undir **Vegarbelti** skaltu haka í **Dragðu samsetningu eftir hönnunarlangsniðinu**.
   Vegurinn er mótaður inn í landið: akreinar, axlir og hliðarhallar niður að skurðlínu. Reiturinn **Jarðvinna** sýnir skurð og fyllingu.

Ekki hafa áhyggjur af nákvæmum gildum. Hvaða tölu sem er má breyta í hægra spjaldinu, og {{key:Mod+Z}} afturkallar síðustu breytingu.

## Vistaðu vinnuna þína

1. Skrifaðu heiti í **Heiti** efst á vinstra spjaldinu.
2. Ýttu á {{key:Mod+S}} (eða smelltu á {{ui:Vista}}).
   Vafrinn sækir skrá sem er nefnd eftir svæðinu og endar á `.civilcraft.json`. Hún geymir punktana, stillingar yfirborðsins, veglínur, snið, vegarbelti, palla og pípur.
3. Til að halda áfram síðar, smelltu á {{ui:Opna}} (eða ýttu á {{key:Mod+O}}) og veldu þá skrá, eða dragðu hana á grunnmyndina.

:::warning
Það er engin sjálfvirk vistun. Ef þú lokar flipanum með óvistuðum breytingum spyr vafrinn hvort þú viljir fara; ef þú ferð, glatast breytingarnar. Vistaðu oft.
:::

## Hvert skal halda næst

- [Flyttu inn mælipunkta](topic:import-points) með þínum eigin skrám.
- [Byggðu upp og betrumbættu yfirborðið](topic:build-surface) með brotlínum og mörkum.
- [Skjárinn, hluti fyrir hluta](topic:workspace).
- [Lyklar og mús](topic:keyboard).
