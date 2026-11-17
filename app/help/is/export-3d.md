---
title: Flytja svæðið út í þrívídd
summary: Vistaðu það sem þrívíddarsýnin sýnir sem GLB- eða OBJ-skrá fyrir önnur þrívíddarforrit, í metrum með Y upp, um staðbundinn upphafspunkt sem skráin skráir.
keywords: glb, gltf, obj, flutningur í þrívídd, flytja út þrívídd, flutningur líkans, leikjavél, myndræn framsetning, þrívíddarskoðari, metrar, Y upp, upphafspunktur, staðbundinn upphafspunktur, landshnitakerfi
from: 07d23992
---

Þrívíddarsýnin flytur út það sem hún sýnir sem þrívíddarlíkan sem annað forrit getur opnað: þrívíddarskoðara, líkanagerðarforrit, leikjavél eða myndrænt framsetningarforrit.

## Útflutningur

1. Opnaðu þrívíddarsýnina ({{key:D}}) og veldu hvað birtist með {{ui:Sýna}}. Það sem er falið er ekki flutt út.
2. Smelltu á {{ui:GLB}} eða {{ui:OBJ}} á stikunni.
   Skráin sækist sem „*heiti verkefnis*-3d.glb“ eða „-3d.obj“, og stöðustikan segir upphafspunktinn.

## Hvað skrárnar geyma

| | GLB | OBJ |
|---|---|---|
| Yfirborð | Net með normölum og hæðarbil- eða yfirborðslitum | Net með normölum (án lita) |
| Pípur og mannvirki | Hringlaga net, þau sem eru með vandamál í rauðu | Hringlaga net |
| Hæðarlínur, brotalínur, veglínur, stikur, jaðrar vegsvæðis og flatir | Línur, hvert sett í sínum lit | Línufærslur (`l`) |
| Mælipunktar | Punktar | Punktafærslur (`p`) |

Hvert sett heldur nafni sínu („Fyrirliggjandi land“, „Pípur“, „Meginhæðarlínur“ og svo framvegis), þannig að þú getur falið það eða stílað í hinu forritinu.

## Einingar, ásar og upphafspunktur

- **Metrar.** Fetaverkefni er umreiknað úr bandarískum mælingafetum (1 ft = 1200/3937 m).
- **Y upp**, venjuleg viðmiðun fyrir þessi snið: austurhnit verður +X, kóti +Y og norðurhnit −Z.
- **Rétt mælikvarði.** Lóðrétt ýkjun sýnarinnar er ekki notuð.
- **Staðbundinn upphafspunktur.** Landshnit eru milljónir feta, of stór fyrir tölurnar með einfaldri (single) nákvæmni sem þessi snið geyma, þannig að skráin er skrifuð miðað við nálægan upphafspunkt: eigin upphafspunkt fyrirliggjandi lands fyrir austur- og norðurhnit, og lægsta kóta þess námundaðan niður. Upphafspunkturinn, í einingum verkefnisins, er skráður í skrána: í GLB sem `extras` á senunni og efsta hnútnum hennar, í OBJ sem athugasemdalína nálægt efst (`# origin easting … northing … elevation …`). Til að setja líkanið aftur á hnit verkefnisins skaltu bæta upphafspunktinum við (eftir að metrar hafa verið umreiknaðir aftur í fet fyrir fetaverkefni).

## Ekki smíðað enn

- Útflutningur á ýktri sýn, eða útflutningur í einingum verkefnisins í stað metra.
- Áferðir, efnisskrá fyrir OBJ (.mtl) og eiginleikar einstakra hluta (heiti pípna og mannvirkja eru aðeins í CivilCraft).
- Útflutningur vegsvæðisins sem aðskilinna fasta, eða langsniðssýnarinnar í þrívídd.
