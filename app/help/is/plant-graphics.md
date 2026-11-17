---
title: Myndmerki gróðurs eftir mælikvarða, eigin tákn og 3D-plöntur
summary: Hvernig plöntur eru teiknaðar í grunnmynd við hvern teikningarmælikvarða og ítarleika, og hvernig plöntufærsla fær þitt eigið tákn (SVG, eða DXF/DWG-blokk) og þitt eigið 3D-líkan (OBJ, STL eða GLB).
keywords: myndmerki gróðurs, plöntutákn, tákn eftir mælikvarða, ítarleiki, ítarleikastig, einfaldur hringur, útlína, ítarlegt tákn, eigið tákn, blokk, svg, dxf, dwg, 3D-planta, eigið 3D-líkan, obj, stl, glb, gltf, trjálíkan, plöntur í 3D
from: 875837d9
---

## Grunnmyndartákn eftir mælikvarða

Landslag › {{ui:Meira}} › {{ui:Myndmerki gróðurs}} stillir hvernig plöntur eru teiknaðar í grunnmynd. **Sjálfvirkt, eftir mælikvarða** velur eitt af þremur stigum út frá teikningarmælikvarðanum:

- **Einfaldur hringur** (grófara en 1:500): hringur á útbreiðslu plöntunnar.
- **Útlína með miðju** (frá 1:500 til 1:200): hringurinn og lítill miðjukross.
- **Ítarlegt tákn** (fínna en 1:200): eigið tákn færslunnar ef hún hefur það, annars innbyggða táknið.

Breyttu mælikvörðunum tveimur með **Einfalt frá 1:** og **Útlína frá 1:**, eða veldu eitt stig fyrir alla mælikvarða. Hvert blaðasafn í blaðaglugganum hefur sína eigin **Ítarleiki gróðurs í grunnmynd**, þannig að 1:500 svæðisáætlun og 1:100 gróðursetningaráætlun geta verið ólíkar. Stillingarnar eru vistaðar með verkefninu.

## Eigið tákn

Veldu plöntu í hlutanum **Plöntur** og ýttu á {{ui:Eigið tákn…}}. Það les SVG-skrá, eða blokk úr DXF- eða DWG-teikningu (ef teikningin hefur margar blokkir velurðu eina). Táknið er löguð að útbreiðslu plöntunnar og teiknað á ítarlegu stigi. Það er vistað í verkefninu, þannig að skráin ferðast með því.

- SVG er lesið fyrir línur, fjöllínur, marghyrninga, rétthyrninga, hringi, sporbauga og slóðir. Skriftur, stílar, tenglar og myndir í henni eru aldrei skoðuð. Umbreytingar eru ekki notaðar: þér er sagt þegar skráin hefur þær, svo flattu þær fyrst í teikniforritinu.
- Takmörk: 512 KB af SVG og 2000 form. Stærri skrá er hafnað og ástæðan gefin.

## Eigin 3D-planta

{{ui:Eigið 3D-líkan…}} á sömu færslu les skrá af gerðinni **OBJ**, **STL** eða **GLB**. Síðan, í Myndmerki gróðurs, stilltu **Plöntur í 3D** á **Eigið líkan hverrar færslu**: hver planta þeirrar færslu sýnir líkanið þitt, skalað að hæð hennar og útbreiðslu. Færslur án eigin líkans halda innbyggðu gerðunum. Veldu **Einfaldir massar** fyrir skjótar myndir af stórum svæðum.

GLB er lesið eingöngu fyrir lögun:

- Allt sem líkanið þarfnast verður að vera innan .glb-skráarinnar. Líkan sem vísar á aðrar skrár (sérstaka .bin-skrá eða myndir með slóð) er hafnað: ekkert er sótt.
- Þjöppuð eða pökkuð rúmfræði (Draco, meshopt, kvanteraðar staðsetningar) er ekki lesin. Fluttu út án þjöppunar.
- Áferð og litir í skránni eru ekki notaðir: líkanið er teiknað í eigin lit plöntunnar. Áferð er samt athuguð og áferð yfir 4096 pixlum á hlið er hafnað.
- Takmörk: 32 MB skrá, 50 000 þríhyrningar (þar sem hvert afrit af hluta sem er settur oftar en einu sinni telst með), 64 myndir og 16 MB af myndum.

Hvert takmark hafnar skránni og gefur ástæðuna; ekkert hálflesið er geymt. Eitt afturköllunarskref gefur færslunni tákn eða líkan, og {{ui:Fjarlægja eigið tákn}} eða {{ui:Fjarlægja eigið 3D-líkan}} tekur það aftur burt.

Sjá [Plöntufærslur](topic:plant-records) fyrir færsluna sjálfa og [Skoða svæðið í 3D](topic:site-3d).
