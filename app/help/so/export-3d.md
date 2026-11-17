---
title: Dhoofi goobta 3D ahaan
summary: Waxa muujinaya muuqaalka 3D u kaydi fayl GLB ama OBJ ah barnaamijyada 3D kale, mitirro iyo Y kor, iyada oo asal maxalli ah oo fayshu diiwaangeliyo.
keywords: glb, gltf, obj, dhoofinta 3D, dhoofinta 3D, dhoofinta moodeelka, mishiinka ciyaarta, muujinta, daawaha 3D, mitirro, Y kor, asal, asal maxalli ah, state plane
from: 07d23992
---

Muuqaalka 3D wuxuu dhoofiyaa waxa muujinayo sida moodel 3D ah oo barnaamij kale furi karo: daawaha 3D, moodelke, mishiinka ciyaarta ama qalabka muujinta.

## Dhoofin

1. Fur muuqaalka 3D ({{key:D}}) oo dooro waxa muuqda adiga oo isticmaalaya {{ui:Show}}. Waxa qarsan lama dhoofin.
2. Riix {{ui:GLB}} ama {{ui:OBJ}} barta.
   Faylka waxa uu soo dejiyaa magaca "*magaca mashruuca*-3d.glb" ama "-3d.obj", status bar-kana wuxuu sheegaa asalka.

## Waxa faylalku ku jiraan

| | GLB | OBJ |
|---|---|---|
| Dusha | Meshes oo leh normals iyo midabyada heerka ama dusha | Meshes oo leh normals (midab la'aan) |
| Tuubooyinka iyo qaab-dhismeedyada | Meshes goobo, kuwa dhibaatada leh oo casaan ah | Meshes goobo |
| Kontuurada, xarriiqyada jabinta, khadadka waddada, calaamadaha, xarriiqyada koridorka iyo padka | Xarriiqyo, set kasta midabkiisa | Diiwaanno xarriiqyo (`l`) |
| Barooyinka sahanka | Barooyin | Diiwaanno barood (`p`) |

Set kasta wuxuu hayaa magacisa ("Dhulka jira", "Tuubooyinka", "Kontuurada weyn" iyo kuwa kale), si aad u qarsan karto ama u qaabeyn karto barnaamijka kale.

## Cabbirka, tirooyinka iyo asalka

- **Mitir.** Mashruuc fiit ah waxa loo beddelaa fiit US survey (1 ft = 1200/3937 m).
- **Y kor**, sida caadiga ah ee qaababkan: bari wuxuu noqdaa +X, dhererka +Y, woqooyina −Z.
- **Miisaan dhab ah.** Ballaadhinta dhererka ee muuqaalka lama dabaqo.
- **Asal maxalli ah.** Isku-xidhyada state plane waa malaayiin fiit, oo waaweyn marka loo eego lambarrada dhaqdhaqaaqa ah ee qaababkan kaydiya, sidaas darteed faylku waa la qoraa iyada oo laga eegayo asal dhow: asalka dhulka jira ee bari iyo woqooyiga, iyo dhererka ugu hooseeya ee la hoos u dhigay. Asalka, unugyada mashruuca ku jira, waa la diiwaangeliyaa faylka: GLB-ga `extras` ahaan scene-ka iyo node-ka sare, OBJ-ga xarriiq faallo ah oo u dhow bilowga (`# origin easting … northing … elevation …`). Si aad moodelka dib ugu geesiso isku-xidhyada mashruuca, ku dar asalka (kadib markaad mitirrada dib ugu beddesho fiit haddii mashruuca uu fiit yahay).

## Weli lama dhisin

- Dhoofinta muuqaalka ballaadhsan, ama dhoofinta unugyada mashruuca halkii mitirka.
- Teksachar, faylka alaabta OBJ (.mtl) iyo sifooyinka shay kasta (magacyada tuubooyinka iyo qaab-dhismeedyada waxa kaliya ku jira CivilCraft).
- Dhoofinta koridorka oo ah jirmo kala goosan, ama muuqaalka profile-ka 3D ahaan.
